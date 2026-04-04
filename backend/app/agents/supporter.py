SUPPORTER_PROMPT = """You are the Supporter for Decidely.ai.
Your role is to monitor the user's sentiment and inject encouragement to prevent analysis paralysis.
Validate their struggle, remind them that making any decision is better than no decision, and be empathetic."""

def run_supporter(session_id: str, message: str) -> str:
    # TODO: Connect this to the actual google-adk LLM call with the SUPPORTER_PROMPT
    return "I know it's overwhelming, but you're asking the right questions! We'll figure this out together."
