#!/usr/bin/env python
"""
Fix admin user on PythonAnywhere - handles email conflicts.
Run: python fix_admin.py
"""

import os
import sys
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

print("\n" + "=" * 60)
print("FIXING ADMIN USER")
print("=" * 60)

admin_username = '9999999999'
admin_password = 'drivecash'

# Check if admin user exists
try:
    admin = User.objects.get(username=admin_username)
    print(f"\n✓ Found admin user: {admin.username}")
    print(f"  Current email: {admin.email}")
    print(f"  User type: {admin.user_type}")
    print(f"  Is staff: {admin.is_staff}")
    print(f"  Is verified: {admin.is_verified}")
    
    # Update admin privileges
    updated = False
    if admin.user_type != 'admin':
        admin.user_type = 'admin'
        updated = True
    if not admin.is_staff:
        admin.is_staff = True
        updated = True
    if not admin.is_superuser:
        admin.is_superuser = True
        updated = True
    if not admin.is_verified:
        admin.is_verified = True
        updated = True
    
    if updated:
        admin.save()
        print("\n✓ Admin privileges updated!")
    else:
        print("\n✓ Admin already has correct privileges!")
        
    print("\n" + "=" * 60)
    print("ADMIN READY TO USE:")
    print("=" * 60)
    print(f"  Username: {admin_username}")
    print(f"  Password: {admin_password}")
    print("=" * 60)
    
except User.DoesNotExist:
    print(f"\n✗ Admin user '{admin_username}' does not exist!")
    print("\nCreating admin user...")
    
    # Find a unique email
    base_email = 'admin@drivecash.com'
    email_to_use = base_email
    counter = 1
    
    while User.objects.filter(email=email_to_use).exists():
        email_to_use = f'admin{counter}@drivecash.com'
        counter += 1
        print(f"  Trying email: {email_to_use}")
    
    print(f"  Using email: {email_to_use}")
    
    try:
        admin = User.objects.create_user(
            username=admin_username,
            email=email_to_use,
            password=admin_password,
            user_type='admin',
            is_staff=True,
            is_superuser=True,
            is_verified=True
        )
        
        print(f"\n✓ Admin user created successfully!")
        print(f"  Username: {admin.username}")
        print(f"  Email: {admin.email}")
        
        print("\n" + "=" * 60)
        print("ADMIN LOGIN CREDENTIALS:")
        print("=" * 60)
        print(f"  Username: {admin_username}")
        print(f"  Password: {admin_password}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error creating admin: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

print("\n✓ Done! You can now login as admin.\n")
