#!/usr/bin/env python
"""
Create or verify admin user for testing
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

from accounts.models import User

def create_or_update_admin_user():
    """Create or update the admin user with proper email"""
    
    try:
        # Try to get existing admin user
        try:
            admin_user = User.objects.get(username='9999999999')
            print(f"✅ Found existing admin user: {admin_user.username}")
            print(f"Current email: {admin_user.email}")
            
            # Update email if needed
            if admin_user.email != 'murambaprogress@gmail.com':
                admin_user.email = 'murambaprogress@gmail.com'
                admin_user.save()
                print("✅ Updated admin email address")
            
        except User.DoesNotExist:
            # Create new admin user
            admin_user = User.objects.create_user(
                username='9999999999',
                email='murambaprogress@gmail.com',
                password='drivecash',
                is_admin_user=True,
                is_staff=True
            )
            print("✅ Created new admin user")
        
        print(f"✅ Admin user ready:")
        print(f"   Username: {admin_user.username}")
        print(f"   Email: {admin_user.email}")
        print(f"   Is Admin: {admin_user.is_admin_user}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create/update admin user: {e}")
        return False

if __name__ == "__main__":
    print("👤 Setting up Admin User...")
    print("=" * 40)
    
    success = create_or_update_admin_user()
    
    print("\n" + "=" * 40)
    if success:
        print("✅ Admin user is ready for email testing!")
    else:
        print("❌ Admin user setup failed.")