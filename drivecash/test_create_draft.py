# Test API Create Draft
import requests
import json

url = "http://localhost:8000/api/loans/applications/"

# Use form data instead of JSON
data = {
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "1234567890",
    "dob": "1990-01-01",
    "amount": "5000",
    "term": "36",
    "purpose": "Car Title Loan",
    "income": "50000",
    "employment_status": "employed",
    "employment_length": "2",
    "street": "123 Test St",
    "city": "Test City",
    "state": "CA",
    "zip_code": "12345",
    "credit_score": "650",
    "vehicle_make": "Toyota",
    "vehicle_model": "Camry",
    "vehicle_year": "2020",
    "vehicle_vin": "1234567890ABCDEFG",
    "vehicle_mileage": "50000",
    "accept_terms": "true",
    "is_draft": "true"
}

try:
    # Send as multipart form data
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    if response.status_code == 201:
        print("\n✅ Application created successfully!")
except Exception as e:
    print(f"Error: {e}")
    try:
        print(f"Response text: {response.text}")
    except:
        pass
