from app.core.config import client, MODEL_NAME
from google.genai import types

RESEARCHER_PROMPT = """You are the Researcher for Decidely.ai.
Your role is to gather external facts based on the user's criteria.
You MUST use the Google Search tool to fetch up-to-date information, prices, specs, and availability on the options.
Return a factual, structured summary of your findings."""

def run_researcher(session_id: str, criteria: str) -> str:
    if not client:
        return f"Based on your criteria ({criteria}), I would normally search the web here. (Mocked Google Search Results)"

    # Use the typed classes from the SDK to satisfy the Pyright type checker
    google_search_tool = types.Tool(
        google_search=types.GoogleSearch()
    )
    
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=f"Please research the following criteria: {criteria}",
        config=types.GenerateContentConfig(
            system_instruction=RESEARCHER_PROMPT,
            tools=[google_search_tool],
            temperature=0.2
        )
    )
    
    # response.text can technically be None if the model returns an empty payload
    return response.text or "No information could be found."
