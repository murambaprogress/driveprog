import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication

# Check application 185
app_id = 185
try:
    app = LoanApplication.objects.get(id=app_id)
    print(f"Application {app_id}:")
    print(f"  UUID: {app.application_id}")
    print(f"  Status: {app.status}")
    print(f"  Is Draft: {app.is_draft}")
    print(f"  User: {app.user}")
    print(f"  Documents count: {app.documents.count()}")
    print(f"  Created: {app.created_at}")
    
    # Check if status would block upload
    if app.status in ['approved', 'rejected', 'withdrawn']:
        print(f"  ❌ BLOCKED: Status '{app.status}' prevents uploads")
    else:
        print(f"  ✅ OK: Status '{app.status}' allows uploads")
        
    # Check existing photo fields
    photo_fields = [
        'photo_license', 'photo_vin_sticker', 'photo_vin',
        'photo_odometer', 'photo_front_car', 'photo_borrower', 'photo_insurance'
    ]
    
    print("\n  Photo fields:")
    for field in photo_fields:
        value = getattr(app, field, None)
        if value:
            print(f"    {field}: {value}")
        else:
            print(f"    {field}: (empty)")
            
except LoanApplication.DoesNotExist:
    print(f"Application {app_id} does not exist")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
