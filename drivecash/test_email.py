#!/usr/bin/env python
"""
Test script to verify email sending functionality
"""

import os
import sys
import django
from django.conf import settings

# Add the project root to the Python path
sys.path.append(os.path.dirname(__file__))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings as django_settings

def test_email_sending():
    """Test if email sending is working"""
    
    try:
        print("📧 Testing email configuration...")
        print(f"Email Backend: {django_settings.EMAIL_BACKEND}")
        print(f"Email Host: {django_settings.EMAIL_HOST}")
        print(f"Email Port: {django_settings.EMAIL_PORT}")
        print(f"Email User: {django_settings.EMAIL_HOST_USER}")
        print(f"Email TLS: {django_settings.EMAIL_USE_TLS}")
        print(f"Default From: {django_settings.DEFAULT_FROM_EMAIL}")
        
        # Test sending an email
        recipient_email = django_settings.EMAIL_HOST_USER  # Send to self for testing
        
        result = send_mail(
            subject='DriveCash Email Test',
            message='This is a test email to verify that email sending is working correctly.',
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        
        if result == 1:
            print(f"✅ Email sent successfully to {recipient_email}")
            print("✅ Check the inbox to confirm email delivery")
            return True
        else:
            print("❌ Email sending failed - no emails were sent")
            return False
            
    except Exception as e:
        print(f"❌ Email sending failed with error: {e}")
        return False

def test_admin_login_email():
    """Test the admin login OTP email functionality"""
    
    try:
        print("\n📧 Testing admin login OTP email...")
        
        from accounts.models import User, OTP
        from django.utils import timezone
        from datetime import timedelta
        import random
        import string
        
        # Check if admin user exists
        try:
            admin_user = User.objects.get(username='9999999999')
            print(f"✅ Found admin user: {admin_user.email}")
        except User.DoesNotExist:
            print("❌ Admin user not found. Create admin user first.")
            return False
        
        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timedelta(minutes=5)
        
        # Create OTP record
        otp_obj = OTP.objects.create(
            user=admin_user, 
            otp_code=otp_code, 
            expires_at=expires_at
        )
        
        # Send OTP email
        result = send_mail(
            subject='DriveCash Admin Login Verification',
            message=f'Your one-time password is: {otp_code}',
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_user.email],
            fail_silently=False,
        )
        
        if result == 1:
            print(f"✅ Admin OTP email sent successfully to {admin_user.email}")
            print(f"✅ OTP Code: {otp_code} (for testing)")
            
            # Clean up test OTP
            otp_obj.delete()
            return True
        else:
            print("❌ Admin OTP email sending failed")
            otp_obj.delete()
            return False
            
    except Exception as e:
        print(f"❌ Admin OTP email failed with error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Email Functionality...")
    print("=" * 60)
    
    # Test basic email sending
    basic_success = test_email_sending()
    
    # Test admin login email
    admin_success = test_admin_login_email()
    
    print("\n" + "=" * 60)
    print("📧 Email Test Results:")
    print(f"   Basic Email: {'✅ PASS' if basic_success else '❌ FAIL'}")
    print(f"   Admin OTP Email: {'✅ PASS' if admin_success else '❌ FAIL'}")
    
    if basic_success and admin_success:
        print("\n🎉 All email tests passed! Email sending is working correctly.")
    else:
        print("\n❌ Some email tests failed. Check the configuration.")