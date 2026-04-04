from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    status: str = "success"
    matrix: Optional[List[Dict[str, Any]]] = None

class MessageItem(BaseModel):
    role: str
    content: str

class HistoryResponse(BaseModel):
    session_id: str
    messages: List[MessageItem]
    decision_matrix: Optional[List[Dict[str, Any]]] = None
