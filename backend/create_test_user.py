"""
Quick script to create a test user for login testing
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

# Create test user
email = "test@example.com"
password = "test123"

# Delete if exists
User.objects.filter(email=email).delete()

# Create new user
user = User.objects.create_user(
    username=email,  # Required by AbstractUser
    email=email,
    password=password,
    phone_number="1234567890",
    user_type='user'
)

print(f"✓ Test user created successfully!")
print(f"  Email: {email}")
print(f"  Password: {password}")
print(f"  User ID: {user.id}")
print(f"\nYou can now use these credentials to login in test-auth.html")
