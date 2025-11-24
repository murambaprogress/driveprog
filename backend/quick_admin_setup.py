"""
Quick admin check and creation script for PythonAnywhere web console.
Copy and paste this into PythonAnywhere's Python shell.
"""

from accounts.models import User

def check_and_create_admin():
    """Check if admin exists and create if needed"""
    
    admin_username = '9999999999'
    admin_email = 'admin@drivecash.com'  # Changed to unique admin email
    admin_password = 'drivecash'
    
    print("Checking for admin user...")
    
    # First check if email is used by someone else
    email_user = User.objects.filter(email=admin_email).first()
    if email_user and email_user.username != admin_username:
        print(f"⚠ Email conflict detected. Using alternate email...")
        admin_email = f'admin_{admin_username}@drivecash.com'
    
    # Check if admin user exists
    try:
        admin = User.objects.get(username=admin_username)
        print(f"✓ Admin exists: {admin.username} ({admin.email})")
        print(f"  User Type: {admin.user_type}")
        print(f"  Is Staff: {admin.is_staff}")
        print(f"  Is Verified: {admin.is_verified}")
        
        # Update if needed
        if admin.user_type != 'admin' or not admin.is_staff or not admin.is_verified:
            admin.user_type = 'admin'
            admin.is_staff = True
            admin.is_superuser = True
            admin.is_verified = True
            admin.save()
            print("✓ Admin settings updated!")
            
    except User.DoesNotExist:
        print("Admin not found. Creating...")
        admin = User.objects.create_user(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            user_type='admin',
            is_staff=True,
            is_superuser=True,
            is_verified=True
        )
        print(f"✓ Admin created: {admin.username}")
        print(f"  Username: {admin_username}")
        print(f"  Password: {admin_password}")
    
    print("\nAdmin login credentials:")
    print(f"  Username: {admin_username}")
    print(f"  Password: {admin_password}")

# Run the function
check_and_create_admin()
