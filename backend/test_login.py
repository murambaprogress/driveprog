#!/usr/bin/env python
"""
Test script for login API
"""
import requests
import json

API_BASE = "http://127.0.0.1:8000/api"

def test_login():
    """Test the login endpoint"""
    print("Testing Login API...")
    print("=" * 50)
    
    # Test data
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    print(f"Request URL: {API_BASE}/accounts/login/")
    print(f"Request Data: {json.dumps(login_data, indent=2)}")
    print("-" * 30)
    
    try:
        response = requests.post(
            f"{API_BASE}/accounts/login/",
            json=login_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"Response JSON: {json.dumps(response_json, indent=2)}")
        except json.JSONDecodeError:
            print(f"Response Text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_register():
    """Test the register endpoint to create a user"""
    print("\nTesting Register API...")
    print("=" * 50)
    
    register_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "password2": "testpassword123",
        "user_type": "user"
    }
    
    print(f"Request URL: {API_BASE}/accounts/register/")
    print(f"Request Data: {json.dumps(register_data, indent=2)}")
    print("-" * 30)
    
    try:
        response = requests.post(
            f"{API_BASE}/accounts/register/",
            json=register_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        )
        
        print(f"Response Status: {response.status_code}")
        
        try:
            response_json = response.json()
            print(f"Response JSON: {json.dumps(response_json, indent=2)}")
        except json.JSONDecodeError:
            print(f"Response Text: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_server_connection():
    """Test if server is running"""
    print("Testing Server Connection...")
    print("=" * 50)
    
    try:
        response = requests.get(f"{API_BASE}/accounts/")
        print(f"✅ Server is running - Status: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start Django server with: python manage.py runserver")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    if test_server_connection():
        test_register()
        test_login()