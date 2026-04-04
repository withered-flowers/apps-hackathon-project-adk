"""
Model Context Protocol (MCP) integrations.
Provides structured tool access for the AI agents to interface with external systems.
"""
from .sqlite_client import SQLiteMCPClient, sqlite_mcp

__all__ = ["SQLiteMCPClient", "sqlite_mcp"]
