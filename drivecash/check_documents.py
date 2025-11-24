#!/usr/bin/env python
"""
Test script to check if loan application documents are showing correctly
"""

import os
import sys
import django

sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication, LoanApplicationDocument

def check_documents_for_applications():
    """Check documents for all loan applications"""
    
    applications = LoanApplication.objects.all().order_by('-created_at')[:10]
    
    print(f"Checking last {applications.count()} loan applications...")
    print("=" * 80)
    
    for app in applications:
        print(f"\n📋 Application ID: {app.id} (UUID: {app.application_id})")
        print(f"   Applicant: {app.get_full_name()}")
        print(f"   Status: {app.status}")
        print(f"   Created: {app.created_at}")
        
        # Check documents
        documents = app.documents.all()
        doc_count = documents.count()
        
        print(f"   📎 Documents: {doc_count} total")
        
        if doc_count > 0:
            for doc in documents:
                print(f"      - {doc.document_type}: {doc.title}")
                print(f"        File: {doc.file.name if doc.file else 'None'}")
                print(f"        Uploaded: {doc.uploaded_at}")
        else:
            print("      ⚠️  No documents uploaded")
        
        # Check document summary
        try:
            from loans.serializers import LoanApplicationSerializer
            serializer = LoanApplicationSerializer(app)
            doc_summary = serializer.data.get('document_summary', {})
            
            print(f"   📊 Document Summary (from serializer):")
            print(f"      Total Count: {doc_summary.get('total_count', 0)}")
            print(f"      Has Documents: {doc_summary.get('has_documents', False)}")
            print(f"      Document Types: {doc_summary.get('document_types', [])}")
        except Exception as e:
            print(f"   ❌ Error getting document summary: {e}")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    print("🔍 Checking Loan Application Documents...")
    print("=" * 80)
    
    check_documents_for_applications()