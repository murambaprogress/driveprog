"""
Test document URL generation in serializer
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication, LoanApplicationDocument
from loans.serializers import LoanApplicationSerializer
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

print("🔍 Testing Document URL in Serializer")
print("=" * 70)

# Get or create an application with a document
app = LoanApplication.objects.order_by('-created_at').first()

if not app:
    print("❌ No applications found!")
else:
    print(f"📋 Testing with Application ID: {app.id}")
    
    # Check if it has documents
    docs = app.documents.all()
    
    if docs.count() == 0:
        print("\n📎 No documents found, creating test document...")
        
        # Create a test image
        img = Image.new('RGB', (100, 100), color='red')
        img_io = BytesIO()
        img.save(img_io, 'PNG')
        img_io.seek(0)
        
        # Create document
        doc = LoanApplicationDocument.objects.create(
            application=app,
            document_type='photo_front_car',
            title='Test Document for URL',
            file=SimpleUploadedFile('test_url.png', img_io.read(), content_type='image/png'),
            description='Testing URL generation'
        )
        print(f"✅ Created test document ID: {doc.id}")
    else:
        doc = docs.first()
        print(f"✅ Using existing document ID: {doc.id}")
    
    print(f"\n📄 Document Details:")
    print(f"   File field: {doc.file}")
    print(f"   File name: {doc.file.name}")
    print(f"   File URL: {doc.file.url}")
    
    # Test serializer
    print(f"\n🔍 Testing Serializer:")
    serializer = LoanApplicationSerializer(app)
    data = serializer.data
    
    if 'documents' in data and len(data['documents']) > 0:
        first_doc = data['documents'][0]
        print(f"\n✅ Document in serializer:")
        print(f"   ID: {first_doc.get('id')}")
        print(f"   Title: {first_doc.get('title')}")
        print(f"   File URL: {first_doc.get('file')}")
        
        file_url = first_doc.get('file')
        if file_url:
            if file_url.startswith('http://') or file_url.startswith('https://'):
                print(f"\n✅ SUCCESS: Full absolute URL returned!")
                print(f"   Frontend can use this URL directly")
            else:
                print(f"\n⚠️  WARNING: Relative URL returned")
                print(f"   Frontend will need to prepend: http://127.0.0.1:8000")
                print(f"   Full URL would be: http://127.0.0.1:8000{file_url}")
        else:
            print(f"\n❌ ERROR: File URL is None/empty!")
    else:
        print("\n❌ No documents in serializer output!")
    
    print("\n" + "=" * 70)
    
    # Clean up test document if we created it
    if docs.count() == 0:
        doc.delete()
        print("🧹 Cleaned up test document")
