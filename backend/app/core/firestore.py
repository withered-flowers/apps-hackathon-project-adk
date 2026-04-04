import os
from google.cloud import firestore

# Initialize Firestore client safely so the app doesn't crash on startup
# if the environment variables aren't set yet (e.g. local testing).
try:
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if project_id:
        db = firestore.Client(project=project_id)
    else:
        db = firestore.Client()
except Exception as e:
    print(f"CRITICAL: Firestore could not initialize. Missing credentials? Error: {e}")
    db = None

def save_session(session_id: str, messages: list):
    """Saves the chat transcript to Firestore."""
    if db is None:
        raise RuntimeError("Firestore is not initialized. Please set your GCP credentials.")
        
    doc_ref = db.collection("sessions").document(session_id)
    doc_ref.set({
        "messages": messages
    }, merge=True)

def save_decision_matrix(session_id: str, matrix_data: list):
    """Saves the structured JSON outcome to Firestore."""
    if db is None:
        raise RuntimeError("Firestore is not initialized. Please set your GCP credentials.")
        
    doc_ref = db.collection("decisions").document(session_id)
    doc_ref.set({
        "matrix": matrix_data
    }, merge=True)

def get_session_history(session_id: str) -> list:
    """Retrieves past messages from a session."""
    if db is None:
        # Don't crash on read, just return empty so the chat can still load and gracefully fail on send
        return []
        
    doc_ref = db.collection("sessions").document(session_id)
    doc = doc_ref.get()
    if doc.exists:
        return doc.to_dict().get("messages", [])
    return []
