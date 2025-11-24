#!/usr/bin/env python
"""
Test document upload functionality for loan applications
"""

import os
import sys
import django
import io
from PIL import Image

sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from django.core.files.uploadedfile import SimpleUploadedFile
from loans.models import LoanApplication, LoanApplicationDocument
from loans.serializers import LoanApplicationDocumentSerializer

def create_test_image():
    """Create a test image file"""
    # Create a simple test image
    image = Image.new('RGB', (800, 600), color='red')
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    buffer.seek(0)
    
    return SimpleUploadedFile(
        name='test_car_image.png',
        content=buffer.read(),
        content_type='image/png'
    )

def test_document_upload():
    """Test uploading a document to a loan application"""
    
    # Get the latest loan application
    app = LoanApplication.objects.order_by('-created_at').first()
    
    if not app:
        print("❌ No loan applications found. Create one first.")
        return False
    
    print(f"📋 Testing document upload for Application ID: {app.id}")
    print(f"   Applicant: {app.get_full_name()}")
    print(f"   Current documents: {app.documents.count()}")
    
    # Create test image
    test_image = create_test_image()
    
    # Create document manually (simulating what the view does)
    try:
        document = LoanApplicationDocument.objects.create(
            application=app,
            document_type='photo_front_car',
            title='Front of Car Photo (Test)',
            file=test_image,
            description='Test upload'
        )
        
        print(f"\n✅ Document created successfully!")
        print(f"   Document ID: {document.id}")
        print(f"   Type: {document.document_type}")
        print(f"   File: {document.file.name if document.file else 'None'}")
        print(f"   Uploaded at: {document.uploaded_at}")
        
        # Check if it appears in the application's documents
        doc_count = app.documents.count()
        print(f"\n📊 Application now has {doc_count} document(s)")
        
        # Test serializer output
        from loans.serializers import LoanApplicationSerializer
        serializer = LoanApplicationSerializer(app)
        doc_summary = serializer.data.get('document_summary', {})
        
        print(f"\n📊 Document Summary (from serializer):")
        print(f"   Total Count: {doc_summary.get('total_count', 0)}")
        print(f"   Has Documents: {doc_summary.get('has_documents', False)}")
        print(f"   Document Types: {doc_summary.get('document_types', [])}")
        
        # Check documents array in serialized data
        documents_data = serializer.data.get('documents', [])
        print(f"\n📎 Serialized Documents: {len(documents_data)} documents")
        for doc_data in documents_data:
            print(f"   - Type: {doc_data.get('document_type')}")
            print(f"     Title: {doc_data.get('title')}")
            print(f"     File: {doc_data.get('file')}")
        
        # Clean up test document
        print(f"\n🧹 Cleaning up test document...")
        document.file.delete()  # Delete the actual file
        document.delete()  # Delete the database record
        print("✅ Test document cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating document: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 Testing Document Upload Functionality...")
    print("=" * 70)
    
    success = test_document_upload()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ Document upload functionality is working correctly!")
    else:
        print("❌ Document upload has issues.")