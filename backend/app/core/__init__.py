"""
Core Application Settings & Integrations.
Handles GenAI client setup, model constants, and Google Cloud Firestore connections.
"""
from .config import client, MODEL_NAME
from .firestore import db, save_session, save_decision_matrix, get_session_history

__all__ = [
    "client",
    "MODEL_NAME",
    "db",
    "save_session",
    "save_decision_matrix",
    "get_session_history"
]
