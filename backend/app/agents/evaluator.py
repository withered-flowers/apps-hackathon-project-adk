from app.mcp.sqlite_client import sqlite_mcp

EVALUATOR_PROMPT = """You are the Evaluator & Analyst for Decidely.ai.
Your role is to compare the researched options against the user's exact criteria.
Use the SQLite MCP tool to:
1. Create a "Decision Matrix" table.
2. Insert the options and their specs.
3. Score them based on the user's preferences.
Return the final structured pros/cons analysis."""

def run_evaluator(session_id: str, research_data: str) -> str:
    # TODO: Connect this to google-adk where the agent has access to `sqlite_mcp.execute_query` as a tool
    return "Evaluator created the matrix and scored the options successfully."
