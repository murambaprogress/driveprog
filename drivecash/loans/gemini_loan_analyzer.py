"""
Gemini AI Loan Application Analyzer
This service analyzes loan applications using Google's Gemini AI to provide
intelligent recommendations for loan approval decisions.
"""

import google.generativeai as genai
from decimal import Decimal
import json
import logging
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiLoanAnalyzer:
    """
    Service class for analyzing loan applications using Gemini AI
    """
    
    def __init__(self, api_key=None):
        """
        Initialize the Gemini AI analyzer
        
        Args:
            api_key: Gemini API key (defaults to settings if not provided)
        """
        self.api_key = api_key or getattr(settings, 'GEMINI_API_KEY', None)
        genai.configure(api_key=self.api_key)
        
        # Use Gemini 1.5 Flash for fast analysis
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    def analyze_loan_application(self, application):
        """
        Analyze a loan application and provide AI recommendations
        
        Args:
            application: LoanApplication model instance
            
        Returns:
            dict: Analysis results containing recommendation, risk assessment, and approval suggestion
        """
        try:
            # Prepare application data for AI analysis
            application_data = self._prepare_application_data(application)
            
            # Enforce loan limit rules before AI analysis
            loan_limit_check = self._check_loan_limits(application_data)
            
            # Generate the analysis prompt
            prompt = self._create_analysis_prompt(application_data)
            
            # Call Gemini AI
            logger.info(f"Analyzing loan application {application.application_id} with Gemini AI")
            response = self.model.generate_content(prompt)
            
            # Parse the response
            analysis_result = self._parse_ai_response(response.text)
            
            # Override AI suggestion if loan limits are violated
            if not loan_limit_check['within_limits']:
                analysis_result['approval_suggestion'] = 'reject' if loan_limit_check['exceeds_by_large_margin'] else 'conditional'
                analysis_result['key_concerns'].insert(0, loan_limit_check['message'])
                analysis_result['suggested_loan_amount'] = loan_limit_check['max_eligible_amount']
                if not loan_limit_check['exceeds_by_large_margin']:
                    analysis_result['conditions_for_approval'].insert(0, f"Reduce loan amount to ${loan_limit_check['max_eligible_amount']:,.2f} or less")
            
            # Add metadata
            analysis_result['raw_response'] = response.text
            analysis_result['analyzed_at'] = datetime.now().isoformat()
            analysis_result['application_id'] = str(application.application_id)
            analysis_result['loan_limit_check'] = loan_limit_check
            
            logger.info(f"Successfully analyzed application {application.application_id}")
            logger.info(f"AI Suggestion: {analysis_result.get('approval_suggestion')}, Risk: {analysis_result.get('risk_assessment')}")
            
            return analysis_result
            
        except Exception as e:
            logger.error(f"Error analyzing loan application {application.application_id}: {str(e)}")
            return self._create_fallback_response(str(e))
    
    def _prepare_application_data(self, application):
        """
        Extract and prepare application data for AI analysis
        
        Args:
            application: LoanApplication instance
            
        Returns:
            dict: Structured application data
        """
        data = {
            # Personal Information
            'applicant': {
                'name': application.get_full_name(),
                'email': application.email,
                'phone': application.phone,
                'date_of_birth': str(application.dob) if application.dob else None,
                'social_security': application.social_security or 'Not provided',
            },
            
            # Financial Profile
            'financial': {
                'annual_income': float(application.income) if application.income else 0,
                'gross_monthly_income': float(application.gross_monthly_income) if application.gross_monthly_income else 0,
                'employment_status': application.employment_status or 'Not specified',
                'employment_length_years': float(application.employment_length) if application.employment_length else 0,
                'income_source': application.income_source or 'Not specified',
                'pay_frequency': application.pay_frequency or 'Not specified',
                'active_bankruptcy': application.active_bankruptcy or 'Not specified',
                'direct_deposit': application.direct_deposit or 'Not specified',
                'bank_name': application.banks_name or 'Not specified',
            },
            
            # Loan Details
            'loan': {
                'requested_amount': float(application.amount),
                'term_months': application.term or 36,
                'purpose': application.purpose or 'Not specified',
                'credit_score': application.credit_score or 'Not provided',
            },
            
            # Vehicle Information
            'vehicle': {
                'make': application.vehicle_make or 'Not specified',
                'model': application.vehicle_model or 'Not specified',
                'year': application.vehicle_year or 'Not specified',
                'vin': application.vehicle_vin or 'Not provided',
                'mileage': application.vehicle_mileage or 'Not specified',
                'color': application.vehicle_color or 'Not specified',
                'license_plate': application.license_plate or 'Not specified',
                'applicant_estimated_value': float(application.applicant_estimated_value) if application.applicant_estimated_value else 0,
            },
            
            # Address
            'address': {
                'street': application.street or 'Not provided',
                'city': application.city or 'Not provided',
                'state': application.state or 'Not provided',
                'zip_code': application.zip_code or 'Not provided',
            },
            
            # Identification
            'identification': {
                'type': application.identification_type or 'Not specified',
                'number': application.identification_no or 'Not provided',
                'issuing_agency': application.id_issuing_agency or 'Not specified',
            },
            
            # Documents Submitted
            'documents_submitted': {
                'vin_sticker': bool(application.photo_vin_sticker),
                'odometer': bool(application.photo_odometer),
                'borrower_photo': bool(application.photo_borrower),
                'car_front': bool(application.photo_front_car),
                'vin_plate': bool(application.photo_vin),
                'license': bool(application.photo_license),
                'insurance': bool(application.photo_insurance),
            },
            
            # AI Vehicle Valuation (if available)
            'vehicle_valuation': None
        }
        
        # Include vehicle valuation data if available
        if hasattr(application, 'vehicle_valuation') and application.vehicle_valuation:
            valuation = application.vehicle_valuation
            data['vehicle_valuation'] = {
                'ai_estimated_value': float(valuation.estimated_value_avg),
                'condition': valuation.condition,
                'ltv_ratio': float(valuation.ltv_ratio),
                'max_loan_amount': float(valuation.max_loan_amount),
                'risk_level': valuation.risk_level,
                'confidence': valuation.confidence_level,
                'ai_approved': valuation.is_approved_for_loan,
            }
        
        return data
    
    def _check_loan_limits(self, application_data):
        """
        Check if requested loan amount complies with business rules:
        - Maximum 50% of vehicle value
        - Absolute maximum $25,000
        
        Args:
            application_data: Dictionary containing application information
            
        Returns:
            dict: Loan limit check results
        """
        ABSOLUTE_MAX_LOAN = getattr(settings, 'LOAN_MAX_LIMIT', 25000)
        MAX_LTV_RATIO = float(getattr(settings, 'LOAN_MAX_LTV_RATIO', 0.50))  # 50%
        
        requested_amount = application_data['loan']['requested_amount']
        
        # Determine vehicle value (prefer AI valuation, fallback to applicant estimate)
        vehicle_value = 0
        if application_data['vehicle_valuation']:
            vehicle_value = application_data['vehicle_valuation']['ai_estimated_value']
        elif application_data['vehicle']['applicant_estimated_value']:
            vehicle_value = application_data['vehicle']['applicant_estimated_value']
        
        # Calculate maximum eligible loan amount
        if vehicle_value > 0:
            # 50% of vehicle value
            half_vehicle_value = vehicle_value * MAX_LTV_RATIO
            # Take the minimum of 50% vehicle value or $25,000
            max_eligible = min(half_vehicle_value, ABSOLUTE_MAX_LOAN)
        else:
            # If no vehicle value, can't determine eligibility
            max_eligible = ABSOLUTE_MAX_LOAN
        
        # Check if within limits
        within_limits = requested_amount <= max_eligible
        exceeds_by = requested_amount - max_eligible if not within_limits else 0
        exceeds_by_large_margin = exceeds_by > (max_eligible * 0.2)  # More than 20% over limit
        
        # Generate message
        if within_limits:
            message = f"✓ Loan amount ${requested_amount:,.2f} is within limits (max eligible: ${max_eligible:,.2f})"
        else:
            if requested_amount > ABSOLUTE_MAX_LOAN:
                message = f"⚠ Requested amount ${requested_amount:,.2f} exceeds absolute maximum of ${ABSOLUTE_MAX_LOAN:,.2f}"
            else:
                message = f"⚠ Requested amount ${requested_amount:,.2f} exceeds 50% of vehicle value (${vehicle_value:,.2f}). Max eligible: ${max_eligible:,.2f}"
        
        return {
            'within_limits': within_limits,
            'requested_amount': requested_amount,
            'vehicle_value': vehicle_value,
            'max_eligible_amount': max_eligible,
            'exceeds_by': exceeds_by,
            'exceeds_by_large_margin': exceeds_by_large_margin,
            'message': message,
            'ltv_ratio': (requested_amount / vehicle_value * 100) if vehicle_value > 0 else 0,
        }
    
    def _create_analysis_prompt(self, application_data):
        """
        Create a detailed prompt for Gemini AI to analyze the loan application
        
        Args:
            application_data: Dictionary containing application information
            
        Returns:
            str: Formatted prompt for AI analysis
        """
        prompt = f"""You are an expert loan underwriter AI assistant analyzing a car title loan application. Your role is to evaluate the application comprehensively and provide actionable recommendations.

**APPLICATION DETAILS:**

**Applicant Information:**
- Name: {application_data['applicant']['name']}
- Contact: {application_data['applicant']['email']}, {application_data['applicant']['phone']}
- Date of Birth: {application_data['applicant']['date_of_birth']}

**Financial Profile:**
- Annual Income: ${application_data['financial']['annual_income']:,.2f}
- Monthly Income: ${application_data['financial']['gross_monthly_income']:,.2f}
- Employment: {application_data['financial']['employment_status']} for {application_data['financial']['employment_length_years']} years
- Income Source: {application_data['financial']['income_source']}
- Pay Frequency: {application_data['financial']['pay_frequency']}
- Bank: {application_data['financial']['bank_name']}
- Active Bankruptcy: {application_data['financial']['active_bankruptcy']}
- Direct Deposit: {application_data['financial']['direct_deposit']}

**Loan Request:**
- Requested Amount: ${application_data['loan']['requested_amount']:,.2f}
- Term: {application_data['loan']['term_months']} months
- Purpose: {application_data['loan']['purpose']}
- Credit Score: {application_data['loan']['credit_score']}

**Vehicle (Collateral):**
- Make/Model: {application_data['vehicle']['make']} {application_data['vehicle']['model']}
- Year: {application_data['vehicle']['year']}
- Mileage: {application_data['vehicle']['mileage']}
- VIN: {application_data['vehicle']['vin']}
- Applicant's Estimated Value: ${application_data['vehicle']['applicant_estimated_value']:,.2f}

**Vehicle AI Valuation:**
{self._format_vehicle_valuation(application_data['vehicle_valuation'])}

**Address:**
{application_data['address']['street']}, {application_data['address']['city']}, {application_data['address']['state']} {application_data['address']['zip_code']}

**Documents Submitted:**
{self._format_documents(application_data['documents_submitted'])}

---

**ANALYSIS REQUIREMENTS:**

Please analyze this loan application and provide your assessment in the following JSON format:

{{
  "approval_suggestion": "approve|conditional|review|reject",
  "risk_assessment": "low|medium|high|very_high",
  "recommendation": "A detailed 3-5 paragraph recommendation explaining your analysis",
  "key_strengths": ["List of positive factors"],
  "key_concerns": ["List of concerns or red flags"],
  "conditions_for_approval": ["List any conditions if suggesting conditional approval"],
  "suggested_loan_amount": <number>,
  "suggested_interest_rate_range": "X-Y%",
  "confidence_score": <0-100>
}}

**EVALUATION CRITERIA:**

1. **Income Verification**: Is the income sufficient for the requested loan? Calculate debt-to-income ratio.
2. **Employment Stability**: How stable is their employment? Consider employment length.
3. **Collateral Value & Loan Limits**: 
   - CRITICAL RULE: Maximum loan amount is 50% of vehicle value OR $25,000 (whichever is LOWER)
   - Example: If car worth $40,000 → Max loan = $20,000
   - Example: If car worth $100,000 → Max loan = $25,000 (NOT $50,000)
   - Example: If car worth $30,000 → Max loan = $15,000
   - ABSOLUTE MAXIMUM LOAN: $25,000 regardless of vehicle value
   - Requested amount must not exceed these limits
4. **Credit Risk**: Consider credit score, bankruptcy status, and overall financial health.
5. **Documentation**: Are all required documents submitted?
6. **Red Flags**: Identify any concerning patterns or missing information.
7. **Repayment Capacity**: Monthly payment vs. monthly income analysis.

**LOAN AMOUNT CALCULATION RULES (STRICTLY ENFORCE):**
- Calculate: eligible_amount = MIN(vehicle_value * 0.5, 25000)
- If requested_amount > eligible_amount: Suggest REJECT or reduce to eligible_amount
- Loan-to-Value (LTV) ratio should be ≤ 50%
- Never approve loans exceeding $25,000 under any circumstances

**DECISION GUIDELINES:**
- **Approve**: Strong financials, good collateral, low risk, requested amount ≤ 50% of vehicle value AND ≤ $25,000
- **Conditional**: Good candidate but needs verification, OR requested amount needs to be reduced to meet loan limits
- **Review**: Borderline case requiring human judgment, or missing critical information
- **Reject**: High risk, poor financials, insufficient collateral, OR requested amount exceeds loan limits (more than 50% of vehicle value or more than $25,000)

**IMPORTANT**: When suggesting loan amount, ALWAYS apply these rules:
- suggested_loan_amount = MIN(vehicle_value * 0.5, 25000, requested_amount)
- Clearly state if the requested amount exceeds limits and must be reduced

Provide a thorough, professional analysis that will help the loan officer make an informed decision."""

        return prompt
    
    def _format_vehicle_valuation(self, valuation_data):
        """Format vehicle valuation data for the prompt"""
        if not valuation_data:
            return "No AI vehicle valuation available yet."
        
        return f"""- AI Estimated Value: ${valuation_data['ai_estimated_value']:,.2f}
- Vehicle Condition: {valuation_data['condition']}
- Loan-to-Value Ratio: {valuation_data['ltv_ratio']:.2f}%
- Max Recommended Loan: ${valuation_data['max_loan_amount']:,.2f}
- Risk Level: {valuation_data['risk_level']}
- AI Valuation Confidence: {valuation_data['confidence']}
- AI Pre-Approval Status: {'Approved' if valuation_data['ai_approved'] else 'Not Approved'}"""
    
    def _format_documents(self, docs):
        """Format documents submission status"""
        submitted = [k.replace('_', ' ').title() for k, v in docs.items() if v]
        missing = [k.replace('_', ' ').title() for k, v in docs.items() if not v]
        
        result = []
        if submitted:
            result.append(f"Submitted: {', '.join(submitted)}")
        if missing:
            result.append(f"Missing: {', '.join(missing)}")
        
        return '\n'.join(result) if result else "No documents submitted"
    
    def _parse_ai_response(self, response_text):
        """
        Parse the AI response and extract structured data
        
        Args:
            response_text: Raw text response from Gemini
            
        Returns:
            dict: Parsed and structured analysis results
        """
        try:
            # Try to extract JSON from the response
            # Sometimes Gemini wraps JSON in markdown code blocks
            response_text = response_text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.startswith('```'):
                response_text = response_text[3:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            parsed = json.loads(response_text)
            
            # Validate and normalize the response
            result = {
                'approval_suggestion': parsed.get('approval_suggestion', 'review').lower(),
                'risk_assessment': parsed.get('risk_assessment', 'medium').lower(),
                'recommendation': parsed.get('recommendation', ''),
                'key_strengths': parsed.get('key_strengths', []),
                'key_concerns': parsed.get('key_concerns', []),
                'conditions_for_approval': parsed.get('conditions_for_approval', []),
                'suggested_loan_amount': parsed.get('suggested_loan_amount', 0),
                'suggested_interest_rate_range': parsed.get('suggested_interest_rate_range', ''),
                'confidence_score': parsed.get('confidence_score', 0),
            }
            
            return result
            
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse AI response as JSON: {str(e)}")
            logger.warning(f"Response text: {response_text[:500]}")
            
            # Fallback: create a structured response from the text
            return {
                'approval_suggestion': 'review',
                'risk_assessment': 'medium',
                'recommendation': response_text,
                'key_strengths': [],
                'key_concerns': ['Unable to parse structured analysis'],
                'conditions_for_approval': [],
                'suggested_loan_amount': 0,
                'suggested_interest_rate_range': '',
                'confidence_score': 50,
            }
    
    def _create_fallback_response(self, error_message):
        """
        Create a fallback response when AI analysis fails
        
        Args:
            error_message: Error description
            
        Returns:
            dict: Fallback analysis response
        """
        return {
            'approval_suggestion': 'review',
            'risk_assessment': 'medium',
            'recommendation': f'AI analysis failed: {error_message}. Manual review required.',
            'key_strengths': [],
            'key_concerns': ['AI analysis unavailable - manual review required'],
            'conditions_for_approval': ['Complete manual underwriting process'],
            'suggested_loan_amount': 0,
            'suggested_interest_rate_range': '',
            'confidence_score': 0,
            'error': error_message,
            'analyzed_at': datetime.now().isoformat(),
        }
