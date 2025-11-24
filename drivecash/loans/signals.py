from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.apps import apps
import logging

logger = logging.getLogger(__name__)

@receiver(post_migrate)
def associate_applications_with_users(sender, **kwargs):
    """
    Associate loan applications with matching users based on email.
    This runs after migrations to fix any inconsistencies.
    """
    # Only run once when the loans app is migrated
    if sender.name != 'loans':
        return
    
    try:
        # Get the models
        LoanApplication = apps.get_model('loans', 'LoanApplication')
        User = apps.get_model('accounts', 'User')
        
        # Find applications without users
        unassociated_apps = LoanApplication.objects.filter(user=None)
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
                        logger.info(f"Associated application {app.application_id} with user {user.email}")
                except Exception as e:
                    logger.error(f"Error associating application {app.application_id}: {str(e)}")
        
        if associated_count > 0:
            logger.info(f"Signal handler: Associated {associated_count} applications with users")
    except Exception as e:
        logger.error(f"Error in associate_applications_with_users: {str(e)}")
