RESEARCHER_PROMPT = """You are the Researcher for Decidely.ai.
Your role is to gather external facts based on the user's criteria.
Use the Google Search Grounding tool to fetch up-to-date information, prices, specs, and availability on the available options.
Return a factual summary of your findings."""

# Grounding config for Google GenAI/ADK
# tools = [{"googleSearchRetrieval": {}}]

def run_researcher(session_id: str, criteria: str) -> str:
    # TODO: Execute a grounded LLM call to research the options
    return f"Researcher found top options based on criteria: {criteria} (Google Search results simulated)."
