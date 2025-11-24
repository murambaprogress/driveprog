"""
Check for orphaned files in media folder (files without database records)
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from django.conf import settings
from loans.models import LoanApplication, LoanApplicationDocument
from pathlib import Path

print("🔍 Checking for Uploaded Files vs Database Records")
print("=" * 70)

# Check media folder
media_root = settings.MEDIA_ROOT
loan_docs_path = os.path.join(media_root, 'loan_documents')

print(f"\n📁 Media root: {media_root}")
print(f"📁 Loan documents path: {loan_docs_path}")

# Count files in media folder
if os.path.exists(loan_docs_path):
    all_files = []
    for root, dirs, files in os.walk(loan_docs_path):
        for file in files:
            if not file.startswith('.'):  # Skip hidden files
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, media_root)
                all_files.append(rel_path)
    
    print(f"\n📄 Files in media folder: {len(all_files)}")
    
    if all_files:
        print("\n📋 Files found:")
        for i, f in enumerate(all_files[:10], 1):  # Show first 10
            print(f"   {i}. {f}")
        if len(all_files) > 10:
            print(f"   ... and {len(all_files) - 10} more files")
    else:
        print("   ℹ️  No files found in loan_documents folder")
else:
    print("\n⚠️  loan_documents folder doesn't exist yet")

# Count database records
doc_count = LoanApplicationDocument.objects.count()
print(f"\n💾 Database records: {doc_count}")

if doc_count > 0:
    print("\n📋 Documents in database:")
    docs = LoanApplicationDocument.objects.all()
    for doc in docs:
        print(f"   ID {doc.id}: {doc.title}")
        print(f"      Application: {doc.application_id}")
        print(f"      File: {doc.file.name}")
        print(f"      Type: {doc.document_type}")
        print()

# Compare
print("=" * 70)
print("\n📊 Summary:")
print(f"   Files in folder: {len(all_files) if os.path.exists(loan_docs_path) else 0}")
print(f"   Records in database: {doc_count}")

if os.path.exists(loan_docs_path):
    if len(all_files) > doc_count:
        print(f"\n⚠️  WARNING: {len(all_files) - doc_count} orphaned files found!")
        print("   Files exist in media folder but no database records.")
        print("   This means uploads are saving files but NOT creating DB records!")
    elif len(all_files) < doc_count:
        print(f"\n⚠️  WARNING: {doc_count - len(all_files)} missing files!")
        print("   Database records exist but files are missing.")
    else:
        print("\n✅ Files and database records match!")

# Check recent applications
print("\n" + "=" * 70)
print("\n📋 Recent Applications:")
recent_apps = LoanApplication.objects.order_by('-created_at')[:5]

for app in recent_apps:
    doc_count = app.documents.count()
    print(f"\nApplication ID: {app.id}")
    print(f"   Status: {app.status}")
    print(f"   Created: {app.created_at}")
    print(f"   Documents: {doc_count}")
    
    if doc_count > 0:
        for doc in app.documents.all():
            print(f"      - {doc.title} ({doc.document_type})")

print("\n" + "=" * 70)
