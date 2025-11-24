#!/usr/bin/env python
"""
Check admin user details
"""

import os
import sys
import django

sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

# Check admin users
admin_users = User.objects.filter(username='9999999999')
print("Admin users found:")
for user in admin_users:
    print(f"  ID: {user.id}, Username: {user.username}, Email: {user.email}")

# Check email conflicts
email_users = User.objects.filter(email='murambaprogress@gmail.com')
print("\nUsers with murambaprogress@gmail.com:")
for user in email_users:
    print(f"  ID: {user.id}, Username: {user.username}, Email: {user.email}")