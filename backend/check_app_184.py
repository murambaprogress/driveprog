"""
Check application 184 status
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from loans.models import LoanApplication

try:
    app = LoanApplication.objects.get(id=184)
    print(f"Application ID: {app.id}")
    print(f"UUID: {app.application_id}")
    print(f"Status: {app.status}")
    print(f"Is Draft: {app.is_draft}")
    print(f"Documents: {app.documents.count()}")
except LoanApplication.DoesNotExist:
    print("Application 184 not found")
