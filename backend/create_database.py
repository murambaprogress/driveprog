#!/usr/bin/env python3
"""
Create Database on AWS RDS MySQL
"""
import MySQLdb
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the drivecash_db database on AWS RDS MySQL"""
    try:
        print("Creating 'drivecash_db' database on AWS RDS...")
        print(f"Host: {os.getenv('DB_HOST', 'drivecash.cdayqkaoi7ey.us-east-2.rds.amazonaws.com')}")
        print(f"User: {os.getenv('DB_USER', 'drivecash')}")
        
        # Connect without specifying a database
        connection = MySQLdb.connect(
            host=os.getenv('DB_HOST', 'drivecash.cdayqkaoi7ey.us-east-2.rds.amazonaws.com'),
            user=os.getenv('DB_USER', 'drivecash'),
            password=os.getenv('DB_PASSWORD', 'driveprog01'),
            port=int(os.getenv('DB_PORT', '3306')),
            connect_timeout=10
        )
        
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute("SHOW DATABASES LIKE 'drivecash_db'")
        result = cursor.fetchone()
        
        if result:
            print(f"✅ Database 'drivecash_db' already exists!")
        else:
            # Create the database
            cursor.execute("CREATE DATABASE drivecash_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ Database 'drivecash_db' created successfully!")
        
        # Test connection to the new database
        cursor.execute("USE drivecash_db")
        cursor.execute("SELECT DATABASE()")
        current_db = cursor.fetchone()
        print(f"✅ Connected to database: {current_db[0]}")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Database creation failed: {str(e)}")
        return False

if __name__ == "__main__":
    if create_database():
        print("\n🎉 Database setup complete! You can now run Django migrations.")
        print("Next steps:")
        print("1. python manage.py migrate")
        print("2. python manage.py createsuperuser")
    else:
        print("\n❌ Database setup failed. Check your AWS RDS configuration.")