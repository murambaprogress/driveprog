#!/usr/bin/env python
"""
Test script to verify the loan application endpoint with social security data
"""

import requests
import json
from datetime import date

def test_loan_application_endpoint():
    """Test the loan application creation with social security data"""
    
    url = "http://127.0.0.1:8000/api/loans/applications/"
    
    # Test data with a longer social security number to test the fix
    test_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "phone": "1234567890",
        "dob": "1990-01-01",
        "social_security": "123-45-6789-EXTRA-DATA",  # Longer than 11 characters
        "banks_name": "Test Bank",
        
        # Required loan fields
        "loan_amount": 10000,
        "loan_purpose": "vehicle",
        "employment_status": "employed",
        "annual_income": 50000,
        
        # Address information
        "street_address": "123 Test St",
        "city": "Test City",
        "state": "TX",
        "zip_code": "12345",
        
        # Vehicle information
        "vehicle_make": "Toyota",
        "vehicle_model": "Camry",
        "vehicle_year": 2020,
        "vehicle_mileage": 30000,
        
        # Financial information
        "monthly_income": 4000,
        "monthly_expenses": 2000,
        "existing_debt": 5000,
        "credit_score": 750
    }
    
    try:
        response = requests.post(url, json=test_data)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Loan application created successfully!")
            response_data = response.json()
            print(f"Application ID: {response_data.get('id', 'N/A')}")
            print(f"Social Security stored: {response_data.get('social_security', 'N/A')}")
        elif response.status_code == 400:
            print("❌ Bad Request - Validation Error:")
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2))
            except:
                print(response.text)
        elif response.status_code == 500:
            print("❌ Internal Server Error:")
            print(response.text)
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(response.text)
            
        return response.status_code == 201
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server. Make sure it's running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Loan Application Endpoint with Social Security Fix...")
    print("=" * 70)
    
    success = test_loan_application_endpoint()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ Loan application endpoint is working with extended social security field!")
    else:
        print("❌ Loan application endpoint still has issues.")