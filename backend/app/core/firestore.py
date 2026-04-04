import os
from google.cloud import firestore

# Initialize Firestore client strictly. It relies on GOOGLE_APPLICATION_CREDENTIALS
# or the default project credentials on GCP (like Cloud Run).
db = firestore.Client()

def save_session(session_id: str, messages: list):
    """Saves the chat transcript to Firestore."""
    doc_ref = db.collection("sessions").document(session_id)
    doc_ref.set({
        "messages": messages
    }, merge=True)

def save_decision_matrix(session_id: str, matrix_data: dict):
    """Saves the structured JSON outcome to Firestore."""
    doc_ref = db.collection("decisions").document(session_id)
    doc_ref.set({
        "matrix": matrix_data
    }, merge=True)

def get_session_history(session_id: str) -> list:
    """Retrieves past messages from a session."""
    doc_ref = db.collection("sessions").document(session_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get("messages", [])
    return []
