import os
from google.cloud import firestore

# Initialize Async Firestore client safely
try:
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if project_id:
        db = firestore.AsyncClient(project=project_id)
    else:
        db = firestore.AsyncClient()
except Exception as e:
    print(f"CRITICAL: Firestore could not initialize. Missing credentials? Error: {e}")
    db = None

async def save_session(session_id: str, messages: list):
    """Saves the chat transcript to Firestore."""
    if db is None:
        raise RuntimeError("Firestore is not initialized. Please set your GCP credentials.")
        
    doc_ref = db.collection("sessions").document(session_id)
    await doc_ref.set({
        "messages": messages
    }, merge=True)

async def save_decision_matrix(session_id: str, matrix_data: list):
    """Saves the structured JSON outcome to Firestore."""
    if db is None:
        raise RuntimeError("Firestore is not initialized. Please set your GCP credentials.")
        
    doc_ref = db.collection("decisions").document(session_id)
    await doc_ref.set({
        "matrix": matrix_data
    }, merge=True)

async def get_session_history(session_id: str) -> list:
    """Retrieves past messages from a session."""
    if db is None:
        return []
        
    doc_ref = db.collection("sessions").document(session_id)
    doc = await doc_ref.get()
    if doc.exists:
        return doc.to_dict().get("messages", [])
    return []
