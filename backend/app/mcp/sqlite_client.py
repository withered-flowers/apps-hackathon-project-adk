import sqlite3
import json
import os
from typing import Optional

class SQLiteMCPClient:
    """
    A simulated MCP Client for SQLite.
    Provides tools for the AI agents to structure and query decision matrices.
    """
    # Use /tmp for the database path so it works in Google Cloud Run's read-only filesystem!
    def __init__(self, db_path: str = "/tmp/decisions.db"):
        self.db_path = db_path

    def execute_query(self, query: str, parameters: tuple = ()) -> str:
        """Executes a SQL query and returns the result as a JSON string."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(query, parameters)
                
                if query.strip().upper().startswith("SELECT"):
                    rows = cursor.fetchall()
                    return json.dumps([dict(row) for row in rows])
                else:
                    conn.commit()
                    return json.dumps({"status": "success", "rows_affected": cursor.rowcount})
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

    def list_tables(self) -> str:
        """Helper tool to let the AI see what tables already exist."""
        query = "SELECT name FROM sqlite_master WHERE type='table';"
        return self.execute_query(query)

# Initialize a global MCP client
sqlite_mcp = SQLiteMCPClient()
