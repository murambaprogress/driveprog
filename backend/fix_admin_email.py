#!/usr/bin/env python
"""
Fix admin user email configuration
"""

import os
import sys
import django

sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

try:
    # Get the admin user
    admin_user = User.objects.get(username='9999999999')
    print(f"Found admin user: {admin_user.email}")
    
    # Check if there's a conflict with the target email
    conflict_user = User.objects.filter(email='murambaprogress@gmail.com').first()
    if conflict_user and conflict_user.id != admin_user.id:
        print(f"Found conflicting user: {conflict_user.username} with same email")
        # Change the conflicting user's email
        conflict_user.email = f"backup_{conflict_user.email}"
        conflict_user.save()
        print(f"Changed conflicting user email to: {conflict_user.email}")
    
    # Update admin user email
    admin_user.email = 'murambaprogress@gmail.com'
    admin_user.save()
    print(f"✅ Updated admin user email to: {admin_user.email}")
    
except Exception as e:
    print(f"❌ Error: {e}")