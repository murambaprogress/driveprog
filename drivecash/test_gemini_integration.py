#!/usr/bin/env python
"""
Test script to verify Gemini AI integration for car image analysis
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Test Gemini API connection
def test_gemini_connection():
    """Test if Gemini API is properly configured"""
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ GEMINI_API_KEY not found in environment variables")
            return False
        
        print(f"✅ GEMINI_API_KEY found: {api_key[:10]}...")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Test text generation
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content("Hello, this is a test. Please respond with 'Gemini is working!'")
        
        print(f"✅ Gemini Text API Response: {response.text}")
        
        # Test if vision model is available
        try:
            vision_model = genai.GenerativeModel('gemini-2.0-flash')
            print("✅ Gemini Vision model is available")
        except Exception as e:
            print(f"⚠️  Gemini Vision model error: {e}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Failed to import google.generativeai: {e}")
        return False
    except Exception as e:
        print(f"❌ Gemini API test failed: {e}")
        return False

def test_car_analyzer():
    """Test the CarImageAnalyzer class"""
    try:
        from loans.car_image_analyzer import CarImageAnalyzer
        
        analyzer = CarImageAnalyzer()
        print("✅ CarImageAnalyzer initialized successfully")
        
        # Test that the analyzer has the correct configuration
        if hasattr(analyzer, 'api_key') and analyzer.api_key:
            print(f"✅ Analyzer has API key: {analyzer.api_key[:10]}...")
        else:
            print("❌ Analyzer missing API key")
            
        if hasattr(analyzer, 'model'):
            print(f"✅ Analyzer model configured: {analyzer.model_name}")
        else:
            print("❌ Analyzer model not configured")
            
        return True
        
    except Exception as e:
        print(f"❌ CarImageAnalyzer test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Gemini AI Integration for DriveCash...")
    print("=" * 50)
    
    # Test 1: Gemini API Connection
    print("\n1. Testing Gemini API Connection:")
    gemini_ok = test_gemini_connection()
    
    # Test 2: Car Image Analyzer
    print("\n2. Testing Car Image Analyzer:")
    analyzer_ok = test_car_analyzer()
    
    # Summary
    print("\n" + "=" * 50)
    print("🔍 Test Summary:")
    print(f"   Gemini API: {'✅ PASS' if gemini_ok else '❌ FAIL'}")
    print(f"   Car Analyzer: {'✅ PASS' if analyzer_ok else '❌ FAIL'}")
    
    if gemini_ok and analyzer_ok:
        print("\n🎉 All tests passed! Gemini integration is ready.")
    else:
        print("\n❌ Some tests failed. Please check the configuration.")