from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import ChatRequest, ChatResponse, HistoryResponse, MessageItem
from app.core.firestore import save_session, get_session_history, save_decision_matrix, db
from app.agents.primary import route_request
from app.mcp.sqlite_client import sqlite_mcp
import json

app = FastAPI(title="Decidely.ai API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def fetch_latest_matrix():
    """Helper to extract the matrix from SQLite after Evaluator runs."""
    try:
        result = sqlite_mcp.execute_query("SELECT * FROM decision_matrix;")
        data = json.loads(result)
        if isinstance(data, list) and len(data) > 0 and "status" not in data[0]:
            return data
    except Exception:
        pass
    return None

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Accepts user messages and session ID. Routes to the Orchestrator.
    """
    history = get_session_history(request.session_id) or []
    
    # 1. Run the Multi-Agent Engine
    response_text = route_request(request.session_id, request.message, history)
    
    # 2. Save history
    history.append({"role": "user", "content": request.message})
    history.append({"role": "system", "content": response_text})
    save_session(request.session_id, history)
    
    # 3. Check if Evaluator populated the SQLite decision_matrix
    matrix_data = fetch_latest_matrix()
    if matrix_data:
        save_decision_matrix(request.session_id, matrix_data)
    
    return ChatResponse(
        session_id=request.session_id,
        response=response_text,
        matrix=matrix_data
    )

@app.get("/api/history/{session_id}", response_model=HistoryResponse)
async def get_history(session_id: str):
    """
    Retrieves past decisions and matrices from Firestore.
    """
    history = get_session_history(session_id)
    
    if not history:
        history = [{"role": "system", "content": "Welcome to Decidely.ai! I am your Orchestrator. What decision are you struggling with today?"}]
        
    messages = [MessageItem(**msg) for msg in history]
    
    # Attempt to load saved matrix
    matrix_data = None
    if db:
        doc = db.collection("decisions").document(session_id).get()
        if doc.exists:
            matrix_data = doc.to_dict().get("matrix")
            
    return HistoryResponse(
        session_id=session_id,
        messages=messages,
        decision_matrix=matrix_data
    )
