import os
import sys
import django
from django.core.files.uploadedfile import SimpleUploadedFile

# Setup Django environment
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication
from loans.serializers import LoanApplicationDocumentSerializer

# Get application 185
app = LoanApplication.objects.get(id=185)
print(f"Testing upload for application {app.id} (UUID: {app.application_id})")

# Create a fake file
fake_file = SimpleUploadedFile(
    "test_image.jpg",
    b"fake image content",
    content_type="image/jpeg"
)

# Try to create document like the view does (with updated mapping)
print("\nAttempting to create document with serializer...")
document_type = 'photo_vin_plate'  # vinFromDash maps to photo_vin_plate
serializer = LoanApplicationDocumentSerializer(data={
    'application': app.id,
    'document_type': document_type,
    'title': fake_file.name,
    'file': fake_file,
    'description': 'Uploaded from vinFromDash'
})

print(f"Is valid: {serializer.is_valid()}")
if not serializer.is_valid():
    print(f"Errors: {serializer.errors}")
    print(f"\nSerializer fields: {list(serializer.fields.keys())}")
    print(f"Required fields: {[f for f, field in serializer.fields.items() if field.required]}")
else:
    print("Serializer is valid!")
    # Try to save
    try:
        document = serializer.save(application=app)
        print(f"✅ Document created: ID={document.id}, file={document.file.name}")
    except Exception as e:
        print(f"❌ Error saving: {e}")
        import traceback
        traceback.print_exc()
