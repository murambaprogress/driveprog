#!/usr/bin/env python
"""
Test script to check the admin login step1 endpoint
"""

import requests
import json

def test_admin_login_step1():
    """Test the admin login step1 endpoint"""
    
    url = "http://127.0.0.1:8000/api/accounts/admin/login/step1/"
    
    # Test data
    data = {
        "username": "9999999999",
        "password": "drivecash"
    }
    
    try:
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"Response JSON: {json.dumps(response_json, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            
        return response.status_code == 200
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Django server. Make sure it's running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Admin Login Step1 Endpoint...")
    print("=" * 50)
    
    success = test_admin_login_step1()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Admin login endpoint is working!")
    else:
        print("❌ Admin login endpoint has issues.")