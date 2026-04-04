import os
from google import genai

# Initialize the Gemini client
# It automatically picks up GEMINI_API_KEY from the environment
try:
    client = genai.Client()
except Exception as e:
    print(f"Warning: Could not initialize GenAI client. {e}")
    client = None

MODEL_NAME = "gemini-3.1-flash-lite-preview"
