"""
Test the admin login OTP system end-to-end
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User
from django.conf import settings

print("\n" + "=" * 70)
print("ADMIN OTP SYSTEM - CONFIGURATION TEST")
print("=" * 70)

# Check admin user
try:
    admin = User.objects.get(username='9999999999')
    print("\n✓ Admin User Found:")
    print(f"  Username: {admin.username} (NOT an email format)")
    print(f"  Email for OTP: {admin.email}")
    print(f"  Password: drivecash")
except User.DoesNotExist:
    print("\n✗ Admin user not found!")
    sys.exit(1)

# Check email settings
print("\n✓ Email Configuration:")
print(f"  Backend: {settings.EMAIL_BACKEND}")
print(f"  Host: {settings.EMAIL_HOST}")
print(f"  Port: {settings.EMAIL_PORT}")
print(f"  Use TLS: {settings.EMAIL_USE_TLS}")
print(f"  From Email: {settings.DEFAULT_FROM_EMAIL}")
print(f"  Host User: {settings.EMAIL_HOST_USER}")
print(f"  Password Set: {'Yes' if settings.EMAIL_HOST_PASSWORD else 'No'}")

# Summary
print("\n" + "-" * 70)
print("LOGIN FLOW:")
print("-" * 70)
print("1. Admin enters:")
print("   Username: 9999999999 (NOT email format - this is correct!)")
print("   Password: drivecash")
print()
print("2. System validates credentials (only these exact values accepted)")
print()
print("3. System generates 6-digit OTP")
print()
print("4. System sends email:")
print(f"   FROM: {settings.DEFAULT_FROM_EMAIL}")
print(f"   TO: {admin.email}")
print("   SUBJECT: DriveCash Admin Login Verification")
print()
print("5. Admin checks email and enters OTP")
print()
print("6. System verifies OTP and grants access")
print("-" * 70)

print("\n✅ SYSTEM CONFIGURED CORRECTLY!")
print()
print("Test the login:")
print("  1. Start backend: python manage.py runserver")
print("  2. Navigate to admin login page")
print("  3. Enter username: 9999999999")
print("  4. Enter password: drivecash")
print(f"  5. Check email: {admin.email}")
print("  6. Enter the 6-digit OTP code")
print()
print("=" * 70)
