"""
Application configuration for Decidely.ai backend.

Backend selection:
- Set GOOGLE_GENAI_USE_VERTEXAI=true  → Vertex AI (uses ADC / gcloud credentials)
- Leave unset or false               → Gemini API (requires GEMINI_API_KEY)

google-genai and ADK read their configuration directly from os.environ, NOT from
Python variables. This module reads .env via pydantic-settings and then explicitly
propagates the correct env vars to os.environ before any agent is created.
"""
import os

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for Decidely.ai backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Backend selection ──────────────────────────────────────────────────────

    # Set to "true" / "1" / "yes" to use Vertex AI with ADC credentials.
    # Leave empty/unset to use the Gemini API with GEMINI_API_KEY instead.
    google_genai_use_vertexai: str = Field(
        default="", alias="GOOGLE_GENAI_USE_VERTEXAI"
    )

    # ── Google Cloud (Vertex AI) ───────────────────────────────────────────────

    google_cloud_project: str = Field(
        default="decidely-ai-dev", alias="GOOGLE_CLOUD_PROJECT"
    )
    google_cloud_location: str = Field(
        default="global", alias="GOOGLE_CLOUD_LOCATION"
    )

    # ── Gemini API (direct) ────────────────────────────────────────────────────

    # API key for Gemini API (ai.google.dev). Only used when Vertex AI is off.
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")

    # ── Model ─────────────────────────────────────────────────────────────────

    google_adk_model: str = Field(default="gemini-2.0-flash", alias="GOOGLE_ADK_MODEL")

    # ── App ───────────────────────────────────────────────────────────────────

    environment: str = Field(default="development", alias="ENVIRONMENT")

    # CORS stored as comma-separated string (pydantic-settings json.loads list[str])
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000",
        alias="CORS_ORIGINS",
    )

    sqlite_db_path: str = Field(default=":memory:", alias="SQLITE_DB_PATH")

    # ── Helpers ───────────────────────────────────────────────────────────────

    def get_cors_origins(self) -> list[str]:
        """Split the comma-separated CORS_ORIGINS string into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def use_vertexai(self) -> bool:
        """True when the user opted in to Vertex AI."""
        return self.google_genai_use_vertexai.lower() in ("true", "1", "yes")


settings = Settings()

# ── Propagate to os.environ ────────────────────────────────────────────────────
#
# google-genai / ADK read GOOGLE_GENAI_USE_VERTEXAI, GOOGLE_API_KEY, and
# GOOGLE_CLOUD_PROJECT directly from os.environ at client instantiation time.
# pydantic-settings does NOT write to os.environ, so we do it explicitly here.

if settings.use_vertexai:
    # Vertex AI path — ADK will use Application Default Credentials
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "true"
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", settings.google_cloud_project)
    os.environ.setdefault("GOOGLE_CLOUD_LOCATION", settings.google_cloud_location)
    # Make sure we don't accidentally send an API key at the same time
    os.environ.pop("GOOGLE_API_KEY", None)
else:
    # Gemini API path — requires an API key
    os.environ.pop("GOOGLE_GENAI_USE_VERTEXAI", None)
    if settings.gemini_api_key:
        os.environ["GOOGLE_API_KEY"] = settings.gemini_api_key
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", settings.google_cloud_project)
