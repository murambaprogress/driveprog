"""
Quick script to check the current admin email configuration.
Run: python check_admin.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

try:
    admin = User.objects.get(username='9999999999')
    print("\n" + "=" * 60)
    print("ADMIN USER INFORMATION")
    print("=" * 60)
    print(f"Username:     {admin.username}")
    print(f"Email:        {admin.email}")
    print(f"User Type:    {admin.user_type}")
    print(f"Is Staff:     {admin.is_staff}")
    print(f"Is Superuser: {admin.is_superuser}")
    print(f"Is Verified:  {admin.is_verified}")
    print("=" * 60)
    print("\nOTP emails will be sent to:", admin.email)
    print()
except User.DoesNotExist:
    print("\n✗ Admin user (username: 9999999999) not found in database!")
    print("Run 'POST /api/accounts/create-admin/' to create the admin user.\n")
