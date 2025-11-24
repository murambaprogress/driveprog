"""
Debug script to check what data the admin sees when fetching a loan application
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication, LoanApplicationDocument
from loans.serializers import LoanApplicationSerializer
import json

print("🔍 Debugging Admin Loan View - Document Display Issue")
print("=" * 70)

# Get recent applications
recent_apps = LoanApplication.objects.all().order_by('-created_at')[:5]

print(f"📋 Found {recent_apps.count()} recent applications\n")

for app in recent_apps:
    print(f"\nApplication ID: {app.id}")
    print(f"UUID: {app.application_id}")
    print(f"Status: {app.status}")
    print(f"Applicant: {app.personal_info.first_name if app.personal_info else 'N/A'} {app.personal_info.last_name if app.personal_info else ''}")
    
    # Check documents in database
    docs = LoanApplicationDocument.objects.filter(application=app)
    print(f"📎 Documents in DB: {docs.count()}")
    
    if docs.exists():
        for doc in docs:
            print(f"   - {doc.document_type}: {doc.title}")
            print(f"     File: {doc.file.name if doc.file else 'NO FILE'}")
            print(f"     File URL: {doc.file.url if doc.file else 'NO URL'}")
    
    # Check what the serializer returns
    serializer = LoanApplicationSerializer(app)
    data = serializer.data
    
    print(f"\n🔍 Serializer Output:")
    print(f"   'documents' key exists: {'documents' in data}")
    
    if 'documents' in data:
        print(f"   Documents count in serializer: {len(data['documents'])}")
        
        if len(data['documents']) > 0:
            print(f"\n   📄 First document in serializer:")
            first_doc = data['documents'][0]
            print(f"      ID: {first_doc.get('id')}")
            print(f"      Type: {first_doc.get('document_type')}")
            print(f"      Title: {first_doc.get('title')}")
            print(f"      File path: {first_doc.get('file')}")
            print(f"      Full URL should be: http://127.0.0.1:8000{first_doc.get('file')}")
    
    if 'document_summary' in data:
        summary = data['document_summary']
        print(f"\n   📊 Document Summary:")
        print(f"      Total: {summary.get('total_count')}")
        print(f"      Has docs: {summary.get('has_documents')}")
        print(f"      Types: {summary.get('document_types')}")
    
    print("\n" + "-" * 70)

print("\n" + "=" * 70)
print("\n💡 What admin frontend expects:")
print("   - Key: 'documents' (array)")
print("   - Each document needs: id, title, file (URL path), document_type")
print("\n🔧 Check if admin is looking for different field names!")
