#!/usr/bin/env python
"""
Simple test to verify image analysis works with a sample image
"""

import os
import sys
from pathlib import Path
import base64
import io

# Add the project root to the Python path
sys.path.append(str(Path(__file__).parent))

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

from loans.car_image_analyzer import CarImageAnalyzer

def create_test_image():
    """Create a simple test image using PIL"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        # Create a simple test image (representing a car)
        width, height = 800, 600
        image = Image.new('RGB', (width, height), color='lightblue')
        draw = ImageDraw.Draw(image)
        
        # Draw a simple car shape
        # Car body
        draw.rectangle([150, 300, 650, 450], fill='red', outline='black', width=3)
        
        # Car wheels
        draw.ellipse([200, 420, 280, 500], fill='black', outline='black')
        draw.ellipse([520, 420, 600, 500], fill='black', outline='black')
        
        # Car windows
        draw.rectangle([180, 320, 620, 380], fill='lightblue', outline='black', width=2)
        
        # Add some text
        try:
            # Try to use a default font, fallback to default if not available
            font = ImageFont.load_default()
        except:
            font = None
            
        draw.text((300, 500), "TEST CAR IMAGE", fill='black', font=font)
        
        # Convert to base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        image_bytes = buffer.getvalue()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        
        return image_base64
        
    except Exception as e:
        print(f"Failed to create test image: {e}")
        return None

def test_image_analysis():
    """Test the car image analysis with a simple test image"""
    print("🚗 Testing Car Image Analysis...")
    
    # Create a test image
    test_image = create_test_image()
    if not test_image:
        print("❌ Could not create test image")
        return False
    
    print("✅ Created test car image")
    
    try:
        # Initialize the analyzer
        analyzer = CarImageAnalyzer()
        print("✅ CarImageAnalyzer initialized")
        
        # Analyze the test image
        result = analyzer.analyze_single_image(test_image, "base64")
        
        if result['success']:
            print("✅ Image analysis completed successfully!")
            print("\nAnalysis Results:")
            data = result['data']
            
            for key, value in data.items():
                if key != 'raw_response':
                    print(f"  {key}: {value}")
                    
            return True
        else:
            print(f"❌ Image analysis failed: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing Gemini Car Image Analysis...")
    print("=" * 50)
    
    success = test_image_analysis()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 Image analysis test passed! The system is ready.")
    else:
        print("❌ Image analysis test failed. Check the logs above.")