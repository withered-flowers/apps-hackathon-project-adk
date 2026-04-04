from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import ChatRequest, ChatResponse, HistoryResponse, MessageItem
from app.core.firestore import save_session, get_session_history, save_decision_matrix

app = FastAPI(title="Decidely.ai API")

# Setup CORS for the Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Accepts user messages and session ID. Routes to the Orchestrator.
    (Currently returning mock data to test the connection)
    """
    mock_reply = f"Hello from Decidely.ai! You said: '{request.message}'. The Board of Directors is reviewing this..."
    
    # Mock saving to database
    history = get_session_history(request.session_id) or []
    history.append({"role": "user", "content": request.message})
    history.append({"role": "system", "content": mock_reply})
    save_session(request.session_id, history)
    
    return ChatResponse(
        session_id=request.session_id,
        response=mock_reply
    )

@app.get("/api/history/{session_id}", response_model=HistoryResponse)
async def get_history(session_id: str):
    """
    Retrieves past decisions from Firestore.
    """
    history = get_session_history(session_id)
    
    if not history:
        # Mock default history if empty
        history = [
            {"role": "system", "content": "Welcome to Decidely.ai! How can the Board of Directors help you today?"}
        ]
        
    messages = [MessageItem(**msg) for msg in history]
    
    return HistoryResponse(
        session_id=session_id,
        messages=messages
    )
