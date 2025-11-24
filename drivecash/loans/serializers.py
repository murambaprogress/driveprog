from rest_framework import serializers
from .models import (
    LoanApplication,
    LoanApplicationNote,
    LoanApplicationDocument,
    VehicleValuation,
    ApplicantPersonalInfo,
    ApplicantIdentification,
    ApplicantFinancialProfile,
    ApplicantAddress,
    VehicleInformation,
)
from django.contrib.auth import get_user_model

User = get_user_model()


class LoanApplicationDataMixin:
    """Reusable field declarations and helpers for normalized loan application data."""

    application_id = serializers.UUIDField(read_only=True)
    
    # Personal info
    first_name = serializers.CharField(source='personal_info.first_name')
    last_name = serializers.CharField(source='personal_info.last_name')
    email = serializers.EmailField(source='personal_info.email')
    phone = serializers.CharField(source='personal_info.phone')
    dob = serializers.DateField(source='personal_info.dob', required=False, allow_null=True)
    social_security = serializers.CharField(
        source='personal_info.social_security',
        allow_blank=True,
        allow_null=True,
        required=False,
        max_length=50
    )
    banks_name = serializers.CharField(
        source='personal_info.banks_name',
        allow_blank=True,
        allow_null=True,
        required=False
    )

    # Identification info
    identification_type = serializers.CharField(
        source='identification_info.identification_type',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    id_issuing_agency = serializers.CharField(
        source='identification_info.id_issuing_agency',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    identification_no = serializers.CharField(
        source='identification_info.identification_no',
        allow_blank=True,
        allow_null=True,
        required=False
    )

    # Financial profile
    income = serializers.DecimalField(
        source='financial_profile.income',
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    employment_status = serializers.ChoiceField(
        source='financial_profile.employment_status',
        choices=ApplicantFinancialProfile._meta.get_field('employment_status').choices,
        required=False,
        allow_blank=True
    )
    employment_length = serializers.DecimalField(
        source='financial_profile.employment_length',
        max_digits=5,
        decimal_places=1,
        required=False,
        allow_null=True
    )
    income_source = serializers.CharField(
        source='financial_profile.income_source',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    gross_monthly_income = serializers.DecimalField(
        source='financial_profile.gross_monthly_income',
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    pay_frequency = serializers.CharField(
        source='financial_profile.pay_frequency',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    next_pay_date = serializers.DateField(
        source='financial_profile.next_pay_date',
        required=False,
        allow_null=True
    )
    last_pay_date = serializers.DateField(
        source='financial_profile.last_pay_date',
        required=False,
        allow_null=True
    )
    active_bankruptcy = serializers.CharField(
        source='financial_profile.active_bankruptcy',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    direct_deposit = serializers.CharField(
        source='financial_profile.direct_deposit',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    military_status = serializers.CharField(
        source='financial_profile.military_status',
        allow_blank=True,
        allow_null=True,
        required=False
    )

    # Address
    street = serializers.CharField(source='address.street')
    city = serializers.CharField(source='address.city')
    state = serializers.CharField(source='address.state')
    zip_code = serializers.CharField(source='address.zip_code')

    # Vehicle info
    vehicle_make = serializers.CharField(
        source='vehicle_info.make',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_model = serializers.CharField(
        source='vehicle_info.model',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_year = serializers.CharField(
        source='vehicle_info.year',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_vin = serializers.CharField(
        source='vehicle_info.vin',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_mileage = serializers.IntegerField(
        source='vehicle_info.mileage',
        required=False,
        allow_null=True
    )
    vehicle_color = serializers.CharField(
        source='vehicle_info.color',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    license_plate = serializers.CharField(
        source='vehicle_info.license_plate',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    registration_state = serializers.CharField(
        source='vehicle_info.registration_state',
        allow_blank=True,
        allow_null=True,
        required=False
    )

    signature = serializers.CharField(
        allow_blank=True,
        allow_null=True,
        required=False
    )
    signed_at = serializers.DateTimeField(read_only=True)

    def _extract_related_data(self, validated_data):
        related_data = {}
        for key in ['personal_info', 'identification_info', 'financial_profile', 'address', 'vehicle_info']:
            value = validated_data.pop(key, None)
            if value is not None:
                related_data[key] = value
        
        # Ensure personal_info is properly initialized if it's not already
        if 'personal_info' not in related_data:
            related_data['personal_info'] = {}
            
        return related_data

    def _create_related_instances(self, related_data):
        personal_data = related_data.get('personal_info', {})
        address_data = related_data.get('address', {})

        # Check if this is a draft application
        is_draft = self.context.get('is_draft', False)
        
        # For drafts, we'll use empty strings for required fields if they're missing
        if is_draft:
            # Set defaults for required fields in drafts
            if not personal_data.get('first_name'):
                personal_data['first_name'] = ''
            if not personal_data.get('last_name'):
                personal_data['last_name'] = ''
            if not personal_data.get('email'):
                personal_data['email'] = ''
            # Add a default date of birth for drafts
            if not personal_data.get('dob'):
                # Use a default date like 1990-01-01
                from datetime import date
                personal_data['dob'] = date(1990, 1, 1)
                print(f"Setting default DOB: {personal_data['dob']}")
            if not address_data.get('street'):
                address_data['street'] = ''
            if not address_data.get('city'):
                address_data['city'] = ''
            if not address_data.get('state'):
                address_data['state'] = ''
            if not address_data.get('zip_code'):
                address_data['zip_code'] = ''
        else:
            # For final submissions, enforce validation
            if not personal_data.get('first_name'):
                raise serializers.ValidationError({'first_name': 'First name is required.'})
            if not personal_data.get('last_name'):
                raise serializers.ValidationError({'last_name': 'Last name is required.'})
            if not personal_data.get('email'):
                raise serializers.ValidationError({'email': 'Email address is required.'})
                
            # Validate address data if it's required
            if not address_data.get('street') and self.context.get('require_address', True):
                raise serializers.ValidationError({'street': 'Street address is required.'})

        # Create the personal info record with the validated data
        personal_info = ApplicantPersonalInfo.objects.create(**personal_data)
        identification_info = ApplicantIdentification.objects.create(
            personal_info=personal_info,
            **(related_data.get('identification_info') or {})
        )
        financial_profile = ApplicantFinancialProfile.objects.create(
            **(related_data.get('financial_profile') or {})
        )
        address = ApplicantAddress.objects.create(**address_data)
        vehicle_info = VehicleInformation.objects.create(
            **(related_data.get('vehicle_info') or {})
        )

        return personal_info, identification_info, financial_profile, address, vehicle_info

    def _update_related_instances(self, instance, related_data):
        """Update or create related instances for a loan application"""
        
        # Handle PersonalInfo - CREATE if doesn't exist, UPDATE if it does
        personal_info = instance.personal_info
        if 'personal_info' in related_data:
            personal_data = related_data['personal_info']
            
            # Check if personal_data is already an object instance or a dict
            if isinstance(personal_data, ApplicantPersonalInfo):
                # It's already an instance, just use it
                personal_info = personal_data
                instance.personal_info = personal_info
                instance.save(update_fields=['personal_info'])
            elif isinstance(personal_data, dict):
                # It's a dictionary, process normally
                if personal_info is None:
                    # Create new personal info
                    print(f"[DEBUG] Creating new ApplicantPersonalInfo with data: {personal_data}")
                    personal_info = ApplicantPersonalInfo.objects.create(**personal_data)
                    instance.personal_info = personal_info
                    instance.save(update_fields=['personal_info'])
                else:
                    # Update existing personal info - only update non-null values
                    print(f"[DEBUG] Updating existing ApplicantPersonalInfo ID: {personal_info.id}")
                    for attr, value in personal_data.items():
                        # Skip None/empty values for existing records to prevent data loss
                        if value is not None and value != '':
                            setattr(personal_info, attr, value)
                        elif value is None or value == '':
                            # Log when trying to set null values
                            print(f"[WARNING] Skipping null/empty value for {attr}")
                    personal_info.save()

        # Handle Identification - CREATE if doesn't exist, UPDATE if it does
        identification_info = instance.identification_info
        if 'identification_info' in related_data:
            ident_data = related_data['identification_info']
            
            # Check if ident_data is already an object instance or a dict
            if isinstance(ident_data, ApplicantIdentification):
                # It's already an instance, just use it
                identification_info = ident_data
                instance.identification_info = identification_info
                instance.save(update_fields=['identification_info'])
            elif isinstance(ident_data, dict):
                # It's a dictionary, process normally
                if identification_info is None and personal_info:
                    # Create new identification
                    print(f"[DEBUG] Creating new ApplicantIdentification")
                    identification_info = ApplicantIdentification.objects.create(
                        personal_info=personal_info,
                        **ident_data
                    )
                    instance.identification_info = identification_info
                    instance.save(update_fields=['identification_info'])
                elif identification_info:
                    # Update existing identification - only update non-null values
                    print(f"[DEBUG] Updating existing ApplicantIdentification ID: {identification_info.id}")
                    for attr, value in ident_data.items():
                        if value is not None and value != '':
                            setattr(identification_info, attr, value)
                        elif value is None or value == '':
                            print(f"[WARNING] Skipping null/empty value for {attr}")
                    identification_info.save()

        # Handle Financial Profile - CREATE if doesn't exist, UPDATE if it does
        financial_profile = instance.financial_profile
        if 'financial_profile' in related_data or financial_profile is None:
            financial_data = related_data.get('financial_profile', {})
            
            # Check if financial_data is already an object instance or a dict
            if isinstance(financial_data, ApplicantFinancialProfile):
                # It's already an instance, just use it
                financial_profile = financial_data
                instance.financial_profile = financial_profile
                instance.save(update_fields=['financial_profile'])
            elif isinstance(financial_data, dict) and financial_data:
                # It's a dictionary, process normally
                if financial_profile is None:
                    # Create new financial profile
                    print(f"[DEBUG] Creating new ApplicantFinancialProfile")
                    financial_profile = ApplicantFinancialProfile.objects.create(**financial_data)
                    instance.financial_profile = financial_profile
                    instance.save(update_fields=['financial_profile'])
                else:
                    # Update existing financial profile - only update non-null values
                    print(f"[DEBUG] Updating existing ApplicantFinancialProfile ID: {financial_profile.id}")
                    for attr, value in financial_data.items():
                        if value is not None and value != '':
                            setattr(financial_profile, attr, value)
                        elif value is None or value == '':
                            print(f"[WARNING] Skipping null/empty value for {attr}")
                    financial_profile.save()

        # Handle Address - CREATE if doesn't exist, UPDATE if it does
        address = instance.address
        if 'address' in related_data:
            address_data = related_data['address']
            
            # Check if address_data is already an object instance or a dict
            if isinstance(address_data, ApplicantAddress):
                # It's already an instance, just use it
                address = address_data
                instance.address = address
                instance.save(update_fields=['address'])
            elif isinstance(address_data, dict):
                # It's a dictionary, process normally
                if address is None:
                    # Create new address
                    print(f"[DEBUG] Creating new ApplicantAddress with data: {address_data}")
                    address = ApplicantAddress.objects.create(**address_data)
                    instance.address = address
                    instance.save(update_fields=['address'])
                else:
                    # Update existing address - only update non-null values
                    print(f"[DEBUG] Updating existing ApplicantAddress ID: {address.id}")
                    for attr, value in address_data.items():
                        if value is not None and value != '':
                            setattr(address, attr, value)
                        elif value is None or value == '':
                            print(f"[WARNING] Skipping null/empty value for {attr}")
                    address.save()

        # Handle Vehicle Info - CREATE if doesn't exist, UPDATE if it does
        vehicle_info = instance.vehicle_info
        if 'vehicle_info' in related_data or vehicle_info is None:
            vehicle_data = related_data.get('vehicle_info', {})
            
            # Check if vehicle_data is already an object instance or a dict
            if isinstance(vehicle_data, VehicleInformation):
                # It's already an instance, just use it
                vehicle_info = vehicle_data
                instance.vehicle_info = vehicle_info
                instance.save(update_fields=['vehicle_info'])
            elif isinstance(vehicle_data, dict) and vehicle_data:
                # It's a dictionary, process normally
                if vehicle_info is None:
                    # Create new vehicle info
                    print(f"[DEBUG] Creating new VehicleInformation")
                    vehicle_info = VehicleInformation.objects.create(**vehicle_data)
                    instance.vehicle_info = vehicle_info
                    instance.save(update_fields=['vehicle_info'])
                else:
                    # Update existing vehicle info - only update non-null values
                    print(f"[DEBUG] Updating existing VehicleInformation ID: {vehicle_info.id}")
                    for attr, value in vehicle_data.items():
                        if value is not None and value != '':
                            setattr(vehicle_info, attr, value)
                        elif value is None or value == '':
                            print(f"[WARNING] Skipping null/empty value for {attr}")
                    vehicle_info.save()

        return personal_info, identification_info, financial_profile, address, vehicle_info

    def create(self, validated_data):
        related_data = self._extract_related_data(validated_data)
        personal_info, identification_info, financial_profile, address, vehicle_info = self._create_related_instances(related_data)

        # Store any additional dynamic fields in additional_data
        additional_fields = {}
        for key, value in validated_data.items():
            if key.startswith(('personal_', 'income_', 'vehicle_', 'co_applicant_', 'condition_')):
                additional_fields[key] = value
        
        # Remove additional fields from validated_data to avoid conflicts
        for key in list(additional_fields.keys()):
            validated_data.pop(key, None)

        validated_data.update({
            'personal_info': personal_info,
            'identification_info': identification_info,
            'financial_profile': financial_profile,
            'address': address,
            'vehicle_info': vehicle_info,
            'additional_data': additional_fields,
        })
        return super().create(validated_data)

    def update(self, instance, validated_data):
        related_data = self._extract_related_data(validated_data)
        personal_info, identification_info, financial_profile, address, vehicle_info = self._update_related_instances(instance, related_data)

        # Update additional dynamic fields - preserve existing data
        additional_fields = instance.additional_data or {}
        
        # Capture all dynamic and metadata fields
        for key, value in validated_data.items():
            if key.startswith(('personal_', 'income_', 'vehicle_', 'co_applicant_', 'condition_')):
                additional_fields[key] = value
            # Also capture metadata fields
            elif key in ['photo_metadata', 'submission_metadata', 'has_documents', 'document_count']:
                additional_fields[key] = value
        
        # Remove additional fields from validated_data to avoid conflicts
        for key in list(validated_data.keys()):
            if key.startswith(('personal_', 'income_', 'vehicle_', 'co_applicant_', 'condition_')) or key in ['photo_metadata', 'submission_metadata', 'has_documents', 'document_count']:
                validated_data.pop(key, None)

        validated_data.update({
            'personal_info': personal_info,
            'identification_info': identification_info,
            'financial_profile': financial_profile,
            'address': address,
            'vehicle_info': vehicle_info,
            'additional_data': additional_fields,
        })
        
        # Log what we're saving
        print(f"[SAVE] Updating application {instance.application_id}")
        print(f"[SAVE] Personal info: {personal_info.first_name if personal_info else 'None'} {personal_info.last_name if personal_info else ''}")
        print(f"[SAVE] Address: {address.street if address else 'None'}, {address.city if address else ''}")
        print(f"[SAVE] Vehicle: {vehicle_info.make if vehicle_info else 'None'} {vehicle_info.model if vehicle_info else ''}")
        print(f"[SAVE] Financial: Income={financial_profile.income if financial_profile else 'None'}")
        print(f"[SAVE] Additional data keys: {list(additional_fields.keys())}")
        
        return super().update(instance, validated_data)

    def validate(self, data):
        # If submitting (not draft), require terms acceptance
        if not data.get('is_draft', True) and not data.get('accept_terms', False):
            raise serializers.ValidationError({
                'accept_terms': 'You must accept the terms and conditions to submit the application.'
            })
        return data


class LoanApplicationDocumentSerializer(serializers.ModelSerializer):
    # Use separate field for reading the URL
    file_url = serializers.SerializerMethodField()
    
    def get_file_url(self, obj):
        """Return full absolute URL for the file"""
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            # Fallback to relative URL if no request context
            return obj.file.url
        return None
    
    def to_representation(self, instance):
        """Override to include both file path and full URL"""
        representation = super().to_representation(instance)
        # Add the full URL as 'file' for backwards compatibility
        representation['file'] = self.get_file_url(instance)
        return representation
    
    class Meta:
        model = LoanApplicationDocument
        fields = ['id', 'document_type', 'title', 'file', 'file_url', 'description', 'uploaded_at', 'is_analyzed', 'ai_analysis_result']
        read_only_fields = ['id', 'uploaded_at', 'is_analyzed', 'ai_analysis_result', 'file_url']


class LoanApplicationSerializer(serializers.ModelSerializer):
    """Serializer for loan applications"""
    documents = LoanApplicationDocumentSerializer(many=True, read_only=True)
    vehicle_valuation = serializers.SerializerMethodField()
    document_summary = serializers.SerializerMethodField()
    
    # Define all fields directly without using the mixin
    application_id = serializers.UUIDField(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    # Personal info
    first_name = serializers.CharField(source='personal_info.first_name', required=False, allow_blank=True, allow_null=True)
    last_name = serializers.CharField(source='personal_info.last_name', required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(source='personal_info.email', required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(source='personal_info.phone', required=False, allow_blank=True, allow_null=True)
    dob = serializers.DateField(source='personal_info.dob', required=False, allow_null=True)
    social_security = serializers.CharField(
        source='personal_info.social_security',
        allow_blank=True,
        allow_null=True,
        required=False,
        max_length=50
    )
    banks_name = serializers.CharField(
        source='personal_info.banks_name',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    
    # Identification info
    identification_type = serializers.CharField(
        source='identification_info.identification_type',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    id_issuing_agency = serializers.CharField(
        source='identification_info.id_issuing_agency',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    identification_no = serializers.CharField(
        source='identification_info.identification_no',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    
    # Financial profile
    income = serializers.DecimalField(
        source='financial_profile.income',
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    employment_status = serializers.CharField(
        source='financial_profile.employment_status',
        required=False,
        allow_blank=True,
        allow_null=True
    )
    employment_length = serializers.DecimalField(
        source='financial_profile.employment_length',
        max_digits=5,
        decimal_places=1,
        required=False,
        allow_null=True
    )
    income_source = serializers.CharField(
        source='financial_profile.income_source',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    gross_monthly_income = serializers.DecimalField(
        source='financial_profile.gross_monthly_income',
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    pay_frequency = serializers.CharField(
        source='financial_profile.pay_frequency',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    next_pay_date = serializers.DateField(
        source='financial_profile.next_pay_date',
        required=False,
        allow_null=True
    )
    last_pay_date = serializers.DateField(
        source='financial_profile.last_pay_date',
        required=False,
        allow_null=True
    )
    active_bankruptcy = serializers.CharField(
        source='financial_profile.active_bankruptcy',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    direct_deposit = serializers.CharField(
        source='financial_profile.direct_deposit',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    military_status = serializers.CharField(
        source='financial_profile.military_status',
        allow_blank=True,
        allow_null=True,
        required=False
    )

    # Address
    street = serializers.CharField(source='address.street', required=False, allow_blank=True, allow_null=True)
    city = serializers.CharField(source='address.city', required=False, allow_blank=True, allow_null=True)
    state = serializers.CharField(source='address.state', required=False, allow_blank=True, allow_null=True)
    zip_code = serializers.CharField(source='address.zip_code', required=False, allow_blank=True, allow_null=True)

    # Vehicle info
    vehicle_make = serializers.CharField(
        source='vehicle_info.make',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_model = serializers.CharField(
        source='vehicle_info.model',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_year = serializers.CharField(
        source='vehicle_info.year',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_vin = serializers.CharField(
        source='vehicle_info.vin',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    vehicle_mileage = serializers.IntegerField(
        source='vehicle_info.mileage',
        required=False,
        allow_null=True
    )
    vehicle_color = serializers.CharField(
        source='vehicle_info.color',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    license_plate = serializers.CharField(
        source='vehicle_info.license_plate',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    registration_state = serializers.CharField(
        source='vehicle_info.registration_state',
        allow_blank=True,
        allow_null=True,
        required=False
    )
    
    def get_full_name(self, obj):
        """Get the full name for the loan applicant"""
        try:
            if hasattr(obj, 'personal_info') and obj.personal_info:
                return f"{obj.personal_info.first_name} {obj.personal_info.last_name}".strip()
            elif hasattr(obj, 'get_full_name') and callable(getattr(obj, 'get_full_name')):
                return obj.get_full_name()
            return "Applicant"
        except Exception as e:
            print(f"Error getting full_name: {e}")
            return "Applicant"

    def get_vehicle_valuation(self, obj):
        """Get vehicle valuation data if available"""
        try:
            if hasattr(obj, 'vehicle_valuation') and obj.vehicle_valuation:
                valuation = obj.vehicle_valuation
                return {
                    'estimated_value_avg': str(valuation.estimated_value_avg) if valuation.estimated_value_avg else None,
                    'estimated_value_low': str(valuation.estimated_value_low) if valuation.estimated_value_low else None,
                    'estimated_value_high': str(valuation.estimated_value_high) if valuation.estimated_value_high else None,
                    'condition': valuation.condition,
                    'risk_level': valuation.risk_level,
                    'ltv_ratio': str(valuation.ltv_ratio) if valuation.ltv_ratio else None,
                    'max_loan_amount': str(valuation.max_loan_amount) if valuation.max_loan_amount else None,
                    'is_approved_for_loan': valuation.is_approved_for_loan,
                    'confidence_level': valuation.confidence_level,
                    'analyzed_at': valuation.analyzed_at,
                }
            return None
        except Exception as e:
            print(f"Error getting vehicle_valuation: {e}")
            return None

    def get_document_summary(self, obj):
        """Get summary of uploaded documents"""
        try:
            document_count = 0
            document_types = []
            
            # Count related documents (this is the correct way to check for photos/documents)
            if hasattr(obj, 'documents'):
                related_docs = obj.documents.all()
                document_count = related_docs.count()
                document_types = [doc.get_document_type_display() for doc in related_docs]
            
            return {
                'total_count': document_count,
                'document_types': document_types,
                'has_documents': document_count > 0
            }
        except Exception as e:
            print(f"Error getting document_summary: {e}")
            return {'total_count': 0, 'document_types': [], 'has_documents': False}
    
    def get_query_notes(self, obj):
        """Get the latest admin query note for this application"""
        try:
            if obj.status == 'query':
                latest_note = obj.notes.filter(author__user_type='admin').order_by('-created_at').first()
                if latest_note:
                    return {
                        'note': latest_note.note,
                        'created_at': latest_note.created_at,
                        'author': latest_note.author.get_full_name() if hasattr(latest_note.author, 'get_full_name') else latest_note.author.username
                    }
            return None
        except Exception as e:
            print(f"Error getting query_notes: {e}")
            return None
    
    query_notes = serializers.SerializerMethodField()
    
    class Meta:
        model = LoanApplication
        fields = [
            'id', 'application_id', 'user', 'status', 'is_draft',
            'full_name',  # This is defined as a SerializerMethodField
            'first_name', 'last_name', 'email', 'phone', 'dob',
            'social_security', 'identification_type', 'id_issuing_agency', 'identification_no',
            'banks_name',
            'amount', 'term', 'interest_rate', 'purpose',
            'income', 'employment_status', 'employment_length',
            'income_source', 'gross_monthly_income', 'pay_frequency',
            'next_pay_date', 'last_pay_date',
            'active_bankruptcy', 'direct_deposit', 'military_status',
            'street', 'city', 'state', 'zip_code',
            'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_vin',
            'vehicle_mileage', 'vehicle_color', 'license_plate', 'registration_state',
            'applicant_estimated_value',
            'credit_score', 'accept_terms', 'signature', 'signed_at',
            'ai_recommendation', 'ai_risk_assessment', 'ai_approval_suggestion', 
            'ai_analysis_data', 'ai_analysis_timestamp',
        'approved_amount', 'approved_at', 'approved_by', 'approval_notes',
        'created_at', 'updated_at', 'submitted_at', 'documents', 'vehicle_valuation', 'document_summary',
        'query_notes', 'additional_data'
    ]
    read_only_fields = ['id', 'application_id', 'created_at', 'updated_at', 'submitted_at', 'signed_at',
                        'ai_recommendation', 'ai_risk_assessment', 'ai_approval_suggestion', 
                        'ai_analysis_data', 'ai_analysis_timestamp',
                        'approved_at', 'approved_by']
class LoanApplicationCreateSerializer(LoanApplicationDataMixin, serializers.ModelSerializer):
    """Serializer for creating loan applications (drafts)"""
    
    class Meta:
        model = LoanApplication
        fields = [
            'id', 'application_id',  # Added id and application_id to response
            'first_name', 'last_name', 'email', 'phone', 'dob',
            'social_security', 'identification_type', 'id_issuing_agency', 'identification_no',
            'banks_name',
            'amount', 'term', 'purpose',
            'income', 'employment_status', 'employment_length',
            'income_source', 'gross_monthly_income', 'pay_frequency',
            'next_pay_date', 'last_pay_date',
            'active_bankruptcy', 'direct_deposit', 'military_status',
            'street', 'city', 'state', 'zip_code',
            'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_vin',
            'vehicle_mileage', 'vehicle_color', 'license_plate', 'registration_state',
            'applicant_estimated_value',
            'credit_score', 'accept_terms', 'signature', 'is_draft'
        ]
        
    def validate(self, data):
        """Validate and properly nest all related data"""
        # Initialize all nested data structures
        if 'personal_info' not in data:
            data['personal_info'] = {}
        if 'identification_info' not in data:
            data['identification_info'] = {}
        if 'financial_profile' not in data:
            data['financial_profile'] = {}
        if 'address' not in data:
            data['address'] = {}
        if 'vehicle_info' not in data:
            data['vehicle_info'] = {}
            
        # Extract personal info fields directly from request data if not present in validated data
        request_data = self.context.get('request').data if self.context.get('request') else {}
        
        print(f"[VALIDATE] Request data keys: {request_data.keys()}")
        
        # Map personal_info fields
        personal_fields = {
            'first_name': 'first_name', 'last_name': 'last_name', 'email': 'email',
            'phone': 'phone', 'dob': 'dob', 'social_security': 'social_security',
            'banks_name': 'banks_name'
        }
        for req_key, data_key in personal_fields.items():
            if req_key in request_data and request_data[req_key]:
                data['personal_info'][data_key] = request_data[req_key]
                print(f"  [PERSONAL] {data_key} = {request_data[req_key]}")
        
        # Map identification_info fields
        identification_fields = {
            'identification_type': 'identification_type',
            'identification_no': 'identification_no',
            'id_issuing_agency': 'id_issuing_agency'
        }
        for req_key, data_key in identification_fields.items():
            if req_key in request_data and request_data[req_key]:
                data['identification_info'][data_key] = request_data[req_key]
                print(f"  [IDENTIFICATION] {data_key} = {request_data[req_key]}")
        
        # Map address fields
        address_fields = {
            'street': 'street', 'city': 'city', 'state': 'state', 'zip_code': 'zip_code'
        }
        for req_key, data_key in address_fields.items():
            if req_key in request_data and request_data[req_key]:
                data['address'][data_key] = request_data[req_key]
                print(f"  [ADDRESS] {data_key} = {request_data[req_key]}")
        
        # Map financial_profile fields
        financial_fields = {
            'income': 'income', 'employment_status': 'employment_status',
            'employment_length': 'employment_length', 'income_source': 'income_source',
            'gross_monthly_income': 'gross_monthly_income', 'pay_frequency': 'pay_frequency',
            'next_pay_date': 'next_pay_date', 'last_pay_date': 'last_pay_date',
            'active_bankruptcy': 'active_bankruptcy', 'direct_deposit': 'direct_deposit',
            'military_status': 'military_status'
        }
        for req_key, data_key in financial_fields.items():
            if req_key in request_data and request_data[req_key]:
                data['financial_profile'][data_key] = request_data[req_key]
                print(f"  [FINANCIAL] {data_key} = {request_data[req_key]}")
        
        # Map vehicle_info fields
        vehicle_fields = {
            'vehicle_make': 'make', 'vehicle_model': 'model', 'vehicle_year': 'year',
            'vehicle_vin': 'vin', 'vehicle_mileage': 'mileage', 'vehicle_color': 'color',
            'license_plate': 'license_plate', 'registration_state': 'registration_state'
        }
        for req_key, data_key in vehicle_fields.items():
            if req_key in request_data and request_data[req_key]:
                data['vehicle_info'][data_key] = request_data[req_key]
                print(f"  [VEHICLE] {data_key} = {request_data[req_key]}")
            
        # Provide fallbacks for drafts
        if data.get('is_draft', True):
            # For drafts, provide default values if missing
            data['personal_info']['first_name'] = data['personal_info'].get('first_name') or ''
            data['personal_info']['last_name'] = data['personal_info'].get('last_name') or ''
            data['personal_info']['email'] = data['personal_info'].get('email') or ''
            
            # Handle DOB field specifically
            if not data['personal_info'].get('dob'):
                # Check if we have a dateOfBirth or dob in request_data
                if 'dateOfBirth' in request_data and request_data['dateOfBirth']:
                    from django.utils.dateparse import parse_date
                    # Parse the date from string
                    try:
                        data['personal_info']['dob'] = parse_date(request_data['dateOfBirth'])
                        print(f"Parsed DOB from dateOfBirth: {data['personal_info']['dob']}")
                    except:
                        pass
                elif 'dob' in request_data and request_data['dob']:
                    from django.utils.dateparse import parse_date
                    try:
                        data['personal_info']['dob'] = parse_date(request_data['dob'])
                        print(f"Parsed DOB from dob: {data['personal_info']['dob']}")
                    except:
                        pass
                        
                # If still no valid dob, set a default
                if not data['personal_info'].get('dob'):
                    from datetime import date
                    data['personal_info']['dob'] = date(1990, 1, 1)
                    print(f"Setting default DOB: {data['personal_info']['dob']}")
            
        # Log what's in personal_info after processing
        print(f"Final personal_info data: {data['personal_info']}")
            
        return data
    
    def create(self, validated_data):
        """Create draft application with session tracking and all related data"""
        request = self.context.get('request')
        
        print(f"[CREATE] Validated data keys: {validated_data.keys()}")
        print(f"[CREATE] Sample values - phone: {validated_data.get('phone')}, street: {validated_data.get('street')}, vehicle_make: {validated_data.get('vehicle_make')}")
        
        if request:
            # If user is authenticated, associate with user
            if hasattr(request, 'user') and request.user and request.user.is_authenticated:
                validated_data['user'] = request.user
            # For anonymous users, store session key
            elif hasattr(request, 'session'):
                if not request.session.session_key:
                    request.session.create()
                validated_data['session_key'] = request.session.session_key
        
        # Ensure is_draft is set
        validated_data['is_draft'] = validated_data.get('is_draft', True)
        
        # Extract and create related instances using the mixin's logic
        related_data = self._extract_related_data(validated_data)
        print(f"[CREATE] Related data extracted: {related_data.keys()}")
        print(f"[CREATE] Related data contents:")
        for key, value in related_data.items():
            if isinstance(value, dict):
                print(f"  {key}: {value}")
            else:
                print(f"  {key}: {type(value).__name__}")
        
        personal_info, identification_info, financial_profile, address, vehicle_info = self._create_related_instances(related_data)
        
        # Store any additional dynamic fields in additional_data
        additional_fields = {}
        for key, value in validated_data.items():
            if key.startswith(('personal_', 'income_', 'vehicle_', 'co_applicant_', 'condition_', 'photo_metadata', 'submission_metadata', 'has_documents', 'document_count')):
                additional_fields[key] = value
        
        # Remove additional fields from validated_data to avoid conflicts
        for key in list(additional_fields.keys()):
            validated_data.pop(key, None)

        validated_data.update({
            'personal_info': personal_info,
            'identification_info': identification_info,
            'financial_profile': financial_profile,
            'address': address,
            'vehicle_info': vehicle_info,
            'additional_data': additional_fields,
        })
        
        print(f"[CREATE] Creating application with personal_info: {personal_info}, address: {address}, vehicle_info: {vehicle_info}")
        
        return super(LoanApplicationDataMixin, self).create(validated_data)


class LoanApplicationUpdateSerializer(LoanApplicationDataMixin, serializers.ModelSerializer):
    """Serializer for updating loan applications"""
    
    class Meta:
        model = LoanApplication
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'dob',
            'social_security', 'identification_type', 'id_issuing_agency', 'identification_no',
            'banks_name',
            'amount', 'term', 'purpose',
            'income', 'employment_status', 'employment_length',
            'income_source', 'gross_monthly_income', 'pay_frequency',
            'next_pay_date', 'last_pay_date',
            'active_bankruptcy', 'direct_deposit', 'military_status',
            'street', 'city', 'state', 'zip_code',
            'vehicle_make', 'vehicle_model', 'vehicle_year', 'vehicle_vin',
            'vehicle_mileage', 'vehicle_color', 'license_plate', 'registration_state',
            'applicant_estimated_value',
            'credit_score', 'accept_terms', 'signature', 'is_draft', 'status'
        ]
    
    def update(self, instance, validated_data):
        """Update loan application and all related nested data"""
        print(f"[DEBUG] LoanApplicationUpdateSerializer.update called")
        print(f"[DEBUG] Instance ID: {instance.id}, Application ID: {instance.application_id}")
        print(f"[DEBUG] Request data keys: {self.context.get('request').data.keys() if self.context.get('request') else 'No request'}")
        print(f"[DEBUG] Validated data keys: {validated_data.keys()}")
        print(f"[DEBUG] Instance current state - Personal: {instance.personal_info}, Address: {instance.address}, Vehicle: {instance.vehicle_info}, Financial: {instance.financial_profile}")
        
        # Extract related data from validated_data
        related_data = self._extract_related_data(validated_data)
        print(f"[DEBUG] Related data keys: {related_data.keys()}")
        
        # Update or create related instances
        personal_info, identification_info, financial_profile, address, vehicle_info = self._update_related_instances(instance, related_data)
        
        # Update the related object references in validated_data
        validated_data.update({
            'personal_info': personal_info,
            'identification_info': identification_info,
            'financial_profile': financial_profile,
            'address': address,
            'vehicle_info': vehicle_info,
        })
        
        # Update additional dynamic fields
        additional_fields = instance.additional_data or {}
        for key, value in validated_data.items():
            if key.startswith(('personal_', 'income_', 'vehicle_', 'co_applicant_', 'condition_')):
                additional_fields[key] = value
        
        # Remove additional fields from validated_data to avoid conflicts
        for key in list(validated_data.keys()):
            if key.startswith(('personal_', 'income_', 'vehicle_', 'co_applicant_', 'condition_')):
                validated_data.pop(key, None)
        
        validated_data['additional_data'] = additional_fields
        
        print(f"[DEBUG] Calling parent update with validated_data keys: {validated_data.keys()}")
        
        # Call parent update to handle remaining fields
        return super().update(instance, validated_data)


class LoanApplicationSubmitSerializer(serializers.Serializer):
    """Serializer for submitting loan applications"""
    application_id = serializers.UUIDField()
    
    def validate_application_id(self, value):
        """Validate that application exists"""
        try:
            application = LoanApplication.objects.get(application_id=value)
            if not application.is_draft:
                raise serializers.ValidationError("Application has already been submitted.")
        except LoanApplication.DoesNotExist:
            raise serializers.ValidationError("Application not found.")
        return value


class LoanApplicationNoteSerializer(serializers.ModelSerializer):
    """Serializer for loan application notes"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = LoanApplicationNote
        fields = ['id', 'application', 'author', 'author_name', 'note', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class LoanApplicationDocumentSerializer(serializers.ModelSerializer):
    """Serializer for loan application documents"""
    
    class Meta:
        model = LoanApplicationDocument
        fields = ['id', 'application', 'document_type', 'title', 'file', 'description', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class DraftToUserSerializer(serializers.Serializer):
    """Serializer for associating draft applications with user after signup/login"""
    application_id = serializers.UUIDField()
    email = serializers.EmailField()
    
    def validate(self, data):
        """Validate that application exists and matches email"""
        try:
            application = LoanApplication.objects.get(
                application_id=data['application_id'],
                is_draft=True
            )
            if (
                not application.personal_info
                or application.personal_info.email != data['email']
            ):
                raise serializers.ValidationError({
                    'email': 'Email does not match the application.'
                })
        except LoanApplication.DoesNotExist:
            raise serializers.ValidationError({
                'application_id': 'Draft application not found.'
            })
        return data


class LoanApprovalActionSerializer(serializers.Serializer):
    """Serializer for admin approval action"""
    approved_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    approval_notes = serializers.CharField(required=False, allow_blank=True)


class LoanDecisionActionSerializer(serializers.Serializer):
    """Serializer for admin decision actions such as rejection or queries"""
    notes = serializers.CharField(required=False, allow_blank=True)
    flagged_fields = serializers.ListField(child=serializers.CharField(), required=False, allow_null=True)


class VehicleValuationSerializer(serializers.ModelSerializer):
    """Serializer for vehicle valuation results"""
    estimated_value_avg = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = VehicleValuation
        fields = [
            'id', 'application',
            'make', 'model', 'year', 'body_type', 'color',
            'condition', 'visible_damage', 'features',
            'estimated_value_low', 'estimated_value_high', 'estimated_value_avg',
            'ltv_ratio', 'max_loan_amount', 'recommended_loan_amount',
            'risk_level', 'risk_factors',
            'confidence_level', 'images_analyzed', 'analysis_notes',
            'is_approved_for_loan', 'approval_notes',
            'analyzed_at', 'updated_at'
        ]
        read_only_fields = ['id', 'analyzed_at', 'updated_at']
