import os
from google.cloud import firestore

# Initialize Firestore client. It will automatically look for GOOGLE_APPLICATION_CREDENTIALS
# in the environment variables, or use the default project credentials on GCP.
try:
    db = firestore.Client()
except Exception as e:
    print(f"Warning: Could not initialize Firestore client. {e}")
    db = None

def save_session(session_id: str, messages: list):
    """Saves the chat transcript to Firestore."""
    if not db:
        print(f"Mock: Saving session {session_id}")
        return
    
    doc_ref = db.collection("sessions").document(session_id)
    doc_ref.set({
        "messages": messages
    }, merge=True)

def save_decision_matrix(session_id: str, matrix_data: dict):
    """Saves the structured JSON outcome to Firestore."""
    if not db:
        print(f"Mock: Saving decision matrix {session_id}")
        return

    doc_ref = db.collection("decisions").document(session_id)
    doc_ref.set({
        "matrix": matrix_data
    }, merge=True)

def get_session_history(session_id: str) -> list:
    """Retrieves past messages from a session."""
    if not db:
        return []
    
    doc_ref = db.collection("sessions").document(session_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get("messages", [])
    return []
