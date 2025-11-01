from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


EMPLOYMENT_STATUS_CHOICES = (
    ('employed', 'Employed'),
    ('self-employed', 'Self-Employed'),
    ('retired', 'Retired'),
    ('unemployed', 'Unemployed'),
)


class ApplicantPersonalInfo(models.Model):
    """Stores personal information for an applicant."""
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    dob = models.DateField()
    social_security = models.CharField(max_length=11, blank=True, null=True, help_text="Format: XXX-XX-XXXX")
    banks_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class ApplicantIdentification(models.Model):
    """Stores government identification details for an applicant."""
    personal_info = models.OneToOneField(
        ApplicantPersonalInfo,
        on_delete=models.CASCADE,
        related_name='identification'
    )
    identification_type = models.CharField(max_length=50, blank=True, null=True)
    id_issuing_agency = models.CharField(max_length=100, blank=True, null=True)
    identification_no = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Identification for {self.personal_info}"


class ApplicantFinancialProfile(models.Model):
    """Stores employment and financial information for an applicant."""
    income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(20000)],
        null=True,
        blank=True
    )
    employment_status = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_STATUS_CHOICES,
        blank=True,
        default='employed'
    )
    employment_length = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        validators=[MinValueValidator(0)],
        help_text="Employment length in years",
        null=True,
        blank=True
    )
    income_source = models.CharField(max_length=255, blank=True, null=True, help_text="Employer/Income Source")
    gross_monthly_income = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    pay_frequency = models.CharField(max_length=50, blank=True, null=True)
    next_pay_date = models.DateField(blank=True, null=True)
    last_pay_date = models.DateField(blank=True, null=True)
    active_bankruptcy = models.CharField(max_length=10, blank=True, null=True, choices=(('Yes', 'Yes'), ('No', 'No')))
    direct_deposit = models.CharField(max_length=10, blank=True, null=True, choices=(('Yes', 'Yes'), ('No', 'No')))
    military_status = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        employment = self.employment_status or 'Unknown'
        return f"Financial Profile ({employment})"


class ApplicantAddress(models.Model):
    """Stores address details for an applicant."""
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)

    class Meta:
        indexes = [
            models.Index(fields=['zip_code']),
            models.Index(fields=['city', 'state']),
        ]

    def __str__(self):
        return f"{self.street}, {self.city}, {self.state} {self.zip_code}"


class VehicleInformation(models.Model):
    """Stores vehicle details linked to a loan application."""
    make = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    year = models.CharField(max_length=4, blank=True, null=True)
    vin = models.CharField(max_length=17, blank=True, null=True)
    mileage = models.IntegerField(blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    license_plate = models.CharField(max_length=20, blank=True, null=True)
    registration_state = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        if self.make or self.model:
            return f"{self.make or ''} {self.model or ''} ({self.year or 'N/A'})".strip()
        return "Vehicle Information"


class LoanApplication(models.Model):
    """
    Model to store loan application data
    Can be saved in draft mode before user signs up/logs in
    """
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('query', 'Query'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    )

    # Unique identifier for tracking drafts before user auth
    application_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    # User relationship (nullable to allow drafts before login)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='loan_applications',
        null=True,
        blank=True
    )

    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_draft = models.BooleanField(default=True)

    # Normalized applicant information
    personal_info = models.OneToOneField(
        ApplicantPersonalInfo,
        on_delete=models.CASCADE,
        related_name='loan_application',
        null=True,
        blank=True
    )
    identification_info = models.OneToOneField(
        ApplicantIdentification,
        on_delete=models.CASCADE,
        related_name='loan_application',
        null=True,
        blank=True
    )
    financial_profile = models.OneToOneField(
        ApplicantFinancialProfile,
        on_delete=models.CASCADE,
        related_name='loan_application',
        null=True,
        blank=True
    )
    address = models.OneToOneField(
        ApplicantAddress,
        on_delete=models.CASCADE,
        related_name='loan_application',
        null=True,
        blank=True
    )
    vehicle_info = models.OneToOneField(
        VehicleInformation,
        on_delete=models.CASCADE,
        related_name='loan_application',
        null=True,
        blank=True
    )

    # Loan Details
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(1000), MaxValueValidator(100000)]
    )
    term = models.IntegerField(
        validators=[MinValueValidator(6), MaxValueValidator(72)],
        help_text="Loan term in months",
        null=True,
        blank=True,
        default=36
    )
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Annual interest rate percentage"
    )
    purpose = models.TextField(blank=True, default='')

    # Credit Information
    credit_score = models.IntegerField(
        validators=[MinValueValidator(300), MaxValueValidator(850)],
        null=True,
        blank=True
    )

    applicant_estimated_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Applicant's own estimate of vehicle value"
    )
    
    # Terms Acceptance
    accept_terms = models.BooleanField(default=False)
    signature = models.TextField(blank=True, null=True, help_text="Customer signature captured at submission")
    signed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    
    # Draft session tracking (for anonymous users)
    session_key = models.CharField(max_length=255, null=True, blank=True)
    
    # Additional dynamic fields storage
    additional_data = models.JSONField(
        default=dict, 
        blank=True, 
        help_text="Store any additional form fields that don't fit in normalized structure"
    )
    
    # Gemini AI Analysis Results
    ai_recommendation = models.TextField(blank=True, null=True, help_text="AI-generated recommendation for loan approval")
    ai_risk_assessment = models.CharField(
        max_length=20,
        choices=(
            ('low', 'Low Risk'),
            ('medium', 'Medium Risk'),
            ('high', 'High Risk'),
            ('very_high', 'Very High Risk'),
        ),
        blank=True,
        null=True,
        help_text="AI-assessed risk level"
    )
    ai_approval_suggestion = models.CharField(
        max_length=20,
        choices=(
            ('approve', 'Approve'),
            ('conditional', 'Conditional Approval'),
            ('review', 'Needs Review'),
            ('reject', 'Reject'),
        ),
        blank=True,
        null=True,
        help_text="AI suggestion for approval decision"
    )
    ai_analysis_data = models.JSONField(null=True, blank=True, help_text="Full AI analysis response from Gemini")
    ai_analysis_timestamp = models.DateTimeField(null=True, blank=True, help_text="When AI analysis was performed")
    
    # Approval fields (admin decision tracking)
    approved_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Final approved loan amount after underwriting"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_loans'
    )
    approval_notes = models.TextField(blank=True, default='')
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['session_key']),
            models.Index(fields=['application_id']),
        ]
    
    def __str__(self):
        return f"Loan Application {self.application_id} - {self.get_full_name()}"
    
    def get_full_name(self):
        if self.personal_info:
            return f"{self.personal_info.first_name} {self.personal_info.last_name}".strip()
        return "Applicant"
    
    def _personal_attr(self, attr):
        return getattr(self.personal_info, attr, None) if self.personal_info else None

    def _identification_attr(self, attr):
        return getattr(self.identification_info, attr, None) if self.identification_info else None

    def _financial_attr(self, attr):
        return getattr(self.financial_profile, attr, None) if self.financial_profile else None

    def _address_attr(self, attr):
        return getattr(self.address, attr, None) if self.address else None

    def _vehicle_attr(self, attr):
        return getattr(self.vehicle_info, attr, None) if self.vehicle_info else None

    @property
    def first_name(self):
        return self._personal_attr('first_name')

    @property
    def last_name(self):
        return self._personal_attr('last_name')

    @property
    def email(self):
        return self._personal_attr('email')

    @property
    def phone(self):
        return self._personal_attr('phone')

    @property
    def dob(self):
        return self._personal_attr('dob')

    @property
    def social_security(self):
        return self._personal_attr('social_security')

    @property
    def banks_name(self):
        return self._personal_attr('banks_name')

    @property
    def identification_type(self):
        return self._identification_attr('identification_type')

    @property
    def id_issuing_agency(self):
        return self._identification_attr('id_issuing_agency')

    @property
    def identification_no(self):
        return self._identification_attr('identification_no')

    @property
    def income(self):
        return self._financial_attr('income')

    @property
    def employment_status(self):
        return self._financial_attr('employment_status')

    @property
    def employment_length(self):
        return self._financial_attr('employment_length')

    @property
    def income_source(self):
        return self._financial_attr('income_source')

    @property
    def gross_monthly_income(self):
        return self._financial_attr('gross_monthly_income')

    @property
    def pay_frequency(self):
        return self._financial_attr('pay_frequency')

    @property
    def next_pay_date(self):
        return self._financial_attr('next_pay_date')

    @property
    def last_pay_date(self):
        return self._financial_attr('last_pay_date')

    @property
    def active_bankruptcy(self):
        return self._financial_attr('active_bankruptcy')

    @property
    def direct_deposit(self):
        return self._financial_attr('direct_deposit')

    @property
    def military_status(self):
        return self._financial_attr('military_status')

    @property
    def street(self):
        return self._address_attr('street')

    @property
    def city(self):
        return self._address_attr('city')

    @property
    def state(self):
        return self._address_attr('state')

    @property
    def zip_code(self):
        return self._address_attr('zip_code')

    @property
    def vehicle_make(self):
        return self._vehicle_attr('make')

    @property
    def vehicle_model(self):
        return self._vehicle_attr('model')

    @property
    def vehicle_year(self):
        return self._vehicle_attr('year')

    @property
    def vehicle_vin(self):
        return self._vehicle_attr('vin')

    @property
    def vehicle_mileage(self):
        return self._vehicle_attr('mileage')

    @property
    def vehicle_color(self):
        return self._vehicle_attr('color')

    @property
    def license_plate(self):
        return self._vehicle_attr('license_plate')

    @property
    def registration_state(self):
        return self._vehicle_attr('registration_state')

    def submit(self):
        """Mark application as submitted"""
        from django.utils import timezone
        if not self.signature:
            raise ValueError("Signature is required before submitting the application.")
        self.is_draft = False
        self.status = 'pending'
        self.submitted_at = timezone.now()
        self.signed_at = self.signed_at or timezone.now()
        self.save()

    def get_vehicle_value_for_policy(self):
        """Return the best-known vehicle value for loan policy checks.
        Prefers AI valuation average, falls back to applicant_estimated_value, else 0.
        """
        try:
            if hasattr(self, 'vehicle_valuation') and self.vehicle_valuation and self.vehicle_valuation.estimated_value_avg:
                return float(self.vehicle_valuation.estimated_value_avg)
        except Exception:
            pass
        return float(self.applicant_estimated_value or 0)

    def get_max_eligible_loan(self):
        """Compute maximum eligible loan amount as min(50% of vehicle value, settings cap)."""
        from django.conf import settings as django_settings
        vehicle_value = self.get_vehicle_value_for_policy()
        cap = getattr(django_settings, 'LOAN_MAX_LIMIT', 25000)
        max_ltv = getattr(django_settings, 'LOAN_MAX_LTV_RATIO', 0.5)
        if vehicle_value <= 0:
            return float(cap)
        return float(min(vehicle_value * max_ltv, cap))


class LoanApplicationNote(models.Model):
    """
    Internal notes for loan applications (admin use)
    """
    application = models.ForeignKey(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.application.application_id} by {self.author}"


class LoanApplicationDocument(models.Model):
    """
    Documents attached to loan applications
    """
    DOCUMENT_TYPE_CHOICES = (
        ('id', 'ID Document'),
        ('income', 'Income Verification'),
        ('address', 'Address Proof'),
        ('vehicle_title', 'Vehicle Title'),
        ('photo_vin_sticker', 'VIN Sticker Photo'),
        ('photo_odometer', 'Odometer Photo'),
        ('photo_borrower', 'Borrower Photo'),
        ('photo_front_car', 'Front of Car Photo'),
        ('photo_vin_plate', 'VIN Plate Photo'),
        ('photo_license', 'License Photo'),
        ('photo_insurance', 'Insurance Photo'),
        ('other', 'Other'),
    )
    
    application = models.ForeignKey(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='loan_documents/%Y/%m/%d/')
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    # For vehicle images - AI analysis results
    ai_analysis_result = models.JSONField(null=True, blank=True)
    is_analyzed = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.application.application_id}"


class VehicleValuation(models.Model):
    """
    Stores vehicle valuation results from AI analysis
    """
    application = models.OneToOneField(
        LoanApplication,
        on_delete=models.CASCADE,
        related_name='vehicle_valuation'
    )
    
    # Vehicle Details (from AI)
    make = models.CharField(max_length=100, blank=True)
    model = models.CharField(max_length=100, blank=True)
    year = models.CharField(max_length=20, blank=True)
    body_type = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    
    # Condition Assessment
    condition = models.CharField(
        max_length=20,
        choices=(
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('fair', 'Fair'),
            ('poor', 'Poor'),
        ),
        default='good'
    )
    visible_damage = models.JSONField(default=list, blank=True)
    features = models.JSONField(default=list, blank=True)
    
    # Valuation
    estimated_value_low = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_value_high = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    estimated_value_avg = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Loan Assessment
    ltv_ratio = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    max_loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    recommended_loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Risk Assessment
    risk_level = models.CharField(
        max_length=20,
        choices=(
            ('low', 'Low Risk'),
            ('medium', 'Medium Risk'),
            ('high', 'High Risk'),
        ),
        default='medium'
    )
    risk_factors = models.JSONField(default=list, blank=True)
    
    # AI Analysis Metadata
    confidence_level = models.CharField(
        max_length=20,
        choices=(
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ),
        default='medium'
    )
    images_analyzed = models.IntegerField(default=0)
    analysis_notes = models.TextField(blank=True)
    full_analysis_data = models.JSONField(null=True, blank=True)
    
    # Timestamps
    analyzed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Approval status
    is_approved_for_loan = models.BooleanField(default=False)
    approval_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-analyzed_at']
    
    def __str__(self):
        return f"Valuation for {self.application.application_id} - {self.make} {self.model}"
    
    def get_estimated_value(self):
        """Return average estimated value"""
        return self.estimated_value_avg if self.estimated_value_avg else \
               (self.estimated_value_low + self.estimated_value_high) / 2
    
    def compare_with_applicant_estimate(self):
        """
        Compare AI-estimated value with applicant's estimate.
        Returns comparison data useful for admin approval decision.
        """
        applicant_estimate = self.application.applicant_estimated_value
        
        if not applicant_estimate:
            return {
                'has_applicant_estimate': False,
                'message': 'Applicant did not provide a vehicle value estimate'
            }
        
        ai_estimate = float(self.get_estimated_value())
        applicant_estimate = float(applicant_estimate)
        
        # Calculate difference
        difference = ai_estimate - applicant_estimate
        percentage_diff = (difference / applicant_estimate * 100) if applicant_estimate > 0 else 0
        
        # Determine if estimates align
        # Allow up to 15% variance as acceptable
        acceptable_variance = 15
        is_aligned = abs(percentage_diff) <= acceptable_variance
        
        # Generate assessment message
        if is_aligned:
            assessment = "ALIGNED"
            message = f"Estimates are aligned within {acceptable_variance}% variance"
            risk = "low"
        elif percentage_diff > 0:
            assessment = "OVERVALUED_BY_APPLICANT"
            message = f"Applicant overvalued vehicle by {abs(percentage_diff):.1f}%"
            risk = "medium" if abs(percentage_diff) < 30 else "high"
        else:
            assessment = "UNDERVALUED_BY_APPLICANT"
            message = f"Applicant undervalued vehicle by {abs(percentage_diff):.1f}%"
            risk = "low"
        
        return {
            'has_applicant_estimate': True,
            'ai_estimate': ai_estimate,
            'applicant_estimate': applicant_estimate,
            'difference': difference,
            'percentage_difference': round(percentage_diff, 2),
            'is_aligned': is_aligned,
            'assessment': assessment,
            'risk_level': risk,
            'message': message,
            'admin_notes': self._generate_admin_notes(assessment, percentage_diff, ai_estimate, applicant_estimate)
        }
    
    def _generate_admin_notes(self, assessment, percentage_diff, ai_estimate, applicant_estimate):
        """Generate helpful notes for admin review"""
        notes = []
        
        if assessment == "ALIGNED":
            notes.append("✅ Applicant's estimate is reasonable and aligns with AI analysis")
            notes.append(f"✅ Both estimates around ${ai_estimate:,.2f}")
            notes.append("✅ Low risk of fraud or misrepresentation")
        
        elif assessment == "OVERVALUED_BY_APPLICANT":
            notes.append(f"⚠️ Applicant claims vehicle worth ${applicant_estimate:,.2f}")
            notes.append(f"⚠️ AI analysis suggests ${ai_estimate:,.2f}")
            notes.append(f"⚠️ {abs(percentage_diff):.1f}% overvaluation detected")
            
            if abs(percentage_diff) > 30:
                notes.append("🚨 SIGNIFICANT OVERVALUATION - Request additional documentation")
                notes.append("🚨 Consider independent appraisal before approval")
            elif abs(percentage_diff) > 15:
                notes.append("⚠️ Moderate overvaluation - Review carefully")
                notes.append("⚠️ May indicate optimistic valuation or lack of market knowledge")
            
            notes.append("💡 Suggested action: Adjust loan amount to match AI valuation")
        
        elif assessment == "UNDERVALUED_BY_APPLICANT":
            notes.append(f"✅ Applicant conservatively estimated ${applicant_estimate:,.2f}")
            notes.append(f"✅ AI analysis suggests higher value: ${ai_estimate:,.2f}")
            notes.append("✅ Positive indicator - applicant is realistic/conservative")
            notes.append("💡 Consider offering higher loan amount if creditworthy")
        
        return "\n".join(notes)
