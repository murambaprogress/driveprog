#!/usr/bin/env python3
"""
Test AWS RDS MySQL Connection
"""
import MySQLdb
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_connection():
    """Test connection to AWS RDS MySQL"""
    try:
        print("Testing AWS RDS MySQL Connection...")
        print(f"Host: {os.getenv('DB_HOST', 'drivecashdb.cdayqkaoi7ey.us-east-2.rds.amazonaws.com')}")
        print(f"Database: {os.getenv('DB_NAME', 'drivecashdb')}")
        print(f"User: {os.getenv('DB_USER', 'drivecash')}")
        print(f"Port: {os.getenv('DB_PORT', '3306')}")
        
        # Attempt connection
        connection = MySQLdb.connect(
            host=os.getenv('DB_HOST', 'drivecashdb.cdayqkaoi7ey.us-east-2.rds.amazonaws.com'),
            user=os.getenv('DB_USER', 'drivecash'),
            password=os.getenv('DB_PASSWORD', 'driveprog01'),
            database=os.getenv('DB_NAME', 'drivecashdb'),
            port=int(os.getenv('DB_PORT', '3306')),
            connect_timeout=10
        )
        
        # Test the connection
        cursor = connection.cursor()
        cursor.execute("SELECT VERSION();")
        version = cursor.fetchone()
        
        print(f"✅ Connection successful!")
        print(f"MySQL Version: {version[0]}")
        
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        
        # Additional troubleshooting info
        if "10060" in str(e):
            print("\nTroubleshooting:")
            print("- Check if AWS RDS instance is running")
            print("- Verify security group allows inbound connections on port 3306")
            print("- Check if your IP is whitelisted in the security group")
            print("- Ensure the endpoint is correct")
        
        return False

if __name__ == "__main__":
    test_connection()