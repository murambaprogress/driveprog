# Admin Email Configuration Guide

## Overview

This guide explains how to configure and update the admin user's email address for receiving OTP codes during admin login.

## Current Configuration

- **Admin Username**: `9999999999`
- **Admin Password**: `drivecash`
- **Current Email**: `r2210294w@students.msu.ac.zw`

## Methods to Update Admin Email

### Method 1: Using the Python Script (Recommended)

The easiest way to update the admin email is using the provided Python script:

```powershell
cd "C:\Users\HP\Downloads\Compressed\OFFICIAL DRIVECASH  SYSTEM'\backend"
python update_admin_email.py
```

The script will:

1. Display current admin information
2. Prompt you for the new email address
3. Ask for confirmation
4. Update the email in the database
5. Show the updated information

**Example:**

```
Enter the new admin email address (or 'q' to quit):
> newemail@example.com

Are you sure you want to update the admin email to: newemail@example.com?
Type 'yes' to confirm:
> yes

✓ Admin email updated successfully!
  Old email: r2210294w@students.msu.ac.zw
  New email: newemail@example.com
```

### Method 2: Using the API Endpoint

You can also update the admin email via the REST API:

**Endpoint**: `POST /api/accounts/admin/update-email/`

**Request Body**:

```json
{
  "new_email": "newemail@example.com",
  "password": "drivecash"
}
```

**cURL Example**:

```bash
curl -X POST http://localhost:8000/api/accounts/admin/update-email/ \
  -H "Content-Type: application/json" \
  -d '{
    "new_email": "newemail@example.com",
    "password": "drivecash"
  }'
```

**PowerShell Example**:

```powershell
$body = @{
    new_email = "newemail@example.com"
    password = "drivecash"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/accounts/admin/update-email/" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

**Response**:

```json
{
  "message": "Admin email updated successfully.",
  "new_email": "newemail@example.com"
}
```

### Method 3: Using Django Shell

You can also update the email directly using Django's interactive shell:

```powershell
cd "C:\Users\HP\Downloads\Compressed\OFFICIAL DRIVECASH  SYSTEM'\backend"
python manage.py shell
```

Then in the shell:

```python
from accounts.models import User

# Get the admin user
admin = User.objects.get(username='9999999999')

# Display current email
print(f"Current email: {admin.email}")

# Update email
admin.email = 'newemail@example.com'
admin.save()

print(f"New email: {admin.email}")
```

### Method 4: Using Django Admin Panel

If you have access to Django's admin panel:

1. Navigate to: `http://localhost:8000/admin/`
2. Log in with superuser credentials
3. Go to "Users" section
4. Find and click on the user with username `9999999999`
5. Update the email field
6. Click "Save"

## How Admin OTP Login Works

1. **Step 1 - Send OTP**:

   - Admin enters username (`9999999999`) and password (`drivecash`)
   - System verifies credentials
   - Generates a 6-digit OTP code
   - Sends OTP to the admin's email address
   - OTP is valid for 5 minutes

2. **Step 2 - Verify OTP**:
   - Admin enters the OTP code received via email
   - System verifies the OTP
   - Returns authentication tokens (JWT)

## Admin Login Endpoints

### Step 1: Request OTP

**Endpoint**: `POST /api/accounts/admin/login/step1/`

**Request**:

```json
{
  "username": "9999999999",
  "password": "drivecash"
}
```

**Response**:

```json
{
  "message": "OTP has been sent to the admin email address.",
  "user_id": 1
}
```

### Step 2: Verify OTP

**Endpoint**: `POST /api/accounts/admin/login/step2/`

**Request**:

```json
{
  "user_id": 1,
  "otp_code": "123456"
}
```

**Response**:

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## Email Configuration

Make sure your Django email settings are properly configured in `settings.py`:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'DriveCash <noreply@drivecash.com>'
```

For Gmail:

1. Enable 2-Factor Authentication
2. Generate an App Password
3. Use the App Password in `EMAIL_HOST_PASSWORD`

## Testing

After updating the admin email, test the login flow:

1. Start the backend server:

   ```powershell
   cd "C:\Users\HP\Downloads\Compressed\OFFICIAL DRIVECASH  SYSTEM'\backend"
   python manage.py runserver
   ```

2. Try logging in as admin through the frontend
3. Check the new email address for the OTP code
4. Complete the login process

## Troubleshooting

### OTP Email Not Received

1. **Check email configuration**:

   ```powershell
   cd "C:\Users\HP\Downloads\Compressed\OFFICIAL DRIVECASH  SYSTEM'\backend"
   python manage.py shell
   ```

   ```python
   from django.core.mail import send_mail
   from django.conf import settings

   # Test email sending
   send_mail(
       'Test Email',
       'This is a test message.',
       settings.DEFAULT_FROM_EMAIL,
       ['your-email@example.com'],
       fail_silently=False,
   )
   ```

2. **Check spam/junk folder**: OTP emails might be filtered as spam

3. **Verify email in database**:
   ```python
   from accounts.models import User
   admin = User.objects.get(username='9999999999')
   print(f"Admin email: {admin.email}")
   ```

### Invalid Credentials Error

- Verify username is exactly: `9999999999`
- Verify password is exactly: `drivecash`
- These are case-sensitive

### OTP Expired Error

- OTP codes expire after 5 minutes
- Request a new OTP if expired

## Security Notes

1. **Change Default Credentials**: In production, change the default admin credentials
2. **Secure Email**: Use a secure, monitored email address for admin OTP
3. **HTTPS**: Always use HTTPS in production
4. **Environment Variables**: Store email credentials in environment variables, not in code

## Files Modified

- `backend/accounts/views.py` - Added `update_admin_email` function and updated default email
- `backend/accounts/urls.py` - Added route for admin email update
- `backend/update_admin_email.py` - Created script for easy email updates

## Summary

The admin OTP is sent to the email address stored in the database for the user with username `9999999999`. You can update this email using any of the methods above. The system will then send all future OTP codes to the new email address.
