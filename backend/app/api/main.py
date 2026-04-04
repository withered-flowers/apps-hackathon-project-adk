"""FastAPI application factory for Decidely.ai backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.core.errors import DecidelyError, decidely_exception_handler


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Decidely.ai API",
        description="Multi-agent decision support system powered by Google ADK",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS — allow frontend dev server and production origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom error handler
    app.add_exception_handler(DecidelyError, decidely_exception_handler)  # type: ignore[arg-type]

    # API routes
    app.include_router(router, prefix="/api")

    @app.get("/health", tags=["Health"])
    async def health_check() -> dict[str, str]:
        """Health check endpoint for Cloud Run."""
        return {"status": "healthy", "service": "decidely-ai-backend"}

    return app


app = create_app()
