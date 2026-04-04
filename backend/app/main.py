from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat_router

app = FastAPI(title="Decidely.ai API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the API routes
app.include_router(chat_router, prefix="/api")
