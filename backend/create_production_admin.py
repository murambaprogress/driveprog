#!/usr/bin/env python
"""
Create admin user for production on PythonAnywhere.
Run this on PythonAnywhere console: python create_production_admin.py
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

def create_admin():
    """Create the admin user"""
    
    admin_username = '9999999999'
    admin_email = 'admin@drivecash.com'  # Changed to unique admin email
    admin_password = 'drivecash'
    
    print("\n" + "=" * 60)
    print("CREATING ADMIN USER FOR PRODUCTION")
    print("=" * 60)
    
    try:
        # First, check if email is already used by another user
        email_conflict = User.objects.filter(email=admin_email).exclude(username=admin_username).first()
        if email_conflict:
            print(f"\n⚠ Warning: Email {admin_email} is used by user: {email_conflict.username}")
            print(f"  Changing admin email to avoid conflict...")
            admin_email = f'admin_{admin_username}@drivecash.com'
        
        # Check if admin already exists
        existing_admin = User.objects.filter(username=admin_username).first()
        
        if existing_admin:
            print(f"\n✓ Admin user already exists!")
            print(f"  Username: {existing_admin.username}")
            print(f"  Email: {existing_admin.email}")
            print(f"  User Type: {existing_admin.user_type}")
            print(f"  Is Staff: {existing_admin.is_staff}")
            print(f"  Is Superuser: {existing_admin.is_superuser}")
            print(f"  Is Verified: {existing_admin.is_verified}")
            
            # Update admin settings if needed
            updated = False
            if existing_admin.user_type != 'admin':
                existing_admin.user_type = 'admin'
                updated = True
            if not existing_admin.is_staff:
                existing_admin.is_staff = True
                updated = True
            if not existing_admin.is_superuser:
                existing_admin.is_superuser = True
                updated = True
            if not existing_admin.is_verified:
                existing_admin.is_verified = True
                updated = True
            if existing_admin.email != admin_email:
                existing_admin.email = admin_email
                updated = True
                
            if updated:
                existing_admin.save()
                print("\n  ✓ Admin settings updated!")
            
            print("\n✓ Admin user is ready!")
            
        else:
            # Create new admin user
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
            
            print(f"\n✓ Admin user created successfully!")
            print(f"  Username: {admin_user.username}")
            print(f"  Email: {admin_user.email}")
            print(f"  Password: {admin_password}")
        
        print("\n" + "=" * 60)
        print("ADMIN LOGIN CREDENTIALS:")
        print("=" * 60)
        print(f"  Username: {admin_username}")
        print(f"  Password: {admin_password}")
        print("=" * 60)
        print("\n✓ You can now login as admin!")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error creating admin user: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_admin()
    sys.exit(0 if success else 1)
