"""
Test age validation for user registration
Tests both valid and invalid dates of birth
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from accounts.serializers import RegisterSerializer

def test_age_validation():
    """Test age validation with various dates of birth"""
    
    print("=" * 60)
    print("Testing Age Validation for User Registration")
    print("=" * 60)
    
    # Test 1: User who is 17 years old (should fail)
    print("\n1. Testing with 17-year-old user (should fail):")
    dob_17 = date.today() - relativedelta(years=17)
    data_17 = {
        'first_name': 'John',
        'last_name': 'Doe',
        'email': 'john17@example.com',
        'date_of_birth': dob_17.strftime('%Y-%m-%d'),
        'password': 'SecurePass123!',
        'password2': 'SecurePass123!'
    }
    serializer_17 = RegisterSerializer(data=data_17)
    if serializer_17.is_valid():
        print("   ❌ FAILED: 17-year-old should NOT be allowed to register")
    else:
        print("   ✅ PASSED: 17-year-old rejected")
        print(f"   Error: {serializer_17.errors.get('date_of_birth', ['No error message'])[0]}")
    
    # Test 2: User who is exactly 18 years old (should pass)
    print("\n2. Testing with exactly 18-year-old user (should pass):")
    dob_18 = date.today() - relativedelta(years=18)
    data_18 = {
        'first_name': 'Jane',
        'last_name': 'Smith',
        'email': 'jane18@example.com',
        'date_of_birth': dob_18.strftime('%Y-%m-%d'),
        'password': 'SecurePass123!',
        'password2': 'SecurePass123!'
    }
    serializer_18 = RegisterSerializer(data=data_18)
    if serializer_18.is_valid():
        print("   ✅ PASSED: 18-year-old accepted")
    else:
        print("   ❌ FAILED: 18-year-old should be allowed to register")
        print(f"   Error: {serializer_18.errors}")
    
    # Test 3: User who is 25 years old (should pass)
    print("\n3. Testing with 25-year-old user (should pass):")
    dob_25 = date.today() - relativedelta(years=25)
    data_25 = {
        'first_name': 'Bob',
        'last_name': 'Johnson',
        'email': 'bob25@example.com',
        'date_of_birth': dob_25.strftime('%Y-%m-%d'),
        'password': 'SecurePass123!',
        'password2': 'SecurePass123!'
    }
    serializer_25 = RegisterSerializer(data=data_25)
    if serializer_25.is_valid():
        print("   ✅ PASSED: 25-year-old accepted")
    else:
        print("   ❌ FAILED: 25-year-old should be allowed to register")
        print(f"   Error: {serializer_25.errors}")
    
    # Test 4: User who is 10 years old (should fail)
    print("\n4. Testing with 10-year-old user (should fail):")
    dob_10 = date.today() - relativedelta(years=10)
    data_10 = {
        'first_name': 'Kid',
        'last_name': 'Young',
        'email': 'kid10@example.com',
        'date_of_birth': dob_10.strftime('%Y-%m-%d'),
        'password': 'SecurePass123!',
        'password2': 'SecurePass123!'
    }
    serializer_10 = RegisterSerializer(data=data_10)
    if serializer_10.is_valid():
        print("   ❌ FAILED: 10-year-old should NOT be allowed to register")
    else:
        print("   ✅ PASSED: 10-year-old rejected")
        print(f"   Error: {serializer_10.errors.get('date_of_birth', ['No error message'])[0]}")
    
    # Test 5: User with no date of birth (should pass - optional field)
    print("\n5. Testing with no date of birth (should pass - optional field):")
    data_no_dob = {
        'first_name': 'No',
        'last_name': 'DOB',
        'email': 'nodob@example.com',
        'password': 'SecurePass123!',
        'password2': 'SecurePass123!'
    }
    serializer_no_dob = RegisterSerializer(data=data_no_dob)
    if serializer_no_dob.is_valid():
        print("   ✅ PASSED: User without DOB accepted (optional field)")
    else:
        print("   ❌ FAILED: User without DOB should be allowed")
        print(f"   Error: {serializer_no_dob.errors}")
    
    print("\n" + "=" * 60)
    print("Age Validation Testing Complete")
    print("=" * 60)

if __name__ == '__main__':
    test_age_validation()
