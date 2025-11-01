"""
Script to run the DriveCash backend development server
"""
import os
import sys
import subprocess

def run_server():
    """Run the Django development server"""
    try:
        # Check if we're in the backend directory
        if not os.path.exists('manage.py'):
            print("Error: manage.py not found. Please run this script from the backend directory.")
            return
            
        print("Starting DriveCash backend development server...")
        print("Server will be available at http://127.0.0.1:8000/")
        print("Press CTRL+C to stop the server")
        
        # Run the development server
        subprocess.run([sys.executable, 'manage.py', 'runserver'])
        
    except KeyboardInterrupt:
        print("\nServer stopped.")
    except Exception as e:
        print(f"Error running server: {e}")

if __name__ == "__main__":
    run_server()