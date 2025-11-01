"""
Database setup script for DriveCash backend
This script helps create the database and user for the Django application
"""
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create database for DriveCash"""
    connection = None
    cursor = None
    
    try:
        # Connect to MySQL server with root user
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user='root',  # XAMPP default user
            password='',  # XAMPP default password (empty)
            port=os.getenv('DB_PORT', '3306')
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database
            db_name = os.getenv('DB_NAME', 'drivecash_db')
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            print(f"Database '{db_name}' created or already exists")
            
            # Grant privileges to root user on the database
            cursor.execute(f"GRANT ALL PRIVILEGES ON {db_name}.* TO 'root'@'localhost'")
            cursor.execute("FLUSH PRIVILEGES")
            
            print(f"Granted all privileges on '{db_name}' to 'root'@'localhost'")
            
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            print("MySQL connection is closed")

if __name__ == "__main__":
    create_database()