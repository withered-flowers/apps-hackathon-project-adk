from app.core.config import client, MODEL_NAME
from google.genai import types

INTERVIEWER_PROMPT = """You are the Interviewer for Decidely.ai.
Your role is to ask clarifying questions to define the criteria of the decision.
Ask the user about things like:
- Budget constraints
- Timeline
- Dealbreakers
- Personal preferences

Do not solve the problem yourself. Just ask 1-2 concise questions to narrow down the criteria."""

def run_interviewer(session_id: str, message: str) -> str:
    if not client:
        return "To help you better, could you clarify your maximum budget and any dealbreakers?"
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=message,
        config=types.GenerateContentConfig(system_instruction=INTERVIEWER_PROMPT, temperature=0.7)
    )
    return response.text
