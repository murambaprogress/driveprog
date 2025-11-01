# Car Image Analysis Service
# This service uses OpenAI GPT-4 Vision API to analyze uploaded car images
# and provide market price estimations

import os
import base64
import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import json
from django.conf import settings


class CarImageAnalyzer:
    """
    Analyzes car images using GPT-4 Vision API to extract:
    - Make and model
    - Year
    - Condition assessment
    - Visible damage or issues
    - Estimated market value
    """
    
    def __init__(self):
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-4-vision-preview')
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
    
    def encode_image_to_base64(self, image_path: str) -> str:
        """Convert image file to base64 string"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def encode_image_from_bytes(self, image_bytes: bytes) -> str:
        """Convert image bytes to base64 string"""
        return base64.b64encode(image_bytes).decode('utf-8')
    
    def analyze_single_image(self, image_data: str, image_type: str = "base64") -> Dict:
        """
        Analyze a single car image
        
        Args:
            image_data: Either base64 string or file path
            image_type: "base64" or "file_path"
        
        Returns:
            Dictionary with analysis results
        """
        
        if image_type == "file_path":
            image_base64 = self.encode_image_to_base64(image_data)
        else:
            image_base64 = image_data
        
        prompt = """
        Analyze this car image and provide detailed information in JSON format.
        
        Please identify and provide:
        1. Make (e.g., Toyota, Honda, Ford)
        2. Model (e.g., Camry, Accord, F-150)
        3. Estimated year or year range
        4. Body type (sedan, SUV, truck, etc.)
        5. Color
        6. Visible condition (excellent, good, fair, poor)
        7. Any visible damage, dents, scratches, or issues
        8. Estimated market value range (provide low and high estimates in USD)
        9. Key features visible (alloy wheels, sunroof, etc.)
        10. Confidence level of your assessment (low, medium, high)
        11. Additional notes or observations
        
        Format your response as valid JSON with the following structure:
        {
            "make": "string",
            "model": "string",
            "year": "string or range",
            "body_type": "string",
            "color": "string",
            "condition": "excellent|good|fair|poor",
            "visible_damage": ["list of issues"],
            "estimated_value": {
                "low": number,
                "high": number,
                "currency": "USD"
            },
            "features": ["list of features"],
            "confidence": "low|medium|high",
            "notes": "string"
        }
        
        If you cannot identify something with certainty, mark it as "unknown" or provide your best estimate with lower confidence.
        """
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 1000
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Try to parse JSON from the response
            # GPT might wrap it in markdown code blocks
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            analysis = json.loads(content)
            analysis['raw_response'] = content
            analysis['analyzed_at'] = datetime.now().isoformat()
            
            return {
                'success': True,
                'data': analysis,
                'error': None
            }
            
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'data': None,
                'error': f"API request failed: {str(e)}"
            }
        except json.JSONDecodeError as e:
            return {
                'success': False,
                'data': None,
                'error': f"Failed to parse response: {str(e)}"
            }
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'error': f"Unexpected error: {str(e)}"
            }
    
    def analyze_multiple_images(self, images: List[Tuple[str, str]]) -> Dict:
        """
        Analyze multiple car images (different angles)
        
        Args:
            images: List of tuples (image_data, image_type)
        
        Returns:
            Aggregated analysis results
        """
        
        results = []
        for i, (image_data, image_type) in enumerate(images):
            result = self.analyze_single_image(image_data, image_type)
            result['image_index'] = i
            results.append(result)
        
        # Aggregate results
        successful_analyses = [r for r in results if r['success']]
        
        if not successful_analyses:
            return {
                'success': False,
                'error': 'All image analyses failed',
                'individual_results': results
            }
        
        # Combine insights from multiple images
        return self._aggregate_analyses(successful_analyses)
    
    def _aggregate_analyses(self, analyses: List[Dict]) -> Dict:
        """Combine multiple image analyses into a single comprehensive report"""
        
        if not analyses:
            return {'success': False, 'error': 'No successful analyses to aggregate'}
        
        # Use the first successful analysis as base
        base_analysis = analyses[0]['data']
        
        # Collect all damage observations
        all_damage = []
        all_features = []
        all_notes = []
        
        value_estimates = []
        
        for analysis in analyses:
            data = analysis['data']
            if 'visible_damage' in data:
                all_damage.extend(data.get('visible_damage', []))
            if 'features' in data:
                all_features.extend(data.get('features', []))
            if 'notes' in data:
                all_notes.append(data.get('notes', ''))
            if 'estimated_value' in data:
                value_estimates.append(data['estimated_value'])
        
        # Remove duplicates
        unique_damage = list(set(all_damage))
        unique_features = list(set(all_features))
        
        # Calculate average value estimate
        if value_estimates:
            avg_low = sum(v.get('low', 0) for v in value_estimates) / len(value_estimates)
            avg_high = sum(v.get('high', 0) for v in value_estimates) / len(value_estimates)
            aggregated_value = {
                'low': round(avg_low, 2),
                'high': round(avg_high, 2),
                'currency': 'USD',
                'confidence': 'medium' if len(value_estimates) > 1 else 'low'
            }
        else:
            aggregated_value = base_analysis.get('estimated_value', {})
        
        # Determine overall condition (take the worst assessment)
        condition_priority = {'poor': 0, 'fair': 1, 'good': 2, 'excellent': 3}
        conditions = [a['data'].get('condition', 'unknown') for a in analyses]
        overall_condition = min(
            [c for c in conditions if c in condition_priority],
            key=lambda x: condition_priority[x],
            default='good'
        )
        
        return {
            'success': True,
            'data': {
                'make': base_analysis.get('make', 'unknown'),
                'model': base_analysis.get('model', 'unknown'),
                'year': base_analysis.get('year', 'unknown'),
                'body_type': base_analysis.get('body_type', 'unknown'),
                'color': base_analysis.get('color', 'unknown'),
                'condition': overall_condition,
                'visible_damage': unique_damage,
                'estimated_value': aggregated_value,
                'features': unique_features,
                'confidence': 'high' if len(analyses) >= 3 else 'medium',
                'notes': ' | '.join(all_notes),
                'images_analyzed': len(analyses),
                'analyzed_at': datetime.now().isoformat()
            },
            'individual_results': analyses
        }
    
    def get_market_comparison(self, car_details: Dict) -> Dict:
        """
        Get market comparison data using GPT-4
        
        Args:
            car_details: Dictionary with make, model, year, condition
        
        Returns:
            Market comparison data
        """
        
        prompt = f"""
        Based on the following car details, provide a market analysis and pricing comparison:
        
        Make: {car_details.get('make', 'unknown')}
        Model: {car_details.get('model', 'unknown')}
        Year: {car_details.get('year', 'unknown')}
        Condition: {car_details.get('condition', 'unknown')}
        
        Please provide:
        1. Current market value range (low, average, high)
        2. Factors affecting the value
        3. Comparable vehicles in the market
        4. Loan-to-value ratio recommendation (what percentage of value should be lent)
        5. Risk assessment for lending (low, medium, high)
        
        Format as JSON:
        {{
            "market_value": {{
                "low": number,
                "average": number,
                "high": number,
                "currency": "USD"
            }},
            "value_factors": ["list of factors"],
            "comparable_vehicles": [
                {{
                    "make": "string",
                    "model": "string",
                    "year": "string",
                    "price": number
                }}
            ],
            "loan_recommendation": {{
                "ltv_ratio": number (0-100),
                "max_loan_amount": number,
                "reasoning": "string"
            }},
            "risk_assessment": {{
                "level": "low|medium|high",
                "factors": ["list of risk factors"]
            }}
        }}
        """
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": "gpt-4",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert automotive appraiser and loan officer with extensive knowledge of vehicle values and lending practices."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 1000
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Parse JSON response
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0].strip()
            elif '```' in content:
                content = content.split('```')[1].split('```')[0].strip()
            
            market_data = json.loads(content)
            
            return {
                'success': True,
                'data': market_data,
                'error': None
            }
            
        except Exception as e:
            return {
                'success': False,
                'data': None,
                'error': f"Market analysis failed: {str(e)}"
            }


class CarValuationService:
    """
    High-level service for car valuation using image analysis
    """
    
    def __init__(self):
        self.analyzer = CarImageAnalyzer()
    
    def evaluate_for_loan(self, images: List[Tuple[str, str]], loan_amount: float) -> Dict:
        """
        Evaluate a car for loan approval
        
        Args:
            images: List of car images
            loan_amount: Requested loan amount
        
        Returns:
            Comprehensive evaluation report
        """
        
        # Analyze images
        analysis_result = self.analyzer.analyze_multiple_images(images)
        
        if not analysis_result['success']:
            return {
                'approved': False,
                'reason': 'Image analysis failed',
                'error': analysis_result.get('error'),
                'recommendation': 'Please upload clearer images of the vehicle'
            }
        
        car_data = analysis_result['data']
        
        # Get market comparison
        market_result = self.analyzer.get_market_comparison(car_data)
        
        if not market_result['success']:
            # Use image-based estimate only
            estimated_value = car_data.get('estimated_value', {})
            avg_value = (estimated_value.get('low', 0) + estimated_value.get('high', 0)) / 2
        else:
            market_data = market_result['data']
            avg_value = market_data['market_value']['average']
        
        # Calculate loan-to-value ratio
        ltv_ratio = (loan_amount / avg_value * 100) if avg_value > 0 else 0
        
        # Determine approval
        max_ltv = 80  # Maximum 80% LTV
        condition_multiplier = {
            'excellent': 1.0,
            'good': 0.9,
            'fair': 0.75,
            'poor': 0.5
        }
        
        condition = car_data.get('condition', 'good')
        adjusted_max_ltv = max_ltv * condition_multiplier.get(condition, 0.8)
        
        approved = ltv_ratio <= adjusted_max_ltv and avg_value > loan_amount
        
        # Generate recommendation
        if approved:
            recommendation = f"Loan approved. Vehicle value (${avg_value:,.2f}) supports the requested amount."
        else:
            if ltv_ratio > adjusted_max_ltv:
                max_loan = avg_value * (adjusted_max_ltv / 100)
                recommendation = f"Loan amount too high. Maximum recommended: ${max_loan:,.2f}"
            else:
                recommendation = "Vehicle value insufficient for requested loan amount."
        
        return {
            'approved': approved,
            'vehicle_analysis': car_data,
            'market_data': market_result.get('data') if market_result['success'] else None,
            'valuation': {
                'estimated_value': avg_value,
                'loan_amount_requested': loan_amount,
                'ltv_ratio': round(ltv_ratio, 2),
                'max_ltv_allowed': round(adjusted_max_ltv, 2),
                'max_loan_amount': round(avg_value * (adjusted_max_ltv / 100), 2)
            },
            'recommendation': recommendation,
            'risk_factors': car_data.get('visible_damage', []),
            'confidence': car_data.get('confidence', 'medium'),
            'timestamp': datetime.now().isoformat()
        }


# Singleton instance
car_valuation_service = CarValuationService()
