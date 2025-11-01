"""
Check what users exist in the database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

print("All users in database:")
print("-" * 80)
for user in User.objects.all().order_by('id'):
    print(f"ID: {user.id:3d} | Email: {user.email:30s} | Type: {user.user_type:10s} | Active: {user.is_active}")
print("-" * 80)
print(f"Total users: {User.objects.count()}")
