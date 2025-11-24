"""
Test if the API endpoint for fetching single loan application works
"""
import requests
import json

API_BASE = "http://127.0.0.1:8000/api"

print("🔍 Testing Loan Application Detail API Endpoint")
print("=" * 70)

# Get list of applications first
print("\n1. Fetching list of applications...")
try:
    response = requests.get(f"{API_BASE}/loans/applications/")
    if response.status_code == 200:
        data = response.json()
        apps = data if isinstance(data, list) else data.get('results', [])
        print(f"✅ Found {len(apps)} applications")
        
        if len(apps) > 0:
            app = apps[0]
            app_id = app.get('id')
            print(f"\n2. Testing detail endpoint for application ID: {app_id}")
            
            # Fetch single application details
            detail_response = requests.get(f"{API_BASE}/loans/applications/{app_id}/")
            
            if detail_response.status_code == 200:
                detail_data = detail_response.json()
                print(f"✅ Successfully fetched application details")
                print(f"\n📊 Response includes:")
                print(f"   - id: {detail_data.get('id')}")
                print(f"   - status: {detail_data.get('status')}")
                print(f"   - application_id: {detail_data.get('application_id')}")
                print(f"   - documents key present: {'documents' in detail_data}")
                
                if 'documents' in detail_data:
                    docs = detail_data['documents']
                    print(f"   - documents count: {len(docs)}")
                    
                    if len(docs) > 0:
                        print(f"\n📎 Sample document:")
                        sample = docs[0]
                        print(f"      id: {sample.get('id')}")
                        print(f"      title: {sample.get('title')}")
                        print(f"      file: {sample.get('file')}")
                        print(f"      document_type: {sample.get('document_type')}")
                else:
                    print("   ⚠️  'documents' key not in response!")
                
                print(f"\n✅ API Endpoint is working correctly!")
                print(f"   Frontend can call: GET {API_BASE}/loans/applications/{app_id}/")
                
            else:
                print(f"❌ Failed to fetch details: {detail_response.status_code}")
                print(f"   Response: {detail_response.text}")
        else:
            print("\n⚠️  No applications found in database")
            print("   Create a loan application first to test")
    else:
        print(f"❌ Failed to fetch list: {response.status_code}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 70)
print("\n💡 For frontend to work:")
print("   1. Make sure frontend is running: npm start")
print("   2. Clear browser cache (Ctrl+Shift+Delete)")
print("   3. Hard refresh page (Ctrl+F5)")
print("   4. Check browser console for errors")
