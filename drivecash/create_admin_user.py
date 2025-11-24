"""
Create or update the admin user directly.
"""
import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

admin_email = 'r2210294w@students.msu.ac.zw'
admin_username = '9999999999'
admin_password = 'drivecash'

print("\n" + "=" * 60)
print("Creating/Updating Admin User")
print("=" * 60)

try:
    # Try to get existing admin
    admin_user = User.objects.get(username=admin_username)
    print(f"\n✓ Admin user already exists!")
    print(f"  Current email: {admin_user.email}")
    
    # Update email if different
    if admin_user.email != admin_email:
        admin_user.email = admin_email
        admin_user.save()
        print(f"  ✓ Email updated to: {admin_email}")
    else:
        print(f"  Email already set to: {admin_email}")
        
except User.DoesNotExist:
    # Create new admin
    print(f"\nCreating new admin user...")
    admin_user = User.objects.create_user(
        username=admin_username,
        email=admin_email,
        password=admin_password,
        user_type='admin',
        is_staff=True,
        is_superuser=True,
        is_verified=True
    )
    print(f"✓ Admin user created successfully!")

print("\n" + "-" * 60)
print("Admin User Details:")
print("-" * 60)
print(f"Username:     {admin_user.username}")
print(f"Email:        {admin_user.email}")
print(f"User Type:    {admin_user.user_type}")
print(f"Is Staff:     {admin_user.is_staff}")
print(f"Is Superuser: {admin_user.is_superuser}")
print(f"Is Verified:  {admin_user.is_verified}")
print("=" * 60)
print("\n✓ Admin OTP emails will be sent to:", admin_user.email)
print()
