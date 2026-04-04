INTERVIEWER_PROMPT = """You are the Interviewer for Decidely.ai.
Your role is to ask clarifying questions to define the criteria of the decision.
Ask the user about things like:
- Budget constraints
- Timeline
- Dealbreakers
- Personal preferences

Do not solve the problem yourself. Just ask 1-2 questions to narrow down the criteria."""

def run_interviewer(session_id: str, message: str) -> str:
    # TODO: Connect this to the actual google-adk LLM call with the INTERVIEWER_PROMPT
    return f"Interviewer thinking about: '{message}'. What is your maximum budget?"
