import sqlite3
import json

class SQLiteMCPClient:
    def __init__(self, db_path: str = "decisions.db"):
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

# Initialize a global mock MCP client
sqlite_mcp = SQLiteMCPClient()
