"""
Test script to verify documents are visible in both admin and user API responses
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication
from loans.serializers import LoanApplicationSerializer
from rest_framework.renderers import JSONRenderer
import json

print("🔍 Testing Document Visibility in API Responses...")
print("=" * 70)

# Get the most recent application with documents
applications = LoanApplication.objects.filter(
    documents__isnull=False
).distinct().order_by('-created_at')[:1]

if not applications.exists():
    print("⚠️  No applications with documents found!")
    print("\n💡 To test this:")
    print("   1. Create a loan application in the frontend")
    print("   2. Upload documents in Step 4")
    print("   3. Submit the application")
    print("   4. Run this script again")
else:
    app = applications.first()
    print(f"📋 Testing Application ID: {app.id}")
    print(f"   Application UUID: {app.application_id}")
    print(f"   Applicant: {app.personal_info.first_name if app.personal_info else 'N/A'} {app.personal_info.last_name if app.personal_info else ''}")
    print(f"   Status: {app.status}")
    print()
    
    # Serialize the application
    serializer = LoanApplicationSerializer(app)
    data = serializer.data
    
    # Check documents in serialized data
    print("📊 Serialized Data Check:")
    print(f"   - 'documents' field present: {'documents' in data}")
    print(f"   - 'document_summary' field present: {'document_summary' in data}")
    print()
    
    if 'documents' in data:
        docs = data['documents']
        print(f"✅ Documents array found: {len(docs)} document(s)")
        print()
        
        if len(docs) > 0:
            print("📎 Document Details:")
            for idx, doc in enumerate(docs, 1):
                print(f"\n   Document {idx}:")
                print(f"      ID: {doc.get('id')}")
                print(f"      Type: {doc.get('document_type')}")
                print(f"      Title: {doc.get('title')}")
                print(f"      File: {doc.get('file')}")
                print(f"      Uploaded: {doc.get('uploaded_at')}")
                print(f"      Analyzed: {doc.get('is_analyzed')}")
        else:
            print("   ℹ️  Documents array is empty")
    else:
        print("❌ No 'documents' field in serialized data!")
    
    print()
    if 'document_summary' in data:
        summary = data['document_summary']
        print(f"📝 Document Summary:")
        print(f"   Total Count: {summary.get('total_count')}")
        print(f"   Has Documents: {summary.get('has_documents')}")
        print(f"   Document Types: {summary.get('document_types')}")
    else:
        print("❌ No 'document_summary' field in serialized data!")
    
    print()
    print("=" * 70)
    
    # Test JSON rendering (what the API actually returns)
    print("\n🌐 Testing API JSON Response...")
    json_data = JSONRenderer().render(data)
    json_obj = json.loads(json_data)
    
    if 'documents' in json_obj:
        print(f"✅ Documents present in JSON response: {len(json_obj['documents'])} document(s)")
        
        # Show first document as example
        if len(json_obj['documents']) > 0:
            print("\n📄 Example Document (as returned by API):")
            example_doc = json_obj['documents'][0]
            print(json.dumps(example_doc, indent=4))
    else:
        print("❌ Documents NOT present in JSON response!")
    
    print()
    print("=" * 70)
    print("\n✅ Frontend Integration Check:")
    print()
    print("   ADMIN VIEW (LoanReviewModal.js):")
    print("   - Expects: loanData.documents (array)")
    print("   - Status:", "✅ WILL WORK" if 'documents' in json_obj else "❌ WILL FAIL")
    print()
    print("   USER VIEW (LoanApplicationDetails.js):")
    print("   - Expects: application.documents (array)")
    print("   - Status:", "✅ WILL WORK" if 'documents' in json_obj else "❌ WILL FAIL")
    print()
    
    if 'documents' in json_obj and len(json_obj['documents']) > 0:
        print("=" * 70)
        print("✅ SUCCESS: Documents are properly serialized and will display in both views!")
        print()
        print("💡 What users will see:")
        print(f"   - {len(json_obj['documents'])} uploaded document(s)")
        print("   - Document types:", [d.get('document_type') for d in json_obj['documents']])
        print("   - File paths available for download/preview")
    else:
        print("=" * 70)
        print("⚠️  WARNING: Documents array is empty or missing!")
        print()
        print("💡 Possible reasons:")
        print("   1. Application has no uploaded documents yet")
        print("   2. Documents were not properly saved during submission")
        print("   3. Check that Review.js is uploading documents correctly")

print()
print("=" * 70)
