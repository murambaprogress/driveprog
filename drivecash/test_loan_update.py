#!/usr/bin/env python
"""
Test script to verify the loan application update endpoint works
"""

import requests
import json

def test_loan_application_update():
    """Test the loan application update endpoint"""
    
    # First, let's create a loan application to update
    create_url = "http://127.0.0.1:8000/api/loans/applications/"
    
    create_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "phone": "1234567890",
        "dob": "1990-01-01",
        "social_security": "123-45-6789",
        "loan_amount": 10000,
        "loan_purpose": "vehicle",
        "employment_status": "employed",
        "annual_income": 50000,
        "street_address": "123 Test St",
        "city": "Test City",
        "state": "TX",
        "zip_code": "12345",
        "vehicle_make": "Toyota",
        "vehicle_model": "Camry",
        "vehicle_year": 2020,
        "vehicle_mileage": 30000,
        "monthly_income": 4000,
        "monthly_expenses": 2000,
        "existing_debt": 5000,
        "credit_score": 750
    }
    
    try:
        # Create application
        create_response = requests.post(create_url, json=create_data)
        
        if create_response.status_code != 201:
            print(f"❌ Failed to create application: {create_response.status_code}")
            print(create_response.text)
            return False
            
        app_data = create_response.json()
        app_id = app_data['id']
        print(f"✅ Created application with ID: {app_id}")
        
        # Now test updating it
        update_url = f"http://127.0.0.1:8000/api/loans/applications/{app_id}/"
        
        update_data = {
            "first_name": "Updated",
            "last_name": "Name", 
            "credit_score": 800,
            "status": "pending"
        }
        
        update_response = requests.patch(update_url, json=update_data)
        
        print(f"Update Status Code: {update_response.status_code}")
        
        if update_response.status_code == 200:
            print("✅ Loan application updated successfully!")
            updated_data = update_response.json()
            print(f"Updated first name: {updated_data.get('first_name', 'N/A')}")
            print(f"Updated credit score: {updated_data.get('credit_score', 'N/A')}")
            return True
        else:
            print("❌ Update failed:")
            print(update_response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server. Make sure it's running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Loan Application Update Endpoint...")
    print("=" * 60)
    
    success = test_loan_application_update()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ Loan application update endpoint is working!")
    else:
        print("❌ Loan application update endpoint has issues.")