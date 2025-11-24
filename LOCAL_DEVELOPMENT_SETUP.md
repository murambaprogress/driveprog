# Local Development Setup Guide

## Configuration Complete ✓

Your DriveCash application has been configured for local development.

## Changes Made:

### Frontend (driveprog-cleaned)
1. ✓ Fixed typo in `src/utils/apiClient.js`
2. ✓ Updated API URL to use `http://localhost:8000/api` by default
3. ✓ Created `.env` file with local development settings
4. ✓ Created `.env.example` file as a template

### Backend (backend/)
1. ✓ Updated `settings.py` to use SQLite database by default
2. ✓ Added `localhost` and `127.0.0.1` to `ALLOWED_HOSTS`
3. ✓ Updated CORS settings to allow requests from `http://localhost:3000`
4. ✓ Updated CSRF trusted origins for local development
5. ✓ Updated `.env` file with local database configuration

## How to Run:

### 1. Backend Setup (Django)
```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment (if not already done)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run migrations to create the SQLite database
python manage.py makemigrations
python manage.py migrate

# Create a superuser (admin)
python manage.py createsuperuser

# Run the development server
python manage.py runserver
```

The backend will run at: `http://localhost:8000`

### 2. Frontend Setup (React)
```powershell
# Navigate to frontend directory (from root)
cd ..

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

The frontend will run at: `http://localhost:3000`

## Database Information:

- **Database Type**: SQLite (file-based, no setup required)
- **Database Location**: `backend/db.sqlite3`
- **Migration**: Already configured, just run `python manage.py migrate`

### To switch to MySQL (optional):

1. Install MySQL server locally
2. Create a database: `CREATE DATABASE drivecash_db;`
3. Update `backend/.env`:
   ```env
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=drivecash_db
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   ```
4. Install MySQL client: `pip install mysqlclient`
5. Run migrations: `python manage.py migrate`

## Testing the Setup:

1. Start the backend server (port 8000)
2. Start the frontend server (port 3000)
3. Open your browser to `http://localhost:3000`
4. Try logging in or creating a new account
5. Check that API calls are working (check browser console/network tab)

## Common Issues:

### Port already in use:
- Backend: `python manage.py runserver 8001` (use different port)
- Frontend: Set `PORT=3001` in `.env` and run `npm start`

### CORS errors:
- Make sure backend is running
- Check that `CORS_ALLOW_ALL=True` in `backend/.env`
- Clear browser cache and cookies

### Database errors:
- Delete `db.sqlite3` and run `python manage.py migrate` again
- Make sure all migrations are created: `python manage.py makemigrations`

## Production Deployment:

When deploying to production (PythonAnywhere):

1. Update `backend/.env`:
   ```env
   DEBUG=False
   CORS_ALLOW_ALL=False
   DB_ENGINE=django.db.backends.mysql
   DB_NAME=drivecash$drivecash_db
   DB_USER=drivecash
   DB_PASSWORD=your_production_password
   DB_HOST=drivecash.mysql.pythonanywhere-services.com
   DB_PORT=3306
   ```

2. Update `frontend/.env`:
   ```env
   REACT_APP_API_URL=https://drivecash.pythonanywhere.com/api
   REACT_APP_ENV=production
   ```

3. Build the frontend: `npm run build`
4. Deploy to PythonAnywhere

## Next Steps:

- Create admin user: `python manage.py createsuperuser`
- Access admin panel: `http://localhost:8000/admin`
- Test all features locally before deploying
- Keep `.env` files secure (never commit to Git)
