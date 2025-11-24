# Creating Admin User on PythonAnywhere

## The Issue
You're getting "Admin user not found. Please create it first" when trying to login as admin in production.

## Solution

### Step 1: Access PythonAnywhere Console
1. Go to https://www.pythonanywhere.com/
2. Login to your account
3. Go to **Consoles** tab
4. Start a **Bash console**

### Step 2: Navigate to Your Project
```bash
cd ~
cd drivecash  # or whatever your project directory is named
```

### Step 3: Run the Admin Creation Script
```bash
python create_production_admin.py
```

### Expected Output
```
============================================================
CREATING ADMIN USER FOR PRODUCTION
============================================================

Creating new admin user...

✓ Admin user created successfully!
  Username: 9999999999
  Email: murambaprogress@gmail.com
  Password: drivecash

============================================================
ADMIN LOGIN CREDENTIALS:
============================================================
  Username: 9999999999
  Password: drivecash
============================================================

✓ You can now login as admin!
```

### Step 4: Test Admin Login
1. Go to your live site: https://drivecash.pythonanywhere.com
2. Login with:
   - **Username**: `9999999999`
   - **Password**: `drivecash`

## Alternative: Using Django Shell

If the script doesn't work, you can create the admin user manually:

```bash
cd ~/drivecash
python manage.py shell
```

Then run this code:
```python
from accounts.models import User

# Create admin user
admin = User.objects.create_user(
    username='9999999999',
    email='murambaprogress@gmail.com',
    password='drivecash',
    user_type='admin',
    is_staff=True,
    is_superuser=True,
    is_verified=True
)

print(f"Admin created: {admin.username}")
```

Press `Ctrl+D` to exit the shell.

## Verification

To verify the admin user exists:
```bash
python manage.py shell
```

Then:
```python
from accounts.models import User
admin = User.objects.get(username='9999999999')
print(f"Username: {admin.username}")
print(f"Email: {admin.email}")
print(f"User Type: {admin.user_type}")
print(f"Is Staff: {admin.is_staff}")
print(f"Is Superuser: {admin.is_superuser}")
```

## Important Files to Upload

Make sure you've uploaded these files to PythonAnywhere:
- `create_production_admin.py` (in the backend directory)
- All model files in `accounts/models.py`
- `manage.py`

## Troubleshooting

### Error: "django.core.exceptions.ImproperlyConfigured"
- Make sure you're in the correct directory
- Check that `DJANGO_SETTINGS_MODULE` is set correctly

### Error: "No module named 'accounts'"
- Make sure you're in the backend directory
- Check that all app directories are present

### Still Having Issues?
Check the production database:
```bash
python manage.py dbshell
```

Then:
```sql
SELECT * FROM accounts_user WHERE username='9999999999';
```

If no results, the admin doesn't exist and needs to be created.
