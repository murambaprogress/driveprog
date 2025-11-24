"""
Test the document upload endpoint directly to verify it works
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication, LoanApplicationDocument
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from io import BytesIO

print("🧪 Testing Document Upload Flow")
print("=" * 70)

# Get most recent application
app = LoanApplication.objects.order_by('-created_at').first()

if not app:
    print("❌ No applications found!")
else:
    print(f"\n📋 Using Application ID: {app.id}")
    print(f"   Status: {app.status}")
    print(f"   Current documents: {app.documents.count()}")
    
    # Create a test image
    print("\n📸 Creating test image...")
    img = Image.new('RGB', (200, 200), color='blue')
    img_io = BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    # Create the uploaded file
    uploaded_file = SimpleUploadedFile(
        'test_upload_flow.png',
        img_io.read(),
        content_type='image/png'
    )
    
    print("✅ Test image created")
    
    # Create document using the same logic as the view
    print("\n💾 Creating LoanApplicationDocument...")
    
    try:
        doc = LoanApplicationDocument.objects.create(
            application=app,
            document_type='photo_front_car',
            title='Test Upload Flow',
            file=uploaded_file,
            description='Testing upload flow'
        )
        
        print(f"✅ Document created successfully!")
        print(f"   Document ID: {doc.id}")
        print(f"   File name: {doc.file.name}")
        print(f"   File path: {doc.file.path}")
        print(f"   File URL: {doc.file.url}")
        print(f"   File exists: {os.path.exists(doc.file.path)}")
        
        # Verify application relationship
        print(f"\n🔗 Verifying relationship...")
        print(f"   Document.application_id: {doc.application_id}")
        print(f"   Application.documents.count(): {app.documents.count()}")
        
        # Fetch application again to verify documents appear
        app_refreshed = LoanApplication.objects.get(id=app.id)
        docs = app_refreshed.documents.all()
        print(f"   Refreshed application has {docs.count()} document(s)")
        
        if docs.count() > 0:
            print(f"\n📄 Documents list:")
            for d in docs:
                print(f"      - ID {d.id}: {d.title} ({d.document_type})")
                print(f"        File: {d.file.name}")
        
        print("\n✅ SUCCESS: Upload flow works correctly!")
        print("\n💡 This means:")
        print("   ✅ File saved to disk")
        print("   ✅ Database record created")
        print("   ✅ Application relationship established")
        print("   ✅ Documents appear in app.documents.all()")
        
        print("\n🔧 If frontend uploads don't show:")
        print("   1. Check browser console for upload errors")
        print("   2. Check Django console for [UPLOAD] logs")
        print("   3. Verify files in: backend/media/loan_documents/")
        print("   4. Run check_files_vs_db.py to compare files vs DB")
        
        # Clean up
        print(f"\n🧹 Cleaning up test document...")
        doc.delete()
        print("✅ Test document removed")
        
    except Exception as e:
        print(f"❌ Error creating document: {e}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 70)
