from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import random
import string
from .models import User, OTP
from .serializers import RegisterSerializer, LoginSerializer, OTPSerializer, UserSerializer, PasswordResetRequestSerializer, PasswordResetSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user with email verification
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save(user_type='user')
        user.is_active = False  # Deactivate account until email verification
        user.save()

        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)  # OTP expires in 10 minutes
        
        otp = OTP.objects.create(
            user=user,
            otp_code=otp_code,
            expires_at=expires_at
        )
        
        # Send OTP via email
        try:
            send_mail(
                subject='Welcome to DriveCash - Verify Your Account',
                message=f'Your OTP for account verification is: {otp_code}. This code will expire in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # If email fails, delete the user and OTP
            user.delete()
            return Response(
                {"error": f"Failed to send verification email: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {
                "message": "User registered successfully. Please check your email for OTP verification.",
                "user_id": user.id
            }, 
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify user OTP for account activation
    """
    user_id = request.data.get('user_id')
    otp_code = request.data.get('otp_code')
    
    if not user_id or not otp_code:
        return Response(
            {"error": "User ID and OTP code are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id)
        otp = OTP.objects.get(user=user, otp_code=otp_code, is_used=False)
        
        if timezone.now() > otp.expires_at:
            return Response(
                {"error": "OTP has expired"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        otp.is_used = True
        otp.save()
        
        user.is_active = True
        user.is_verified = True
        user.save()
        
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        user_serializer = UserSerializer(user)
        response_data = {
            'message': 'User verified successfully',
            'user': user_serializer.data,
            'tokens': tokens
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except OTP.DoesNotExist:
        return Response(
            {"error": "Invalid OTP code"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def register_admin(request):
    """
    Register a new admin user with email verification
    """
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        # Check if user_type is admin
        if serializer.validated_data['user_type'] != 'admin':
            return Response(
                {"error": "This endpoint is only for admin registration"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user but don't save yet
        user_data = serializer.validated_data.copy()
        user_data.pop('password2')
        user = User(**user_data)
        user.set_password(user_data['password'])
        user.is_active = False  # Admin needs to be verified
        user.save()
        
        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)  # OTP expires in 10 minutes
        
        otp = OTP.objects.create(
            user=user,
            otp_code=otp_code,
            expires_at=expires_at
        )
        
        # Send OTP via email
        try:
            send_mail(
                subject='DriveCash Admin Registration - OTP Verification',
                message=f'Your OTP for admin registration is: {otp_code}. This code will expire in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            # If email fails, delete the user and OTP
            user.delete()
            otp.delete()
            return Response(
                {"error": "Failed to send verification email. Please try again."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {
                "message": "Admin registered successfully. Please check your email for OTP verification.",
                "user_id": user.id
            }, 
            status=status.HTTP_201_CREATED
        )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_admin_otp(request):
    """
    Verify admin OTP
    """
    user_id = request.data.get('user_id')
    otp_code = request.data.get('otp_code')
    
    if not user_id or not otp_code:
        return Response(
            {"error": "User ID and OTP code are required"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(id=user_id, user_type='admin')
        otp = OTP.objects.get(user=user, otp_code=otp_code, is_used=False)
        
        # Check if OTP is expired
        if timezone.now() > otp.expires_at:
            return Response(
                {"error": "OTP has expired"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # Activate user
        user.is_active = True
        user.is_verified = True
        user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        # Prepare response data
        user_serializer = RegisterSerializer(user)
        response_data = {
            'message': 'Admin verified successfully',
            'user': user_serializer.data,
            'tokens': tokens
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(
            {"error": "Admin user not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except OTP.DoesNotExist:
        return Response(
            {"error": "Invalid OTP code"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": "Verification failed"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """
    Login user
    """
    serializer = LoginSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # If the user is an admin, redirect to the admin login flow
        if user.user_type == 'admin':
            # This endpoint is not for admin login.
            # Admins should use the two-step OTP login.
            return Response(
                {"error": "Admin login requires a different process. Please use the admin login page."},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.check_password(password):
            if user.user_type == 'admin' and not user.is_verified:
                return Response(
                    {"error": "Admin account not verified. Please check your email for OTP verification."}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            
            # Associate any unassociated loan applications with this user based on email
            try:
                from loans.models import LoanApplication
                # Find applications with the same email but no user
                user_email = user.email.lower()
                unassociated_apps = LoanApplication.objects.filter(
                    user=None,
                    personal_info__email__iexact=user_email
                )
                
                # Associate these applications with the current user
                if unassociated_apps.exists():
                    print(f"Login: Associating {unassociated_apps.count()} applications with user {user}")
                    unassociated_apps.update(user=user)
            except Exception as e:
                print(f"Error associating applications: {str(e)}")
            
            # Prepare response data
            user_serializer = RegisterSerializer(user)
            response_data = {
                'user': user_serializer.data,
                'tokens': tokens
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Invalid credentials"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    Get comprehensive user profile with loan application data
    """
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = request.user
    
    # Get user's latest approved or most recent loan application
    from loans.models import LoanApplication
    from django.db.models import Q
    
    latest_app = LoanApplication.objects.filter(
        user=user
    ).order_by('-created_at').first()
    
    # Build comprehensive profile
    profile_data = {
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}".strip() or user.email,
            'phone_number': user.phone_number,
            'date_of_birth': user.date_of_birth,
            'is_verified': user.is_verified,
            'user_type': user.user_type,
            'created_at': user.created_at,
        },
        'personal_info': {},
        'contact': {},
        'employment': {},
        'address': {},
        'banking': {},
        'vehicle': {},
        'loan_summary': {
            'total_applications': 0,
            'approved_count': 0,
            'pending_count': 0,
            'total_approved_amount': 0,
            'active_loans': 0,
        }
    }
    
    # Get loan statistics
    applications = LoanApplication.objects.filter(user=user)
    profile_data['loan_summary']['total_applications'] = applications.count()
    profile_data['loan_summary']['approved_count'] = applications.filter(status='approved').count()
    profile_data['loan_summary']['pending_count'] = applications.filter(status='pending').count()
    
    # Calculate total approved amount
    approved_apps = applications.filter(status='approved')
    total_approved = sum(app.approved_amount or 0 for app in approved_apps)
    profile_data['loan_summary']['total_approved_amount'] = float(total_approved)
    profile_data['loan_summary']['active_loans'] = approved_apps.count()
    
    # If user has a loan application, extract detailed info
    if latest_app:
        # Personal info
        if latest_app.personal_info:
            profile_data['personal_info'] = {
                'first_name': latest_app.personal_info.first_name,
                'last_name': latest_app.personal_info.last_name,
                'email': latest_app.personal_info.email,
                'phone': latest_app.personal_info.phone,
                'dob': latest_app.personal_info.dob,
                'social_security': latest_app.personal_info.social_security,
                'banks_name': latest_app.personal_info.banks_name,
            }
        
        # Contact/Address info
        if latest_app.address:
            profile_data['contact'] = {
                'phone': latest_app.personal_info.phone if latest_app.personal_info else '',
                'email': latest_app.personal_info.email if latest_app.personal_info else '',
            }
            profile_data['address'] = {
                'street': latest_app.address.street,
                'city': latest_app.address.city,
                'state': latest_app.address.state,
                'zip_code': latest_app.address.zip_code,
            }
        
        # Employment info
        if latest_app.financial_profile:
            profile_data['employment'] = {
                'income': float(latest_app.financial_profile.income or 0),
                'employment_status': latest_app.financial_profile.employment_status,
                'employment_length': latest_app.financial_profile.employment_length,
                'income_source': latest_app.financial_profile.income_source,
                'gross_monthly_income': float(latest_app.financial_profile.gross_monthly_income or 0),
                'pay_frequency': latest_app.financial_profile.pay_frequency,
                'next_pay_date': latest_app.financial_profile.next_pay_date,
                'last_pay_date': latest_app.financial_profile.last_pay_date,
                'active_bankruptcy': latest_app.financial_profile.active_bankruptcy,
                'direct_deposit': latest_app.financial_profile.direct_deposit,
                'military_status': latest_app.financial_profile.military_status,
            }
        
        # Banking info
        profile_data['banking'] = {
            'bank_name': latest_app.personal_info.banks_name if latest_app.personal_info else '',
            'direct_deposit': latest_app.financial_profile.direct_deposit if latest_app.financial_profile else False,
        }
        
        # Vehicle info
        if latest_app.vehicle_info:
            profile_data['vehicle'] = {
                'make': latest_app.vehicle_info.make,
                'model': latest_app.vehicle_info.model,
                'year': latest_app.vehicle_info.year,
                'vin': latest_app.vehicle_info.vin,
                'mileage': latest_app.vehicle_info.mileage,
                'color': latest_app.vehicle_info.color,
                'license_plate': latest_app.vehicle_info.license_plate,
                'registration_state': latest_app.vehicle_info.registration_state,
            }
        
        # Latest application info
        profile_data['latest_application'] = {
            'id': latest_app.id,
            'application_id': str(latest_app.application_id),
            'status': latest_app.status,
            'amount': float(latest_app.amount or 0),
            'term': latest_app.term,
            'interest_rate': float(latest_app.interest_rate or 0),
            'approved_amount': float(latest_app.approved_amount or 0) if latest_app.approved_amount else None,
            'approved_at': latest_app.approved_at,
            'created_at': latest_app.created_at,
            'updated_at': latest_app.updated_at,
        }
    
    return Response(profile_data, status=status.HTTP_200_OK)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """
    Update user profile information
    """
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = request.user
    data = request.data
    
    # Update User model fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'phone_number' in data:
        user.phone_number = data['phone_number']
    if 'date_of_birth' in data:
        user.date_of_birth = data['date_of_birth']
    
    user.save()
    
    return Response({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone_number': user.phone_number,
            'date_of_birth': user.date_of_birth,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Request a password reset OTP
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Still return a success message to prevent user enumeration
            return Response({"message": "If an account with this email exists, an OTP has been sent."}, status=status.HTTP_200_OK)

        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=10)

        OTP.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)

        # Send OTP via email
        try:
            send_mail(
                subject='DriveCash Password Reset',
                message=f'Your OTP for password reset is: {otp_code}. This code will expire in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Failed to send OTP email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "If an account with this email exists, an OTP has been sent."}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset(request):
    """
    Reset password with OTP
    """
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(user=user, otp_code=otp_code, is_used=False)

            if timezone.now() > otp.expires_at:
                return Response({"error": "OTP has expired"}, status=status.HTTP_400_BAD_REQUEST)

            otp.is_used = True
            otp.save()

            user.set_password(password)
            user.save()

            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except OTP.DoesNotExist:
            return Response({"error": "Invalid email or OTP."}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_hardcoded_admin(request):
    """
    Creates the hardcoded admin user. This should only be run once.
    """
    admin_email = 'r2210294w@students.msu.ac.zw'
    admin_username = '9999999999'
    admin_password = 'drivecash'

    if User.objects.filter(username=admin_username).exists():
        return Response({"message": "Admin user already exists."}, status=status.HTTP_400_BAD_REQUEST)

    admin_user = User.objects.create_user(
        username=admin_username,
        email=admin_email,
        password=admin_password,
        user_type='admin',
        is_staff=True,
        is_superuser=True,
        is_verified=True
    )
    return Response({"message": "Admin user created successfully."}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def update_admin_email(request):
    """
    Updates the admin user's email address.
    """
    new_email = request.data.get('new_email')
    admin_password = request.data.get('password')

    if not new_email or not admin_password:
        return Response({"error": "New email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Verify admin credentials
    if admin_password != 'drivecash':
        return Response({"error": "Invalid admin password."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        admin_user = User.objects.get(username='9999999999')
        admin_user.email = new_email
        admin_user.save()
        
        return Response({
            "message": "Admin email updated successfully.",
            "new_email": new_email
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({"error": "Admin user not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login_step1(request):
    """
    Admin login - Step 1: Verify credentials and send OTP.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if username != '9999999999' or password != 'drivecash':
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        admin_user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "Admin user not found. Please create it first."}, status=status.HTTP_404_NOT_FOUND)

    # Generate and send OTP
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires_at = timezone.now() + timedelta(minutes=5)
    OTP.objects.create(user=admin_user, otp_code=otp_code, expires_at=expires_at)

    try:
        send_mail(
            subject='DriveCash Admin Login Verification',
            message=f'Your one-time password is: {otp_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_user.email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({"error": f"Failed to send OTP: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "message": "OTP has been sent to the admin email address.",
        "user_id": admin_user.id
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login_step2(request):
    """
    Admin login - Step 2: Verify OTP and get tokens.
    """
    user_id = request.data.get('user_id')
    otp_code = request.data.get('otp_code')

    if not user_id or not otp_code:
        return Response({"error": "User ID and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id, username='9999999999')
        otp = OTP.objects.get(user=user, otp_code=otp_code, is_used=False)

        if timezone.now() > otp.expires_at:
            return Response({"error": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)

    except (User.DoesNotExist, OTP.DoesNotExist):
        return Response({"error": "Invalid User ID or OTP."}, status=status.HTTP_400_BAD_REQUEST)