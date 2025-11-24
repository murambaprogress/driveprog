"""
Script to update the admin user's email address in the database.
Run this script from the backend directory: python update_admin_email.py
"""

import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'drivecash_backend.settings')
django.setup()

from accounts.models import User

def update_admin_email(new_email):
    """
    Update the admin user's email address.
    """
    try:
        admin_user = User.objects.get(username='9999999999')
        old_email = admin_user.email
        admin_user.email = new_email
        admin_user.save()
        
        print(f"✓ Admin email updated successfully!")
        print(f"  Old email: {old_email}")
        print(f"  New email: {new_email}")
        return True
    except User.DoesNotExist:
        print("✗ Error: Admin user with username '9999999999' not found.")
        print("  Please create the admin user first using the create-admin endpoint.")
        return False
    except Exception as e:
        print(f"✗ Error updating admin email: {str(e)}")
        return False

def display_current_admin():
    """
    Display current admin user information.
    """
    try:
        admin_user = User.objects.get(username='9999999999')
        print("\nCurrent Admin User Information:")
        print(f"  Username: {admin_user.username}")
        print(f"  Email: {admin_user.email}")
        print(f"  User Type: {admin_user.user_type}")
        print(f"  Is Staff: {admin_user.is_staff}")
        print(f"  Is Superuser: {admin_user.is_superuser}")
        print(f"  Is Verified: {admin_user.is_verified}")
    except User.DoesNotExist:
        print("\n✗ Admin user not found in database.")

if __name__ == "__main__":
    print("=" * 60)
    print("DriveCash Admin Email Update Script")
    print("=" * 60)
    
    # Display current admin info
    display_current_admin()
    
    print("\n" + "-" * 60)
    
    # Prompt for new email
    print("\nEnter the new admin email address (or 'q' to quit):")
    new_email = input("> ").strip()
    
    if new_email.lower() == 'q':
        print("\nOperation cancelled.")
        sys.exit(0)
    
    if not new_email or '@' not in new_email:
        print("\n✗ Invalid email address. Please provide a valid email.")
        sys.exit(1)
    
    # Confirm the change
    print(f"\nAre you sure you want to update the admin email to: {new_email}?")
    print("Type 'yes' to confirm:")
    confirmation = input("> ").strip().lower()
    
    if confirmation != 'yes':
        print("\nOperation cancelled.")
        sys.exit(0)
    
    # Update the email
    print("\nUpdating admin email...")
    if update_admin_email(new_email):
        print("\n" + "=" * 60)
        display_current_admin()
        print("=" * 60)
        print("\n✓ Done! The admin OTP will now be sent to the new email address.")
    else:
        sys.exit(1)
