from django.core.management.base import BaseCommand
from loans.models import LoanApplication
from accounts.models import User
import logging

class Command(BaseCommand):
    help = 'Associate loan applications with users based on email'

    def handle(self, *args, **options):
        self.stdout.write('Starting to associate loan applications with users...')
        
        # Find applications without users
        unassociated_apps = LoanApplication.objects.filter(user=None)
        self.stdout.write(f'Found {unassociated_apps.count()} unassociated applications')
        
        associated_count = 0
        
        for app in unassociated_apps:
            if hasattr(app, 'personal_info') and app.personal_info and app.personal_info.email:
                email = app.personal_info.email.lower()
                
                # Try to find a matching user
                try:
                    user = User.objects.filter(email__iexact=email).first()
                    if user:
                        app.user = user
                        app.save(update_fields=['user'])
                        associated_count += 1
                        self.stdout.write(f"Associated application {app.application_id} with user {user.email}")
                except Exception as e:
                    self.stderr.write(f"Error associating application {app.application_id}: {str(e)}")
        
        self.stdout.write(self.style.SUCCESS(f'Successfully associated {associated_count} applications with users'))