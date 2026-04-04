"""
Google Drive MCP client for exporting decision reports.

Uses the @modelcontextprotocol/server-gdrive MCP server to create
documents in the user's Google Drive.
"""
from __future__ import annotations

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from app.core.logging import get_logger

logger = get_logger("mcp.drive")

_SERVER_PARAMS = StdioServerParameters(
    command="npx",
    args=["-y", "@modelcontextprotocol/server-gdrive"],
    env=None,
)


async def create_document(title: str, content: str) -> str:
    """
    Create a new Google Doc with the given title and content.

    Returns the URL of the created document.
    Raises MCPError if the Drive server is unavailable.
    """
    async with stdio_client(_SERVER_PARAMS) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            result = await session.call_tool(
                "gdrive_create_file",
                {
                    "name": title,
                    "content": content,
                    "mimeType": "application/vnd.google-apps.document",
                },
            )

            # Extract file URL from result
            raw = result.content[0].text if result.content else "{}"
            import json

            data = json.loads(raw) if raw else {}
            url = data.get("webViewLink", data.get("url", ""))

            logger.info("Google Drive document created: title=%s url=%s", title, url)
            return url
