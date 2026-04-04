from app.core.config import client, MODEL_NAME
from google.genai import types

SUPPORTER_PROMPT = """You are the Supporter for Decidely.ai.
Your role is to monitor the user's sentiment and inject encouragement to prevent analysis paralysis.
Validate their struggle, remind them that making any decision is better than no decision, and be empathetic. Keep it to 1 short paragraph."""

def run_supporter(session_id: str, message: str) -> str:
    if not client:
        return "I know making this choice is overwhelming, but you're asking all the right questions! We'll figure this out together step-by-step."
        
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=message,
        config=types.GenerateContentConfig(system_instruction=SUPPORTER_PROMPT, temperature=0.8)
    )
    return response.text
