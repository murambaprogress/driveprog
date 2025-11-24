"""
Test script to verify loan application data flow consistency
Run this from the backend directory: python test_data_flow.py
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication
from loans.serializers import LoanApplicationSerializer
import json

def test_data_flow():
    """Test that all fields used by frontend are present in backend responses"""
    
    print("=" * 80)
    print("LOAN APPLICATION DATA FLOW TEST")
    print("=" * 80)
    
    # Get a sample application or create a test one
    app = LoanApplication.objects.first()
    
    if not app:
        print("\n⚠️  No loan applications found in database")
        print("Please create a loan application first to test data flow")
        return
    
    print(f"\n✓ Found application: {app.application_id}")
    print(f"  Status: {app.status}")
    print(f"  Is Draft: {app.is_draft}")
    
    # Serialize the application
    serializer = LoanApplicationSerializer(app)
    data = serializer.data
    
    print("\n" + "=" * 80)
    print("CHECKING FRONTEND REQUIRED FIELDS")
    print("=" * 80)
    
    # Fields required by User My Loans page
    my_loans_fields = [
        'id',
        'application_id',
        'amount',
        'vehicle_make',
        'vehicle_model',
        'vehicle_year',
        'status',
        'created_at'
    ]
    
    print("\n📋 User My Loans Page Fields:")
    for field in my_loans_fields:
        value = data.get(field)
        status = "✓" if field in data else "✗"
        print(f"  {status} {field}: {value}")
    
    # Fields required by User Loan Details page
    details_fields = [
        'application_id',
        'status',
        'amount',
        'term',
        'created_at',
        'submitted_at',
        'approved_amount',
        'first_name',
        'last_name',
        'email',
        'phone',
        'dob',
        'vehicle_make',
        'vehicle_model',
        'vehicle_year',
        'vehicle_vin',
        'vehicle_mileage',
        'ai_recommendation',
        'ai_risk_assessment',
        'approval_notes'
    ]
    
    print("\n📄 User Loan Details Page Fields:")
    for field in details_fields:
        value = data.get(field)
        status = "✓" if field in data else "✗"
        print(f"  {status} {field}: {value if value is not None else 'null'}")
    
    # Fields required by Admin Loans Management
    admin_fields = [
        'id',
        'application_id',
        'first_name',
        'last_name',
        'full_name',
        'email',
        'phone',
        'amount',
        'interest_rate',  # NEW FIELD
        'term',
        'status',
        'created_at',
        'submitted_at'
    ]
    
    print("\n👨‍💼 Admin Loans Management Fields:")
    for field in admin_fields:
        value = data.get(field)
        status = "✓" if field in data else "✗"
        print(f"  {status} {field}: {value if value is not None else 'null'}")
    
    # Check for all serialized fields
    print("\n" + "=" * 80)
    print("ALL AVAILABLE FIELDS IN RESPONSE")
    print("=" * 80)
    print(f"\nTotal fields: {len(data)}")
    print("\nField list:")
    for key in sorted(data.keys()):
        print(f"  - {key}")
    
    # Check for missing critical fields
    print("\n" + "=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)
    
    all_required = set(my_loans_fields + details_fields + admin_fields)
    missing = [f for f in all_required if f not in data]
    
    if missing:
        print(f"\n❌ MISSING FIELDS ({len(missing)}):")
        for field in missing:
            print(f"  - {field}")
    else:
        print("\n✅ ALL REQUIRED FIELDS PRESENT")
    
    # Check for fields with null values that might cause issues
    null_fields = [k for k, v in data.items() if v is None and k in all_required]
    if null_fields:
        print(f"\n⚠️  FIELDS WITH NULL VALUES ({len(null_fields)}):")
        for field in null_fields:
            print(f"  - {field}")
    
    print("\n" + "=" * 80)
    print("SAMPLE JSON RESPONSE")
    print("=" * 80)
    print(json.dumps(data, indent=2, default=str))
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_data_flow()
