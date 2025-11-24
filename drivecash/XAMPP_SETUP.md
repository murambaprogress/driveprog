# XAMPP Setup for DriveCash Backend

## Prerequisites
1. Download and install XAMPP from https://www.apachefriends.org/index.html
2. Make sure MySQL service is running in XAMPP Control Panel

## Setup Instructions

1. Start XAMPP Control Panel
2. Start MySQL service (Apache is not required for the backend)
3. Navigate to the backend directory:
   ```
   cd backend
   ```
4. Activate the virtual environment:
   ```
   .\venv\Scripts\Activate.ps1  # Windows
   ```
5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
6. Run Django migrations:
   ```
   python manage.py migrate
   ```
7. Create a superuser:
   ```
   python manage.py createsuperuser
   ```
   Or use the default superuser:
   - Email: admin@example.com
   - Username: admin
   - Password: adminpass
8. Run the development server:
   ```
   python manage.py runserver
   ```

## Accessing the Application

- Backend API: http://127.0.0.1:8000/
- Admin Interface: http://127.0.0.1:8000/admin/

## Troubleshooting

If you encounter connection issues:
1. Make sure XAMPP MySQL is running on port 3306
2. Check that the credentials in .env match your MySQL setup
3. Ensure no other MySQL instances are running on the same port
4. If you get collation errors, you may need to update your MySQL version

The application is configured to use the root user with no password, which is the default for XAMPP installations.