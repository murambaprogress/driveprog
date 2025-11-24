from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.core.files.base import ContentFile
import base64
import os
from .models import (
    LoanApplication,
    LoanApplicationNote,
    LoanApplicationDocument,
    VehicleValuation,
    VehicleInformation,
)
from .serializers import (
    LoanApplicationSerializer,
    LoanApplicationCreateSerializer,
    LoanApplicationUpdateSerializer,
    LoanApplicationSubmitSerializer,
    LoanApplicationNoteSerializer,
    LoanApplicationDocumentSerializer,
    DraftToUserSerializer
)
from notifications.models import Notification
from accounts.models import User
from .car_image_analyzer import CarValuationService
from .gemini_loan_analyzer import GeminiLoanAnalyzer


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_authenticated and hasattr(request.user, 'user_type'):
            if request.user.user_type == 'admin':
                return True
        
        # Check if user owns the application
        if request.user.is_authenticated and obj.user == request.user:
            return True
        
        # For draft applications, check session key
        if obj.is_draft and not obj.user:
            session_key = request.session.session_key
            if session_key and obj.session_key == session_key:
                return True
        
        return False


class LoanApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for loan applications.
    Supports draft creation, updates, and submission.
    """
    queryset = LoanApplication.objects.all()
    parser_classes = []  # Will be set dynamically based on action
    permission_classes = []  # Will be set dynamically in get_permissions()
    # Enable JWT authentication - permissions will control access per action
    # authentication_classes uses default from settings (JWTAuthentication + SessionAuthentication)
    
    def get_parsers(self):
        """
        Use appropriate parsers based on action
        For file uploads use MultiPart, for JSON data use JSON parser
        """
        from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
        # Always support all parser types
        return [JSONParser(), MultiPartParser(), FormParser()]
    
    def get_permissions(self):
        """
        Allow anonymous users to create drafts
        Require authentication for other actions unless it's their own draft
        """
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['update', 'partial_update', 'retrieve']:
            return [AllowAny()]  # Will check ownership in get_queryset
        elif self.action == 'list':
            return [IsAuthenticated()]  # Require authentication for listing applications
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return LoanApplicationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return LoanApplicationUpdateSerializer
        return LoanApplicationSerializer
    
    def get_serializer_context(self):
        """
        Add request to serializer context for building absolute URLs
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """Filter queryset based on user"""
        user = self.request.user
        
        # Admin users can see all applications
        if user.is_authenticated and hasattr(user, 'user_type') and user.user_type == 'admin':
            return LoanApplication.objects.all()
        
        # Authenticated users see their own applications
        if user.is_authenticated:
            return LoanApplication.objects.filter(user=user)
        
        # Anonymous users see their draft applications via session
        session_key = self.request.session.session_key
        if session_key:
            return LoanApplication.objects.filter(session_key=session_key, is_draft=True)
        
        return LoanApplication.objects.none()
        
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard_statistics(self, request):
        """
        Return dashboard statistics for the current user.
        Requires authentication.
        URL: /api/loans/applications/dashboard_statistics/
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=401)

        applications = self.get_queryset()
        
        response_data = {
            'count': applications.count(),
            'summary': {
                'total': applications.count(),
                'draft': applications.filter(status='draft').count(),
                'pending': applications.filter(status='pending').count(),
                'under_review': applications.filter(status='under_review').count(),
                'approved': applications.filter(status='approved').count(),
                'rejected': applications.filter(status='rejected').count(),
            }
        }
        
        return Response(response_data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_applications(self, request):
        """
        Return all loan applications for the current user.
        Requires authentication.
        URL: /api/loans/applications/my_applications/
        """
        print(f"[DEBUG] ========== my_applications endpoint called ==========")
        print(f"[DEBUG] request.user: {request.user}")
        print(f"[DEBUG] request.user.is_authenticated: {request.user.is_authenticated}")
        print(f"[DEBUG] request.user.email: {getattr(request.user, 'email', 'NO EMAIL')}")
        print(f"[DEBUG] request.user.id: {getattr(request.user, 'id', 'NO ID')}")
        print(f"[DEBUG] Authorization header: {request.headers.get('Authorization', 'NOT SET')}")
        
        if not request.user.is_authenticated:
            print(f"[DEBUG] User is NOT authenticated - this should not happen with IsAuthenticated permission")
            return Response({"detail": "Authentication required"}, status=401)
        
        # First, associate any unassociated applications with this user based on email
        if request.user.email:
            # Find applications with the same email but no user
            user_email = request.user.email.lower()
            unassociated_apps = LoanApplication.objects.filter(
                user=None,
                personal_info__email__iexact=user_email
            )
            
            # Associate these applications with the current user
            if unassociated_apps.exists():
                print(f"[DEBUG] Associating {unassociated_apps.count()} applications with user {request.user}")
                unassociated_apps.update(user=request.user)
        
        # Get all applications for this user, ordered by most recent first
        applications = LoanApplication.objects.filter(user=request.user).select_related(
            'personal_info',
            'vehicle_info',
            'financial_profile',
            'address'
        ).order_by('-created_at')
        
        print(f"[DEBUG] Found {applications.count()} applications for user {request.user.email}")
        
        serializer = self.get_serializer(applications, many=True)
        
        # Add summary statistics
        response_data = {
            'count': applications.count(),
            'applications': serializer.data,
            'summary': {
                'total': applications.count(),
                'draft': applications.filter(status='draft').count(),
                'pending': applications.filter(status='pending').count(),
                'under_review': applications.filter(status='under_review').count(),
                'approved': applications.filter(status='approved').count(),
                'rejected': applications.filter(status='rejected').count(),
            }
        }
        
        return Response(response_data)
    
    def create(self, request, *args, **kwargs):
        """Create a new loan application (draft by default)"""
        print(f"[DEBUG] CREATE - User: {request.user}, Authenticated: {request.user.is_authenticated}")
        print(f"[DEBUG] CREATE - Request data keys: {request.data.keys()}")
        
        # Ensure session exists for anonymous users
        if not request.user.is_authenticated and not request.session.session_key:
            request.session.create()
            print(f"[DEBUG] Created session: {request.session.session_key}")
        
        # Log request data for debugging
        print(f"Creating application with data: {request.data}")
        
        # Check required fields directly - handle both string and boolean values
        is_draft_value = request.data.get('is_draft', True)
        if isinstance(is_draft_value, bool):
            is_draft = is_draft_value
        elif isinstance(is_draft_value, str):
            is_draft = is_draft_value.lower() in ('true', '1', 't', 'yes')
        else:
            is_draft = True  # Default to draft
        
        # For draft applications, we can be more lenient with validations
        require_address = not is_draft
        
        # Prepare context with additional flags
        context = {
            'request': request,
            'require_address': require_address
        }
            
        serializer = self.get_serializer(data=request.data, context=context)
        
        try:
            serializer.is_valid(raise_exception=True)
            application = serializer.save()
            
            # Just return the serializer data directly instead of creating a new serializer
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            # Enhanced error handling to provide more specific feedback
            print(f"Validation error: {e.detail}")
            
            # If this is specifically about missing personal info fields, make it clearer
            if 'first_name' in e.detail and 'Personal information is required' in str(e.detail.get('first_name', '')):
                return Response(
                    {'first_name': 'First name is required.', 
                     'detail': 'Please provide your name and contact information.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Otherwise return the original error
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, *args, **kwargs):
        """Update loan application"""
        instance = self.get_object()
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, instance):
            return Response(
                {'error': 'You do not have permission to edit this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent editing submitted applications
        if not instance.is_draft:
            return Response(
                {'error': 'Cannot edit a submitted application.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def _analyze_vehicle_on_submit(self, application):
        """
        Automatically analyze vehicle photos when application is submitted.
        Compares GPT-estimated value with applicant's stated value.
        Returns valuation data or None if analysis fails.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            # Collect all uploaded vehicle photos
            photo_fields = [
                application.photo_vin_sticker,
                application.photo_odometer,
                application.photo_borrower,
                application.photo_front_car,
                application.photo_vin,
                application.photo_license,
                application.photo_insurance,
            ]
            
            # Filter out empty fields and get valid image paths
            valid_photos = []
            for photo in photo_fields:
                if photo and hasattr(photo, 'path'):
                    valid_photos.append((photo.path, 'file_path'))
            
            if not valid_photos:
                logger.warning(f"No vehicle photos found for application {application.application_id}")
                return None
            
            # Initialize valuation service
            valuation_service = CarValuationService()
            
            # Get requested loan amount
            loan_amount = float(application.amount) if application.amount else 0
            
            # Perform analysis using uploaded photos
            logger.info(f"Analyzing {len(valid_photos)} photos for application {application.application_id}")
            analysis_result = valuation_service.evaluate_for_loan(
                images=valid_photos,
                loan_amount=loan_amount
            )
            
            if not analysis_result.get('approved') is not None:
                logger.error(f"Analysis failed for application {application.application_id}")
                return None
            
            # Extract vehicle analysis data
            vehicle_data = analysis_result.get('vehicle_analysis', {})
            valuation_data = analysis_result.get('valuation', {})
            
            # Create or update VehicleValuation record
            existing_vehicle = application.vehicle_info

            valuation, created = VehicleValuation.objects.update_or_create(
                application=application,
                defaults={
                    'make': vehicle_data.get('make') or (existing_vehicle.make if existing_vehicle else ''),
                    'model': vehicle_data.get('model') or (existing_vehicle.model if existing_vehicle else ''),
                    'year': vehicle_data.get('year') or (existing_vehicle.year if existing_vehicle else ''),
                    'body_type': vehicle_data.get('body_type', ''),
                    'color': vehicle_data.get('color') or (existing_vehicle.color if existing_vehicle else ''),
                    'condition': vehicle_data.get('condition', 'good'),
                    'visible_damage': vehicle_data.get('visible_damage', []),
                    'features': vehicle_data.get('features', []),
                    'estimated_value_low': valuation_data.get('estimated_value', 0),
                    'estimated_value_high': valuation_data.get('estimated_value', 0),
                    'estimated_value_avg': valuation_data.get('estimated_value', 0),
                    'ltv_ratio': valuation_data.get('ltv_ratio', 0),
                    'max_loan_amount': valuation_data.get('max_loan_amount', 0),
                    'recommended_loan_amount': valuation_data.get('max_loan_amount', 0),
                    'risk_level': 'high' if not analysis_result.get('approved') else 'low',
                    'risk_factors': analysis_result.get('risk_factors', []),
                    'confidence_level': vehicle_data.get('confidence', 'medium'),
                    'images_analyzed': vehicle_data.get('images_analyzed', len(valid_photos)),
                    'analysis_notes': analysis_result.get('recommendation', ''),
                    'full_analysis_data': analysis_result,
                    'is_approved_for_loan': analysis_result.get('approved', False),
                    'approval_notes': analysis_result.get('recommendation', '')
                }
            )
            
            logger.info(f"Vehicle valuation {'created' if created else 'updated'} for application {application.application_id}")
            logger.info(f"Estimated value: ${valuation_data.get('estimated_value', 0):,.2f}, LTV: {valuation_data.get('ltv_ratio', 0):.2f}%")
            
            # Return summary for response
            return {
                'analyzed': True,
                'estimated_value': float(valuation_data.get('estimated_value', 0)),
                'requested_amount': float(loan_amount),
                'ltv_ratio': float(valuation_data.get('ltv_ratio', 0)),
                'ai_approved': analysis_result.get('approved', False),
                'recommendation': analysis_result.get('recommendation', ''),
                'confidence': vehicle_data.get('confidence', 'medium'),
                'images_analyzed': len(valid_photos)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing vehicle for application {application.application_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return None
    
    def _analyze_with_gemini_ai(self, application):
        """
        Analyze loan application with Gemini AI and save results to database.
        Returns AI analysis data or None if analysis fails.
        This is optional - submission will succeed even if AI analysis fails.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            logger.info(f"Starting Gemini AI analysis for application {application.application_id}")
            
            # Initialize Gemini analyzer
            gemini_analyzer = GeminiLoanAnalyzer()
            
            # Perform AI analysis
            ai_result = gemini_analyzer.analyze_loan_application(application)
            
            if not ai_result:
                logger.warning(f"Gemini AI analysis returned no results for application {application.application_id}")
                return None
            
            # Save AI analysis to application
            application.ai_recommendation = ai_result.get('recommendation', '')
            application.ai_risk_assessment = ai_result.get('risk_assessment', 'medium')
            application.ai_approval_suggestion = ai_result.get('approval_suggestion', 'review')
            application.ai_analysis_data = ai_result
            application.ai_analysis_timestamp = timezone.now()
            application.save()
            
            logger.info(f"Gemini AI analysis completed for application {application.application_id}")
            logger.info(f"AI Suggestion: {ai_result.get('approval_suggestion')}, Risk: {ai_result.get('risk_assessment')}")
            
            return ai_result
            
        except ImportError as e:
            logger.warning(f"Gemini AI not available (missing dependencies): {str(e)}")
            logger.info("Application will be submitted without AI analysis - manual review required")
            return None
        except Exception as e:
            # Check if it's a credentials error
            error_msg = str(e).lower()
            if 'credential' in error_msg or 'authentication' in error_msg or 'adc' in error_msg:
                logger.warning(f"Gemini AI credentials not configured for application {application.application_id}")
                logger.info("Application will be submitted without AI analysis. To enable AI analysis, configure Google Cloud credentials.")
            else:
                logger.error(f"Error in Gemini AI analysis for application {application.application_id}: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
            return None
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def submit(self, request):
        """
        Submit a loan application.
        Requires user to be authenticated.
        """
        print(f"Submission request data: {request.data}")
        
        # Handle both form data and JSON data
        # Accept either 'id' (integer) or 'application_id' (UUID)
        app_id = request.data.get('id') or request.data.get('application_id')
        print(f"Extracted app_id: {app_id}, type: {type(app_id)}")
        
        if not app_id:
            print("No app_id found in request.data, trying serializer")
            serializer = LoanApplicationSubmitSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            app_id = serializer.validated_data.get('id') or serializer.validated_data.get('application_id')
            print(f"Extracted app_id from serializer: {app_id}")
        
        try:
            # Try to get by integer id first, then by UUID application_id
            if isinstance(app_id, int) or (isinstance(app_id, str) and app_id.isdigit()):
                print(f"Looking up application by integer id: {app_id}")
                application = LoanApplication.objects.get(id=int(app_id))
            else:
                print(f"Looking up application by UUID application_id: {app_id}")
                application = LoanApplication.objects.get(application_id=app_id)
            print(f"Found application: {application.id} / {application.application_id}")
        except LoanApplication.DoesNotExist:
            print(f"Application not found with id: {app_id}")
            return Response(
                {'error': 'Application not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error finding application: {str(e)}")
            return Response(
                {'error': f'Error finding application: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            # Return special response indicating login/signup required
            return Response(
                {
                    'requires_auth': True,
                    'message': 'Please sign up or log in to submit your application.',
                    'application_id': str(application.application_id),
                    'autofill_data': {
                        'first_name': application.personal_info.first_name if application.personal_info else '',
                        'last_name': application.personal_info.last_name if application.personal_info else '',
                        'email': application.personal_info.email if application.personal_info else '',
                        'phone': application.personal_info.phone if application.personal_info else '',
                        'dob': application.personal_info.dob if application.personal_info else None,
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, application):
            print("Permission check failed")
            return Response(
                {'error': 'You do not have permission to submit this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate all required fields are present before submission
        validation_errors = {}
        
        print(f"Checking accept_terms: {application.accept_terms}")
        if not application.accept_terms:
            print("accept_terms validation failed")
            validation_errors['accept_terms'] = 'You must accept the terms and conditions.'

        print(f"Checking signature: {application.signature}")
        if not application.signature:
            print("signature validation failed")
            validation_errors['signature'] = 'Please sign the application before submitting.'
        
        # Debug: Check what we have
        print(f"[VALIDATION] Application {application.id} state:")
        print(f"  - personal_info exists: {application.personal_info is not None}")
        if application.personal_info:
            print(f"    - first_name: '{application.personal_info.first_name}'")
            print(f"    - last_name: '{application.personal_info.last_name}'")
            print(f"    - email: '{application.personal_info.email}'")
            print(f"    - phone: '{application.personal_info.phone}'")
            print(f"    - dob: '{application.personal_info.dob}'")
        print(f"  - address exists: {application.address is not None}")
        if application.address:
            print(f"    - street: '{application.address.street}'")
            print(f"    - city: '{application.address.city}'")
            print(f"    - state: '{application.address.state}'")
            print(f"    - zip_code: '{application.address.zip_code}'")
        print(f"  - financial_profile exists: {application.financial_profile is not None}")
        if application.financial_profile:
            print(f"    - income: '{application.financial_profile.income}'")
            print(f"    - employment_status: '{application.financial_profile.employment_status}'")
        print(f"  - vehicle_info exists: {application.vehicle_info is not None}")
        if application.vehicle_info:
            print(f"    - make: '{application.vehicle_info.make}'")
            print(f"    - model: '{application.vehicle_info.model}'")
            print(f"    - year: '{application.vehicle_info.year}'")
            print(f"    - vin: '{application.vehicle_info.vin}'")
        
        # Validate personal information
        if not application.personal_info:
            validation_errors['personal_info'] = 'Personal information is missing.'
        else:
            if not application.personal_info.first_name:
                validation_errors['first_name'] = 'First name is required.'
            if not application.personal_info.last_name:
                validation_errors['last_name'] = 'Last name is required.'
            if not application.personal_info.email:
                validation_errors['email'] = 'Email is required.'
            if not application.personal_info.phone:
                validation_errors['phone'] = 'Phone number is required.'
            if not application.personal_info.dob:
                validation_errors['dob'] = 'Date of birth is required.'
        
        # Validate address
        if not application.address:
            validation_errors['address'] = 'Address information is missing.'
        else:
            if not application.address.street:
                validation_errors['street'] = 'Street address is required.'
            if not application.address.city:
                validation_errors['city'] = 'City is required.'
            if not application.address.state:
                validation_errors['state'] = 'State is required.'
            if not application.address.zip_code:
                validation_errors['zip_code'] = 'Zip code is required.'
        
        # Validate financial profile
        if not application.financial_profile:
            validation_errors['financial_profile'] = 'Financial information is missing.'
        else:
            # Accept either annual income OR monthly income
            if not application.financial_profile.income and not application.financial_profile.gross_monthly_income:
                validation_errors['income'] = 'Income information is required (either annual or monthly).'
            if not application.financial_profile.employment_status:
                validation_errors['employment_status'] = 'Employment status is required.'
        
        # Validate vehicle information
        if not application.vehicle_info:
            validation_errors['vehicle_info'] = 'Vehicle information is missing.'
        else:
            if not application.vehicle_info.make:
                validation_errors['vehicle_make'] = 'Vehicle make is required.'
            if not application.vehicle_info.model:
                validation_errors['vehicle_model'] = 'Vehicle model is required.'
            if not application.vehicle_info.year:
                validation_errors['vehicle_year'] = 'Vehicle year is required.'
            if not application.vehicle_info.vin:
                validation_errors['vehicle_vin'] = 'Vehicle VIN is required.'
        
        # Validate loan details
        if not application.amount:
            validation_errors['amount'] = 'Loan amount is required.'
        
        # If there are validation errors, return them all at once
        if validation_errors:
            print(f"Validation errors found: {validation_errors}")
            return Response(
                {
                    'error': 'Application has missing required fields.',
                    'validation_errors': validation_errors
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Associate with current user if not already (must be done before submit)
        if not application.user:
            application.user = request.user
            application.session_key = None  # Clear session key when associating with user
            application.save()
        
        # Automatically analyze vehicle photos and estimate value
        valuation_result = self._analyze_vehicle_on_submit(application)
        
        # Analyze application with Gemini AI
        gemini_result = self._analyze_with_gemini_ai(application)
        
        # Submit the application
        try:
            application.submit()
            # Create notifications for all admin users
            admin_users = User.objects.filter(user_type='admin')
            for admin in admin_users:
                Notification.objects.create(
                    recipient=admin,
                    message=f"New loan application #{application.application_id} submitted."
                )
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        
        response_serializer = LoanApplicationSerializer(application)
        response_data = {
            'message': 'Application submitted successfully!',
            'application': response_serializer.data
        }
        
        # Include AI analysis in response
        if gemini_result:
            response_data['ai_analysis'] = {
                'recommendation': gemini_result.get('recommendation'),
                'risk_assessment': gemini_result.get('risk_assessment'),
                'approval_suggestion': gemini_result.get('approval_suggestion'),
                'key_strengths': gemini_result.get('key_strengths', []),
                'key_concerns': gemini_result.get('key_concerns', []),
                'confidence_score': gemini_result.get('confidence_score', 0),
            }
        
        # Include valuation data if analysis was successful
        if valuation_result:
            response_data['vehicle_valuation'] = valuation_result
            
            # If we have both AI and applicant estimates, include comparison
            if application.applicant_estimated_value:
                try:
                    valuation_obj = VehicleValuation.objects.get(application=application)
                    comparison = valuation_obj.compare_with_applicant_estimate()
                    response_data['value_comparison'] = comparison
                except VehicleValuation.DoesNotExist:
                    pass
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def associate_draft(self, request):
        """
        Associate a draft application with the logged-in user.
        Called after user signs up or logs in.
        """
        serializer = DraftToUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        application_id = serializer.validated_data['application_id']
        user_email = request.user.email.lower()
        
        try:
            application = LoanApplication.objects.get(
                application_id=application_id
            )
        except LoanApplication.DoesNotExist:
            # If specific application not found, try to find any drafts matching this user's email
            if serializer.validated_data.get('email'):
                email_to_match = serializer.validated_data['email'].lower()
                try:
                    # Try to find a draft application with matching email
                    application = LoanApplication.objects.filter(
                        user=None,
                        personal_info__email__iexact=email_to_match,
                        is_draft=True
                    ).order_by('-created_at').first()
                    
                    if not application:
                        return Response(
                            {'error': 'No draft applications found matching your email.'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                except Exception as e:
                    return Response(
                        {'error': f'Error finding drafts: {str(e)}'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                return Response(
                    {'error': 'Draft application not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Check if application already has a different user (security check)
        if application.user and application.user.id != request.user.id:
            return Response(
                {'error': 'This application is already associated with another user.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Associate with user
        application.user = request.user
        application.session_key = None  # Clear session key
        application.save()
        
        # Also associate any other applications with the same email
        if application.personal_info and application.personal_info.email:
            app_email = application.personal_info.email.lower()
            LoanApplication.objects.filter(
                user=None,
                personal_info__email__iexact=app_email
            ).update(user=request.user)
        
        response_serializer = LoanApplicationSerializer(application)
        return Response(
            {
                'message': 'Application associated with your account.',
                'application': response_serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def resume(self, request, pk=None):
        """
        Get a draft application to resume filling it out.
        """
        application = self.get_object()
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, application):
            return Response(
                {'error': 'You do not have permission to access this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not application.is_draft:
            return Response(
                {'error': 'This application has already been submitted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = LoanApplicationSerializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser])
    def analyze_vehicle(self, request, pk=None):
        """
        Analyze uploaded vehicle images and provide valuation for loan approval.
        Accepts multiple vehicle images and uses GPT-4 Vision API to determine:
        - Vehicle make, model, year, condition
        - Estimated market value
        - Loan-to-value ratio
        - Approval recommendation
        """
        application = self.get_object()
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, application):
            return Response(
                {'error': 'You do not have permission to analyze this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get uploaded images
        images = request.FILES.getlist('images')
        if not images:
            return Response(
                {'error': 'No images provided. Please upload at least one vehicle image.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(images) > 10:
            return Response(
                {'error': 'Maximum 10 images allowed per analysis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Save images as documents
            saved_images = []
            for idx, image in enumerate(images):
                doc = LoanApplicationDocument.objects.create(
                    application=application,
                    document_type='vehicle_image',
                    title=f'Vehicle Image {idx + 1}',
                    file=image,
                    description='Vehicle image for AI analysis'
                )
                saved_images.append(doc)
            
            # Get image paths for analysis
            image_paths = [doc.file.path for doc in saved_images]
            
            # Initialize valuation service
            valuation_service = CarValuationService()
            
            # Get loan amount from application
            loan_amount = float(application.amount) if application.amount else 10000.0
            
            # Perform analysis
            analysis_result = valuation_service.evaluate_for_loan(
                image_paths=image_paths,
                requested_loan_amount=loan_amount
            )
            
            # Store analysis results in documents
            for doc in saved_images:
                doc.ai_analysis_result = analysis_result
                doc.is_analyzed = True
                doc.save()
            
            # Create or update VehicleValuation record
            valuation, created = VehicleValuation.objects.update_or_create(
                application=application,
                defaults={
                    'make': analysis_result.get('vehicle_info', {}).get('make', ''),
                    'model': analysis_result.get('vehicle_info', {}).get('model', ''),
                    'year': analysis_result.get('vehicle_info', {}).get('year', ''),
                    'body_type': analysis_result.get('vehicle_info', {}).get('body_type', ''),
                    'color': analysis_result.get('vehicle_info', {}).get('color', ''),
                    'condition': analysis_result.get('condition_assessment', {}).get('overall_condition', 'good'),
                    'visible_damage': analysis_result.get('condition_assessment', {}).get('visible_damage', []),
                    'features': analysis_result.get('vehicle_info', {}).get('features', []),
                    'estimated_value_low': analysis_result.get('estimated_value', {}).get('low', 0),
                    'estimated_value_high': analysis_result.get('estimated_value', {}).get('high', 0),
                    'estimated_value_avg': analysis_result.get('estimated_value', {}).get('average', 0),
                    'ltv_ratio': analysis_result.get('loan_assessment', {}).get('ltv_ratio', 0),
                    'max_loan_amount': analysis_result.get('loan_assessment', {}).get('max_loan_amount', 0),
                    'recommended_loan_amount': analysis_result.get('loan_assessment', {}).get('recommended_amount', 0),
                    'risk_level': analysis_result.get('risk_assessment', {}).get('risk_level', 'medium'),
                    'risk_factors': analysis_result.get('risk_assessment', {}).get('risk_factors', []),
                    'confidence_level': analysis_result.get('confidence', 'medium'),
                    'images_analyzed': len(image_paths),
                    'analysis_notes': analysis_result.get('notes', ''),
                    'full_analysis_data': analysis_result,
                    'is_approved_for_loan': analysis_result.get('loan_assessment', {}).get('decision', '') == 'approved',
                    'approval_notes': analysis_result.get('loan_assessment', {}).get('recommendation', '')
                }
            )
            
            # Update application with vehicle details if available
            if analysis_result.get('vehicle_info'):
                vehicle_info_data = analysis_result['vehicle_info']
                app_vehicle_info = application.vehicle_info
                if app_vehicle_info is None:
                    app_vehicle_info = VehicleInformation.objects.create()
                    application.vehicle_info = app_vehicle_info
                    application.save(update_fields=['vehicle_info'])

                updated = False
                if vehicle_info_data.get('make') and not app_vehicle_info.make:
                    app_vehicle_info.make = vehicle_info_data['make']
                    updated = True
                if vehicle_info_data.get('model') and not app_vehicle_info.model:
                    app_vehicle_info.model = vehicle_info_data['model']
                    updated = True
                if vehicle_info_data.get('year') and not app_vehicle_info.year:
                    app_vehicle_info.year = vehicle_info_data['year']
                    updated = True
                if vehicle_info_data.get('color') and not app_vehicle_info.color:
                    app_vehicle_info.color = vehicle_info_data['color']
                    updated = True

                if updated:
                    app_vehicle_info.save()
            
            return Response({
                'success': True,
                'message': 'Vehicle analysis completed successfully',
                'analysis': {
                    'vehicle': {
                        'make': valuation.make,
                        'model': valuation.model,
                        'year': valuation.year,
                        'color': valuation.color,
                        'body_type': valuation.body_type,
                    },
                    'condition': {
                        'overall': valuation.condition,
                        'damage': valuation.visible_damage,
                        'features': valuation.features,
                    },
                    'valuation': {
                        'estimated_low': str(valuation.estimated_value_low),
                        'estimated_high': str(valuation.estimated_value_high),
                        'estimated_average': str(valuation.estimated_value_avg),
                    },
                    'loan_assessment': {
                        'ltv_ratio': str(valuation.ltv_ratio),
                        'max_loan_amount': str(valuation.max_loan_amount),
                        'recommended_amount': str(valuation.recommended_loan_amount),
                        'is_approved': valuation.is_approved_for_loan,
                        'approval_notes': valuation.approval_notes,
                    },
                    'risk': {
                        'level': valuation.risk_level,
                        'factors': valuation.risk_factors,
                    },
                    'metadata': {
                        'confidence': valuation.confidence_level,
                        'images_analyzed': valuation.images_analyzed,
                        'analyzed_at': valuation.analyzed_at,
                    }
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Error analyzing vehicle images: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """Admin action: approve a loan application with an approved amount under policy limits."""
        application = self.get_object()

        # Only admins may approve
        if not hasattr(request.user, 'user_type') or request.user.user_type != 'admin':
            return Response({'error': 'Only admins can approve applications.'}, status=status.HTTP_403_FORBIDDEN)

        if application.is_draft or application.status == 'draft':
            return Response({'error': 'Draft applications cannot be approved.'}, status=status.HTTP_400_BAD_REQUEST)

        if application.status not in ('pending', 'under_review'):
            return Response({'error': f"Cannot approve an application in '{application.status}' status."}, status=status.HTTP_400_BAD_REQUEST)

        # Parse payload
        from .serializers import LoanApprovalActionSerializer
        serializer = LoanApprovalActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approved_amount = float(serializer.validated_data['approved_amount'])
        approval_notes = serializer.validated_data.get('approval_notes', '')

        # Compute policy bounds
        vehicle_value = application.get_vehicle_value_for_policy()
        max_eligible = application.get_max_eligible_loan()

        if approved_amount > max_eligible:
            return Response(
                {
                    'error': 'Approved amount exceeds policy limit.',
                    'policy': {
                        'vehicle_value': vehicle_value,
                        'max_ltv_ratio': getattr(settings, 'LOAN_MAX_LTV_RATIO', 0.5),
                        'absolute_cap': getattr(settings, 'LOAN_MAX_LIMIT', 25000),
                        'max_eligible': max_eligible,
                    }
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Approve
        application.approved_amount = approved_amount
        application.approval_notes = approval_notes or application.approval_notes
        application.status = 'approved'
        application.is_draft = False
        application.approved_by = request.user
        application.approved_at = timezone.now()
        application.save()

        # Create a notification for the user
        if application.user:
            Notification.objects.create(
                recipient=application.user,
                message=f"Your loan application #{application.application_id} has been approved!"
            )

        # Send notification email to user
        if application.user and application.user.email:
            try:
                from django.core.mail import send_mail
                from django.template.loader import render_to_string
                
                subject = 'Loan Application Approved - DriveCash'
                message = f"""
Dear {application.personal_info.first_name if application.personal_info else 'Valued Customer'},

Congratulations! Your loan application has been approved.

Application ID: {application.application_id}
Approved Amount: ${approved_amount:,.2f}
Status: Approved

{approval_notes if approval_notes else ''}

Please log in to your account to review the details and next steps.

Thank you for choosing DriveCash!

Best regards,
DriveCash Team
                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [application.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send approval email: {str(e)}")

        response = LoanApplicationSerializer(application)
        return Response(
            {
                'message': 'Application approved successfully.',
                'application': response.data,
                'policy': {
                    'vehicle_value': vehicle_value,
                    'max_eligible': max_eligible,
                }
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Admin action: reject a loan application with optional notes."""
        if not hasattr(request.user, 'user_type') or request.user.user_type != 'admin':
            return Response({'error': 'Only admins can reject applications.'}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        from .serializers import LoanDecisionActionSerializer

        if application.is_draft or application.status == 'draft':
            return Response({'error': 'Draft applications cannot be rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        if application.status not in ('pending', 'under_review'):
            return Response({'error': f"Cannot reject an application in '{application.status}' status."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = LoanDecisionActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notes = serializer.validated_data.get('notes', '')

        application.status = 'rejected'
        application.is_draft = False
        application.approved_amount = None
        if notes:
            application.approval_notes = notes
        application.save()

        if application.user:
            Notification.objects.create(
                recipient=application.user,
                message=f"Your loan application #{application.application_id} has been rejected."
            )

        if notes:
            LoanApplicationNote.objects.create(
                application=application,
                author=request.user,
                note=notes
            )

        # Send notification email to user
        if application.user and application.user.email:
            try:
                from django.core.mail import send_mail
                
                subject = 'Loan Application Update - DriveCash'
                message = f"""
Dear {application.personal_info.first_name if application.personal_info else 'Valued Customer'},

We regret to inform you that your loan application has been declined.

Application ID: {application.application_id}
Status: Declined

Reason:
{notes if notes else 'Please contact us for more information.'}

If you have any questions or would like to discuss this decision, please don't hesitate to contact our support team.

Thank you for your interest in DriveCash.

Best regards,
DriveCash Team
                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [application.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send rejection email: {str(e)}")

        response = LoanApplicationSerializer(application)
        return Response(
            {
                'message': 'Application rejected successfully.',
                'application': response.data,
            },
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def raise_query(self, request, pk=None):
        """Admin action: flag a loan application for additional information."""
        if not hasattr(request.user, 'user_type') or request.user.user_type != 'admin':
            return Response({'error': 'Only admins can flag applications.'}, status=status.HTTP_403_FORBIDDEN)

        application = self.get_object()
        from .serializers import LoanDecisionActionSerializer

        if application.is_draft or application.status == 'draft':
            return Response({'error': 'Draft applications cannot be flagged for review.'}, status=status.HTTP_400_BAD_REQUEST)

        if application.status != 'pending':
            return Response({'error': f'Cannot raise query for loan with status: {application.status}. Only pending applications can be flagged.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure we have data
        data = request.data if request.data else {}
        serializer = LoanDecisionActionSerializer(data=data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        notes = serializer.validated_data.get('notes', '')

        application.status = 'query'
        application.is_draft = False
        application.save(update_fields=['status', 'is_draft', 'updated_at'])

        if application.user:
            Notification.objects.create(
                recipient=application.user,
                message=f"Your loan application #{application.application_id} has a new query."
            )

        if notes:
            LoanApplicationNote.objects.create(
                application=application,
                author=request.user,
                note=notes
            )

        # Send notification email to user
        if application.user and application.user.email:
            try:
                from django.core.mail import send_mail
                
                subject = 'Action Required: Loan Application Query - DriveCash'
                message = f"""
Dear {application.personal_info.first_name if application.personal_info else 'Valued Customer'},

We are reviewing your loan application and need additional information.

Application ID: {application.application_id}
Status: Under Review

Query:
{notes if notes else 'We need additional information to process your application.'}

Please log in to your account to respond to this query or contact our support team for assistance.

Thank you for your patience.

Best regards,
DriveCash Team
                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [application.user.email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Failed to send query email: {str(e)}")

        response = LoanApplicationSerializer(application)
        return Response(
            {
                'message': 'Application flagged for additional review.',
                'application': response.data,
            },
            status=status.HTTP_200_OK
        )

    # Note: my_applications endpoint is defined earlier with summary data.
    # We keep a single implementation to avoid duplicate routes and return shape conflicts.
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def withdraw(self, request, pk=None):
        """User action: withdraw/cancel a loan application"""
        application = self.get_object()
        
        # Check permissions - only the owner can withdraw
        if application.user != request.user:
            return Response(
                {'error': 'You do not have permission to withdraw this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Can only withdraw draft or pending applications
        if application.status not in ('draft', 'pending'):
            return Response(
                {'error': f"Cannot withdraw an application in '{application.status}' status."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status to withdrawn
        application.status = 'withdrawn'
        application.save(update_fields=['status', 'updated_at'])
        
        response = LoanApplicationSerializer(application)
        return Response(
            {
                'message': 'Application withdrawn successfully.',
                'application': response.data,
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def resolve_query(self, request, pk=None):
        """User action: resolve query and resubmit application after making changes"""
        application = self.get_object()
        
        # Check permissions - only the owner can resolve their own query
        if application.user != request.user:
            return Response(
                {'error': 'You do not have permission to resolve this query.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Can only resolve queries for applications in 'query' status
        if application.status != 'query':
            return Response(
                {'error': f"Cannot resolve query for application in '{application.status}' status. Only applications with 'query' status can be resolved."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Change status back to pending for admin review
        application.status = 'pending'
        application.save(update_fields=['status', 'updated_at'])
        
        # Add a note that user has addressed the query
        LoanApplicationNote.objects.create(
            application=application,
            author=request.user,
            note="User has addressed the query and resubmitted the application for review."
        )

        # Create notifications for all admin users
        admin_users = User.objects.filter(user_type='admin')
        for admin in admin_users:
            Notification.objects.create(
                recipient=admin,
                message=f"Query resolved for loan application #{application.application_id}."
            )
        
        # Send notification email to admins
        try:
            from django.core.mail import send_mail
            from accounts.models import User
            
            admin_emails = User.objects.filter(user_type='admin', is_active=True).values_list('email', flat=True)
            
            if admin_emails:
                subject = f'Query Resolved: Loan Application {application.application_id} - DriveCash'
                message = f"""
A user has resolved the query and resubmitted their loan application for review.

Application ID: {application.application_id}
User: {application.personal_info.first_name if application.personal_info else 'N/A'} {application.personal_info.last_name if application.personal_info else ''}
Amount: ${application.amount:,.2f}
Status: Pending Review

Please review the updated application in the admin portal.

DriveCash Admin Team
                """
                
                send_mail(
                    subject,
                    message,
                    'noreply@drivecash.com',
                    list(admin_emails),
                    fail_silently=True,
                )
        except Exception as e:
            print(f"Failed to send query resolution email to admins: {str(e)}")
        
        response = LoanApplicationSerializer(application)
        return Response(
            {
                'message': 'Query resolved. Application resubmitted for review.',
                'application': response.data,
            },
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        """Delete a loan application (drafts only)"""
        instance = self.get_object()
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, instance):
            return Response(
                {'error': 'You do not have permission to delete this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Only allow deleting drafts
        if not instance.is_draft or instance.status != 'draft':
            return Response(
                {'error': 'Only draft applications can be deleted. Use withdraw for submitted applications.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.delete()
        return Response(
            {'message': 'Draft application deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def documents(self, request, pk=None):
        """Get all documents for a loan application"""
        application = self.get_object()
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, application):
            return Response(
                {'error': 'You do not have permission to view documents for this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Collect all document fields and their metadata
        documents = []
        document_fields = [
            ('photo_vin_sticker', 'VIN Sticker'),
            ('photo_odometer', 'Odometer'),
            ('photo_borrower', 'Borrower ID'),
            ('photo_front_car', 'Vehicle Front'),
            ('photo_vin', 'VIN Plate'),
            ('photo_license', 'Driver\'s License'),
            ('photo_insurance', 'Insurance'),
        ]
        
        for field_name, display_name in document_fields:
            field_value = getattr(application, field_name)
            if field_value:
                documents.append({
                    'id': f"{application.id}_{field_name}",
                    'field_name': field_name,
                    'display_name': display_name,
                    'url': field_value.url if hasattr(field_value, 'url') else str(field_value),
                    'filename': field_value.name.split('/')[-1] if hasattr(field_value, 'name') else display_name,
                    'size': field_value.size if hasattr(field_value, 'size') else None,
                    'uploaded_at': application.updated_at
                })
        
        # Also include documents from LoanApplicationDocument model
        loan_documents = LoanApplicationDocument.objects.filter(application=application)
        for doc in loan_documents:
            documents.append({
                'id': doc.id,
                'field_name': doc.document_type,
                'display_name': doc.title,
                'url': doc.file.url if hasattr(doc.file, 'url') else str(doc.file),
                'filename': doc.file.name.split('/')[-1] if hasattr(doc.file, 'name') else doc.title,
                'size': doc.file.size if hasattr(doc.file, 'size') else None,
                'uploaded_at': doc.uploaded_at,
                'description': doc.description,
                'document_type': doc.document_type,
                'is_analyzed': doc.is_analyzed,
                'ai_analysis_result': doc.ai_analysis_result
            })
        
        return Response({
            'application_id': application.application_id,
            'documents': documents,
            'total_count': len(documents)
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny], parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        """Upload a document for a loan application"""
        application = self.get_object()
        
        # Check permissions
        permission = IsOwnerOrAdmin()
        if not permission.has_object_permission(request, self, application):
            return Response(
                {'error': 'You do not have permission to upload documents for this application.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Allow uploads to draft and pending applications
        # Prevent uploading to approved/rejected applications unless admin
        if application.status in ['approved', 'rejected', 'withdrawn'] and not (hasattr(request.user, 'user_type') and request.user.user_type == 'admin'):
            return Response(
                {'error': 'Cannot upload documents to a finalized application.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the file and field name
        uploaded_file = request.FILES.get('file')
        field_name = request.data.get('field_name', request.data.get('document_type', 'other'))
        
        print(f"[UPLOAD] Uploading document for application {application.id}, field_name: {field_name}")
        
        if not uploaded_file:
            return Response(
                {'error': 'No file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Map frontend field names to backend photo fields and document types
        field_to_model_field = {
            'govIdFront': 'photo_license',
            'govIdBack': 'photo_license',
            'title': 'photo_vin_sticker',
            'backOfTitle': 'photo_vin_sticker',
            'vinFromTitle': 'photo_vin',
            'vinFromDash': 'photo_vin',
            'vinFromSticker': 'photo_vin_sticker',
            'odometer': 'photo_odometer',
            'frontCar': 'photo_front_car',
            'borrower': 'photo_borrower',
            'insurance': 'photo_insurance'
        }
        
        # Map frontend field names to valid document_type choices
        field_to_document_type = {
            'govIdFront': 'photo_license',
            'govIdBack': 'photo_license',
            'title': 'photo_vin_sticker',
            'backOfTitle': 'photo_vin_sticker',
            'vinFromTitle': 'photo_vin_plate',
            'vinFromDash': 'photo_vin_plate',
            'vinFromSticker': 'photo_vin_sticker',
            'odometer': 'photo_odometer',
            'frontCar': 'photo_front_car',
            'borrower': 'photo_borrower',
            'insurance': 'photo_insurance'
        }
        
        backend_field = field_to_model_field.get(field_name, None)
        document_type = field_to_document_type.get(field_name, 'other')
        
        # If we have a direct mapping to a photo field, save it there
        if backend_field and hasattr(application, backend_field):
            setattr(application, backend_field, uploaded_file)
            application.save(update_fields=[backend_field])
            print(f"[UPLOAD] Saved to {backend_field}")
            
            return Response({
                'success': True,
                'field_name': field_name,
                'backend_field': backend_field,
                'filename': uploaded_file.name,
                'size': uploaded_file.size
            }, status=status.HTTP_201_CREATED)
        
        # Otherwise, create a LoanApplicationDocument entry
        print(f"[UPLOAD] Creating LoanApplicationDocument for field: {field_name} -> document_type: {document_type}")
        serializer = LoanApplicationDocumentSerializer(data={
            'application': application.id,
            'document_type': document_type,
            'title': uploaded_file.name,
            'file': uploaded_file,
            'description': f'Uploaded from {field_name}'
        })
        
        if serializer.is_valid():
            document = serializer.save()
            print(f"[UPLOAD] ✅ Created LoanApplicationDocument ID: {document.id}")
            print(f"[UPLOAD] ✅ File saved to: {document.file.name}")
            print(f"[UPLOAD] ✅ Document linked to application: {application.id}")
            
            # Verify it was saved
            doc_count = application.documents.count()
            print(f"[UPLOAD] ✅ Application now has {doc_count} document(s)")
            
            return Response(
                LoanApplicationDocumentSerializer(document).data,
                status=status.HTTP_201_CREATED
            )
        
        print(f"[UPLOAD] ❌ Serializer validation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_note(self, request, pk=None):
        """Add a note to an application (admin only)"""
        if not hasattr(request.user, 'user_type') or request.user.user_type != 'admin':
            return Response(
                {'error': 'Only admins can add notes.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        application = self.get_object()
        serializer = LoanApplicationNoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(application=application, author=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard_statistics(self, request):
        """Get user dashboard statistics with loan data and charts"""
        user = request.user
        
        # First, associate any unassociated applications with this user based on email
        if user.email:
            user_email = user.email.lower()
            unassociated_apps = LoanApplication.objects.filter(
                user=None,
                personal_info__email__iexact=user_email
            )
            
            if unassociated_apps.exists():
                print(f"[DASHBOARD] Associating {unassociated_apps.count()} applications with user {user}")
                unassociated_apps.update(user=user)
        
        # Get user's applications (exclude drafts)
        applications = LoanApplication.objects.filter(
            user=user,
            is_draft=False
        ).order_by('-created_at')
        
        # Debug logging
        print(f"[DASHBOARD] User: {user.email}")
        print(f"[DASHBOARD] Total applications found: {applications.count()}")
        
        # Calculate statistics
        total_applications = applications.count()
        pending_count = applications.filter(status='pending').count()
        approved_count = applications.filter(status='approved').count()
        rejected_count = applications.filter(status='rejected').count()
        query_count = applications.filter(status='query').count()
        draft_count = LoanApplication.objects.filter(user=user, is_draft=True).count()
        active_loans = approved_count
        
        print(f"[DASHBOARD] Pending: {pending_count}, Approved: {approved_count}, Rejected: {rejected_count}, Query: {query_count}, Drafts: {draft_count}")
        
        # Calculate financial metrics
        total_borrowed = sum(app.approved_amount or 0 for app in applications.filter(status='approved'))
        total_requested = sum(app.amount or 0 for app in applications)
        current_balance = total_borrowed  # Simplified - would calculate based on payments
        
        # Get latest approved loan for monthly payment calculation
        latest_approved = applications.filter(status='approved').first()
        monthly_payment = 0
        next_due_date = None
        if latest_approved and latest_approved.approved_amount and latest_approved.term:
            # Simple calculation: loan amount / term in months
            monthly_payment = float(latest_approved.approved_amount) / latest_approved.term
            # Calculate next due date (assuming monthly payments)
            if latest_approved.approved_at:
                from dateutil.relativedelta import relativedelta
                next_due_date = latest_approved.approved_at + relativedelta(months=1)
        
        # Get recent applications for chart data (last 6 months)
        from datetime import datetime, timedelta
        from django.db.models import Count
        from django.db.models.functions import TruncMonth
        
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_apps = applications.filter(
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Format chart data
        chart_labels = []
        chart_data = []
        for entry in monthly_apps:
            month_name = entry['month'].strftime('%b %Y')
            chart_labels.append(month_name)
            chart_data.append(entry['count'])
        
        # Get status distribution for pie chart
        status_distribution = {
            'pending': pending_count,
            'approved': approved_count,
            'rejected': rejected_count,
            'query': query_count,
        }
        
        # Get recent activity (last 5 applications)
        recent_activity = []
        for app in applications[:5]:
            recent_activity.append({
                'id': app.id,
                'application_id': str(app.application_id),
                'amount': float(app.amount or 0),
                'status': app.status,
                'created_at': app.created_at,
                'updated_at': app.updated_at,
            })
        
        # Account health score (simplified)
        if total_applications > 0:
            approval_rate = (approved_count / total_applications) * 100
            if approval_rate >= 75:
                account_health = 'Excellent'
            elif approval_rate >= 50:
                account_health = 'Good'
            elif approval_rate >= 25:
                account_health = 'Fair'
            else:
                account_health = ''
        else:
            account_health = ''
        
        response_data = {
            'metrics': {
                'total_applications': total_applications,
                'draft_count': draft_count,
                'pending_count': pending_count,
                'approved_count': approved_count,
                'rejected_count': rejected_count,
                'query_count': query_count,
                'active_loans': active_loans,
                'total_borrowed': float(total_borrowed),
                'total_requested': float(total_requested),
                'current_balance': float(current_balance),
                'monthly_payment': float(monthly_payment),
                'next_due_date': next_due_date,
                'account_health': account_health,
            },
            'charts': {
                'applications_over_time': {
                    'labels': chart_labels,
                    'data': chart_data,
                },
                'status_distribution': status_distribution,
            },
            'recent_activity': recent_activity,
        }
        
        print(f"[DASHBOARD] Response data: {response_data['metrics']}")
        
        return Response(response_data, status=status.HTTP_200_OK)


class LoanApplicationDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for loan application documents.
    """
    queryset = LoanApplicationDocument.objects.all()
    serializer_class = LoanApplicationDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter documents based on user's applications"""
        user = self.request.user
        
        # Admin users can see all documents
        if hasattr(user, 'user_type') and user.user_type == 'admin':
            return LoanApplicationDocument.objects.all()
        
        # Regular users see documents for their applications
        return LoanApplicationDocument.objects.filter(application__user=user)
    
    def create(self, request, *args, **kwargs):
        """Upload a document for an application"""
        application_id = request.data.get('application_id')
        
        try:
            application = LoanApplication.objects.get(id=application_id)
        except LoanApplication.DoesNotExist:
            return Response(
                {'error': 'Application not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user owns the application
        if application.user != request.user:
            if not (hasattr(request.user, 'user_type') and request.user.user_type == 'admin'):
                return Response(
                    {'error': 'You do not have permission to upload documents to this application.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(application=application)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
