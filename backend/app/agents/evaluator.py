from app.mcp.sqlite_client import sqlite_mcp
from .tool_loop import run_agent_with_tools

EVALUATOR_PROMPT = """You are the Evaluator & Analyst for Decidely.ai.
Your role is to compare the researched options against the user's exact criteria.
You MUST use the `execute_sqlite_query` tool to:
1. Create a "decision_matrix" table with columns like (option_name, pros, cons, score).
2. Insert the options and their specs into the table.
3. Select and return the final contents of the table.

Always format your final text response summarizing the scores after you have queried the database."""

def execute_sqlite_query(query: str) -> str:
    """Executes a SQL query on the local SQLite database and returns the result as JSON."""
    return sqlite_mcp.execute_query(query)

def run_evaluator(session_id: str, research_data: str) -> str:
    tools = [execute_sqlite_query]
    tool_map = {"execute_sqlite_query": execute_sqlite_query}
    
    return run_agent_with_tools(
        system_instruction=EVALUATOR_PROMPT,
        message=f"Here is the research data to evaluate: {research_data}",
        tools=tools,
        tool_map=tool_map
    )
