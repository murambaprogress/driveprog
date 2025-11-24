#!/usr/bin/env python
"""
Django management command to test serializer
"""

import os
import sys
import django
from django.conf import settings

# Add the project root to the Python path
sys.path.append(os.path.dirname(__file__))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.serializers import LoanApplicationUpdateSerializer
from loans.models import LoanApplication

def test_serializer_fields():
    """Test that the serializer doesn't have invalid fields"""
    
    try:
        # Get the serializer fields
        serializer = LoanApplicationUpdateSerializer()
        field_names = list(serializer.fields.keys())
        
        print("✅ LoanApplicationUpdateSerializer instantiated successfully!")
        print(f"✅ Total fields: {len(field_names)}")
        
        # Check if problematic photo fields are gone
        photo_fields = ['photo_vin_sticker', 'photo_odometer', 'photo_borrower', 'photo_front_car', 'photo_vin', 'photo_license', 'photo_insurance']
        
        found_invalid_fields = []
        for field in photo_fields:
            if field in field_names:
                found_invalid_fields.append(field)
        
        if found_invalid_fields:
            print(f"❌ Still has invalid photo fields: {found_invalid_fields}")
            return False
        else:
            print("✅ No invalid photo fields found in serializer")
            
        # Show some of the valid fields
        print(f"✅ Sample valid fields: {field_names[:10]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to instantiate serializer: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing LoanApplicationUpdateSerializer...")
    print("=" * 50)
    
    success = test_serializer_fields()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ Serializer is properly configured!")
    else:
        print("❌ Serializer still has issues.")