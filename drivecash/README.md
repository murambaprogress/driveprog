# DriveCash Backend

This is the Django backend for the DriveCash system.

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\Activate.ps1`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Make sure XAMPP MySQL is running:
   - Start XAMPP Control Panel
   - Start MySQL service

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```
   Or use the default superuser:
   - Email: admin@example.com
   - Username: admin
   - Password: adminpass

7. Run the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/user/` - Register a new user
- `POST /api/auth/register/admin/` - Register a new admin (requires email verification)
- `POST /api/auth/verify/admin/otp/` - Verify admin OTP
- `POST /api/auth/login/` - User login
- `GET /api/auth/profile/` - Get user profile

### Admin
- `GET /api/admin/dashboard/` - Admin dashboard
- `POST /api/admin/profile/update/` - Update admin profile
- `GET /api/admin/users/` - Get all regular users

## Environment Variables

- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port

## Testing the API

You can test the API endpoints using tools like Postman or curl:

1. User Registration:
   ```
   POST http://127.0.0.1:8000/api/auth/register/user/
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "yourpassword",
     "password2": "yourpassword",
     "user_type": "user",
     "phone_number": "1234567890"
   }
   ```

2. Admin Registration:
   ```
   POST http://127.0.0.1:8000/api/auth/register/admin/
   {
     "username": "testadmin",
     "email": "r2210294w@students.msu.ac.zw",
     "password": "yourpassword",
     "password2": "yourpassword",
     "user_type": "admin",
     "phone_number": "1234567890"
   }
   ```

3. Admin OTP Verification:
   ```
   POST http://127.0.0.1:8000/api/auth/verify/admin/otp/
   {
     "user_id": 1,
     "otp_code": "123456"
   }
   ```

4. User Login:
   ```
   POST http://127.0.0.1:8000/api/auth/login/
   {
     "email": "test@example.com",
     "password": "yourpassword"
   }
   ```

The backend is now accessible at http://127.0.0.1:8000/
The admin interface is available at http://127.0.0.1:8000/admin/