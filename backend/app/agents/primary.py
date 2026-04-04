from .interviewer import run_interviewer
from .researcher import run_researcher
from .evaluator import run_evaluator
from .supporter import run_supporter
from .tool_loop import run_agent_with_tools
import json

PRIMARY_PROMPT = """You are the Primary Orchestrator for Decidely.ai.
You are the ONLY agent the user speaks to directly. 
Your job is to maintain the conversational flow, detect when more information is needed, and delegate tasks to sub-agents using your tools.

Available Sub-Agents (Tools):
- `ask_interviewer`: Use when you need to clarify criteria (budget, timeline, etc).
- `research_options`: Use when you need external facts or up-to-date information.
- `evaluate_options`: Use when you need to score options and build a pros/cons matrix in the database.
- `get_support`: Use to provide empathy if the user is stuck.

Analyze the user's message. If you need a sub-agent to do work, call the tool, read its response, and synthesize the final recommendation clearly to the user."""

def ask_interviewer(message: str) -> str:
    """Use this to ask the user clarifying questions about their criteria, budget, or preferences."""
    return run_interviewer("system", message)

def research_options(criteria: str) -> str:
    """Use this to search the web for external facts, options, and prices based on criteria."""
    return run_researcher("system", criteria)

def evaluate_options(research_data: str) -> str:
    """Use this to score options using the SQLite database and create a decision matrix."""
    return run_evaluator("system", research_data)

def get_support(context: str) -> str:
    """Use this to get an empathetic, encouraging message for the user."""
    return run_supporter("system", context)

def route_request(session_id: str, message: str, history: list) -> str:
    # Convert history into a single context string to pass to the agent
    history_context = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in history[-5:]])
    full_prompt = f"Recent History:\n{history_context}\n\nUSER'S LATEST MESSAGE:\n{message}"
    
    tools = [ask_interviewer, research_options, evaluate_options, get_support]
    tool_map = {
        "ask_interviewer": ask_interviewer,
        "research_options": research_options,
        "evaluate_options": evaluate_options,
        "get_support": get_support
    }
    
    return run_agent_with_tools(
        system_instruction=PRIMARY_PROMPT,
        message=full_prompt,
        tools=tools,
        tool_map=tool_map
    )
