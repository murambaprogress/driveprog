#!/usr/bin/env python
"""
Check available Gemini models
"""

import os
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai

api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

print("Available Gemini models:")
for model in genai.list_models():
    print(f"- {model.name} (supports: {', '.join(model.supported_generation_methods)})")