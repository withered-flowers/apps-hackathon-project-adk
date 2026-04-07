# Decidely.ai Backend

Multi-agent decision support system backend built with Google ADK and FastAPI.

## Setup

```bash
uv venv --python=3.13
source .venv/bin/activate
uv sync
```

## Development

```bash
uv run uvicorn app.api.main:app --reload
```

## Testing

```bash
uv run pytest
```
