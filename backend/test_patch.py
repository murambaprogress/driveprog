#!/usr/bin/env python
"""
Simple HTTP test using urllib instead of requests to avoid import issues
"""

import urllib.request
import urllib.parse
import json

def test_patch_endpoint():
    """Test PATCH endpoint with a simple HTTP request"""
    
    try:
        # First create a simple loan application 
        create_url = "http://127.0.0.1:8000/api/loans/applications/"
        
        create_data = {
            "first_name": "Test",
            "last_name": "User", 
            "email": "testpatch@example.com",
            "phone": "9876543210",
            "amount": 15000,
            "purpose": "vehicle purchase"
        }
        
        # Create application
        create_req_data = json.dumps(create_data).encode('utf-8')
        create_req = urllib.request.Request(
            create_url, 
            data=create_req_data, 
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        with urllib.request.urlopen(create_req) as response:
            if response.status == 201:
                app_data = json.loads(response.read().decode('utf-8'))
                app_id = app_data['id']
                print(f"✅ Created application with ID: {app_id}")
                
                # Now test PATCH
                patch_url = f"http://127.0.0.1:8000/api/loans/applications/{app_id}/"
                patch_data = {"first_name": "Updated", "credit_score": 800}
                
                patch_req_data = json.dumps(patch_data).encode('utf-8')
                patch_req = urllib.request.Request(
                    patch_url,
                    data=patch_req_data,
                    headers={'Content-Type': 'application/json'},
                    method='PATCH'
                )
                
                with urllib.request.urlopen(patch_req) as patch_response:
                    if patch_response.status == 200:
                        print("✅ PATCH request successful!")
                        return True
                    else:
                        print(f"❌ PATCH failed with status: {patch_response.status}")
                        return False
            else:
                print(f"❌ Create failed with status: {response.status}")
                return False
                
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error: {e.code}")
        print(f"Response: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing PATCH endpoint for photo field fix...")
    print("=" * 50)
    
    success = test_patch_endpoint()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ PATCH endpoint is working correctly!")
    else:
        print("❌ PATCH endpoint still has issues.")