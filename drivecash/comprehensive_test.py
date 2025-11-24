import requests
import json

def test_login_comprehensive():
    """
    Comprehensive test of the login API to debug frontend issues
    """
    print("🔍 COMPREHENSIVE LOGIN API TEST")
    print("=" * 60)
    
    # Test credentials
    test_cases = [
        {
            "name": "Valid test user",
            "email": "test@example.com",
            "password": "testpassword123"
        },
        {
            "name": "Empty email",
            "email": "",
            "password": "testpassword123"
        },
        {
            "name": "Empty password", 
            "email": "test@example.com",
            "password": ""
        },
        {
            "name": "Invalid email format",
            "email": "invalid-email",
            "password": "testpassword123"
        },
        {
            "name": "Non-existent user",
            "email": "nonexistent@example.com", 
            "password": "anypassword"
        }
    ]
    
    base_url = "http://127.0.0.1:8000/api/accounts/login/"
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 TEST {i}: {test_case['name']}")
        print("-" * 40)
        
        try:
            # Test data
            data = {
                "email": test_case["email"],
                "password": test_case["password"]
            }
            
            print(f"Request URL: {base_url}")
            print(f"Request Data: {json.dumps(data, indent=2)}")
            
            # Make request with same headers as frontend
            response = requests.post(
                base_url,
                json=data,  # This automatically sets Content-Type: application/json
                headers={
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Test Frontend)',
                },
                timeout=10
            )
            
            print(f"Response Status: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            try:
                response_data = response.json()
                print(f"Response JSON:")
                print(json.dumps(response_data, indent=2))
                
                # Analyze the response
                if response.status_code == 200:
                    print("✅ SUCCESS")
                    if 'tokens' in response_data:
                        print("🔑 JWT tokens received")
                elif response.status_code == 400:
                    print("❌ BAD REQUEST - Invalid request format or validation error")
                    if 'email' in response_data:
                        print(f"   Email errors: {response_data['email']}")
                    if 'password' in response_data:
                        print(f"   Password errors: {response_data['password']}")
                elif response.status_code == 401:
                    print("🔒 UNAUTHORIZED - Invalid credentials")
                else:
                    print(f"⚠️  UNEXPECTED STATUS: {response.status_code}")
                    
            except json.JSONDecodeError:
                print(f"❌ INVALID JSON RESPONSE: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ CONNECTION ERROR - Django server not running?")
        except requests.exceptions.Timeout:
            print("❌ TIMEOUT ERROR")
        except Exception as e:
            print(f"❌ UNEXPECTED ERROR: {e}")
    
    print("\n" + "=" * 60)
    print("🔧 DEBUGGING INSIGHTS:")
    print("1. If all valid requests work → Frontend request format issue")
    print("2. If 400 errors on valid data → Django serializer validation issue")
    print("3. If connection errors → Django server not running")
    print("4. If working here but not in frontend → CORS or proxy issue")

def test_cors_headers():
    """Test CORS configuration"""
    print("\n🌐 CORS CONFIGURATION TEST")
    print("=" * 60)
    
    base_url = "http://127.0.0.1:8000/api/accounts/login/"
    
    # Test OPTIONS request (CORS preflight)
    try:
        print("Testing OPTIONS request (CORS preflight)...")
        options_response = requests.options(
            base_url,
            headers={
                'Origin': 'http://localhost:3002',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type',
            },
            timeout=5
        )
        
        print(f"OPTIONS Status: {options_response.status_code}")
        print(f"OPTIONS Headers: {dict(options_response.headers)}")
        
        # Check critical CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': options_response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': options_response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': options_response.headers.get('Access-Control-Allow-Headers'),
            'Access-Control-Allow-Credentials': options_response.headers.get('Access-Control-Allow-Credentials'),
        }
        
        print("\n🔍 CORS Headers Analysis:")
        for header, value in cors_headers.items():
            status = "✅" if value else "❌"
            print(f"{status} {header}: {value}")
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

def test_serializer_validation():
    """Test what the LoginSerializer validates"""
    print("\n📝 SERIALIZER VALIDATION TEST")
    print("=" * 60)
    
    base_url = "http://127.0.0.1:8000/api/accounts/login/"
    
    # Test various data formats
    test_formats = [
        {
            "name": "Standard JSON",
            "data": {"email": "test@example.com", "password": "testpassword123"},
            "content_type": "application/json"
        },
        {
            "name": "Form data",
            "data": {"email": "test@example.com", "password": "testpassword123"},
            "content_type": "application/x-www-form-urlencoded"
        },
        {
            "name": "Extra fields",
            "data": {"email": "test@example.com", "password": "testpassword123", "extra": "field"},
            "content_type": "application/json"
        },
        {
            "name": "Missing email",
            "data": {"password": "testpassword123"},
            "content_type": "application/json"
        },
        {
            "name": "Missing password",
            "data": {"email": "test@example.com"},
            "content_type": "application/json"
        }
    ]
    
    for test_format in test_formats:
        print(f"\n🧪 Testing: {test_format['name']}")
        
        try:
            if test_format["content_type"] == "application/json":
                response = requests.post(base_url, json=test_format["data"], timeout=5)
            else:
                response = requests.post(
                    base_url, 
                    data=test_format["data"],
                    headers={'Content-Type': test_format["content_type"]},
                    timeout=5
                )
            
            print(f"   Status: {response.status_code}")
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    print(f"   Errors: {error_data}")
                except:
                    print(f"   Raw response: {response.text}")
            else:
                print("   ✅ Success")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    test_login_comprehensive()
    test_cors_headers()
    test_serializer_validation()
    
    print(f"\n🚀 NEXT STEPS:")
    print("1. If backend tests pass → Check frontend proxy configuration")
    print("2. If CORS issues → Update Django CORS settings")
    print("3. If serializer issues → Check LoginSerializer requirements")
    print("4. Test frontend by opening: http://localhost:3002 (or available port)")