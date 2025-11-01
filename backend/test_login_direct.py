import requests
import json

# Test the login API directly
login_url = "http://127.0.0.1:8000/api/accounts/login/"

# Test data
test_data = {
    "email": "test@example.com",
    "password": "testpassword123"
}

print("Testing Django Login API directly...")
print(f"URL: {login_url}")
print(f"Data: {json.dumps(test_data, indent=2)}")
print("-" * 50)

try:
    # Make the request
    response = requests.post(
        login_url,
        json=test_data,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"✅ SUCCESS! Response JSON:")
            print(json.dumps(data, indent=2))
            
            # Check if tokens are present
            if 'tokens' in data:
                print("\n🔑 Tokens received:")
                print(f"Access Token (first 50 chars): {data['tokens']['access'][:50]}...")
                print(f"Refresh Token (first 50 chars): {data['tokens']['refresh'][:50]}...")
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON: {e}")
    else:
        print(f"❌ Request failed with status {response.status_code}")
        try:
            error_data = response.json()
            print(f"Error details: {json.dumps(error_data, indent=2)}")
        except:
            print(f"Raw error response: {response.text}")
            
except requests.exceptions.ConnectionError:
    print("❌ Connection Error - Is the Django server running?")
    print("Start it with: python manage.py runserver")
except requests.exceptions.Timeout:
    print("❌ Request timed out")
except Exception as e:
    print(f"❌ Unexpected error: {e}")

print("\n" + "="*60)

# Also test the raw curl equivalent
curl_command = f"""curl -X POST {login_url} \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{json.dumps(test_data)}'"""

print("Equivalent curl command:")
print(curl_command)