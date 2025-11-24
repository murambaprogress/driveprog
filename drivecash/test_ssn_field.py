#!/usr/bin/env python
"""
Simple test to verify social security field fix
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

from loans.models import ApplicantPersonalInfo

def test_social_security_field():
    """Test that we can save longer social security data"""
    
    try:
        # Test creating a record with long social security data
        test_ssn = "123-45-6789-EXTRA-LONG-DATA-TEST"
        
        from datetime import date
        
        personal_info = ApplicantPersonalInfo.objects.create(
            first_name="Test",
            last_name="User", 
            email="test@example.com",
            phone="1234567890",
            dob=date(1990, 1, 1),
            social_security=test_ssn,
            banks_name="Test Bank"
        )
        
        print(f"✅ Successfully created personal info with ID: {personal_info.id}")
        print(f"✅ Social Security Number stored: '{personal_info.social_security}'")
        print(f"✅ Length of stored SSN: {len(personal_info.social_security)} characters")
        
        # Clean up
        personal_info.delete()
        print("✅ Test record cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create personal info: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Social Security Field Fix...")
    print("=" * 50)
    
    success = test_social_security_field()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Social Security field fix is working correctly!")
    else:
        print("❌ Social Security field still has issues.")