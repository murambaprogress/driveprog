"""
Decode and validate the JWT token
"""
import os
import django
import jwt
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from django.conf import settings
from accounts.models import User

# The token from the browser
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYxNDQ4NDM1LCJpYXQiOjE3NjE0MDUyMzUsImp0aSI6IjMxMTVkMWQyZjczNzQ3NjE4NDFmZWVhMGQ0YjUwMzE2IiwidXNlcl9pZCI6IjE3In0.8Aru9-c3tflZDyTWt_xKJiszbNMqeA21hNAuGXsxKMA"

print("Decoding JWT token...")
print("=" * 80)

try:
    # Decode without verification first to see payload
    decoded_unverified = jwt.decode(token, options={"verify_signature": False})
    print("Token payload (unverified):")
    for key, value in decoded_unverified.items():
        if key in ['exp', 'iat']:
            dt = datetime.fromtimestamp(value)
            print(f"  {key}: {value} ({dt})")
        else:
            print(f"  {key}: {value}")
    
    print("\n" + "=" * 80)
    
    # Now try to verify with the Django secret key
    try:
        decoded_verified = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )
        print("✓ Token signature is VALID")
        print(f"✓ Token is for user_id: {decoded_verified['user_id']}")
        
        # Check if user exists
        try:
            user = User.objects.get(id=decoded_verified['user_id'])
            print(f"✓ User exists: {user.email}")
            print(f"✓ User is active: {user.is_active}")
        except User.DoesNotExist:
            print(f"✗ User with ID {decoded_verified['user_id']} does NOT exist!")
            
    except jwt.ExpiredSignatureError:
        print("✗ Token has EXPIRED")
    except jwt.InvalidSignatureError:
        print("✗ Token signature is INVALID (wrong SECRET_KEY)")
    except Exception as e:
        print(f"✗ Token validation failed: {e}")
        
except Exception as e:
    print(f"Error decoding token: {e}")
