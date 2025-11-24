"""
Debug Authentication Issues
Run this to check if authentication is working
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User
from rest_framework_simplejwt.tokens import RefreshToken

print("=" * 60)
print("Authentication Debug Tool")
print("=" * 60)

# List all users
print("\n1. Available Users:")
users = User.objects.all()
for user in users:
    print(f"   - ID: {user.id}, Email: {user.email}, Phone: {user.phone_number}, Type: {getattr(user, 'user_type', 'N/A')}")

# Check admin user
print("\n2. Admin User Check:")
try:
    admin = User.objects.get(phone_number='9999999999')
    print(f"   ✅ Admin found: {admin.email}")
    print(f"   User Type: {admin.user_type}")
    print(f"   Is Active: {admin.is_active}")
except User.DoesNotExist:
    print("   ❌ Admin user (9999999999) not found")

# Generate fresh tokens for testing
print("\n3. Generate Fresh Tokens:")
print("\nFor Admin (9999999999):")
try:
    admin = User.objects.get(phone_number='9999999999')
    refresh = RefreshToken.for_user(admin)
    print(f"   Access Token: {refresh.access_token}")
    print(f"   Refresh Token: {refresh}")
    print("\n   To use in frontend, run in browser console:")
    print(f"   localStorage.setItem('authToken', '{refresh.access_token}');")
except User.DoesNotExist:
    print("   Admin user not found")

print("\nFor Test User (test@example.com):")
try:
    test_user = User.objects.get(email='test@example.com')
    refresh = RefreshToken.for_user(test_user)
    print(f"   Access Token: {refresh.access_token}")
    print(f"   Refresh Token: {refresh}")
    print("\n   To use in frontend, run in browser console:")
    print(f"   localStorage.setItem('authToken', '{refresh.access_token}');")
except User.DoesNotExist:
    print("   Test user not found")

print("\n" + "=" * 60)
print("Next Steps:")
print("=" * 60)
print("1. Copy one of the tokens above")
print("2. Open browser console (F12)")
print("3. Run: localStorage.setItem('authToken', 'YOUR_TOKEN_HERE');")
print("4. Refresh the page")
print("5. Try accessing chat again")
print("=" * 60)
