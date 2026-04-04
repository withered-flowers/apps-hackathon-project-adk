# Use the official lightweight Python image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Install uv installer directly
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Create a virtual environment with uv and update PATH
ENV VIRTUAL_ENV=/opt/venv
RUN uv venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Install the application dependencies directly using uv pip
# (Since we didn't setup a pyproject.toml earlier to save time, we install manually)
RUN uv pip install fastapi uvicorn google-cloud-firestore pydantic mcp google-adk

# Copy the local code to the container's workspace
COPY app/ ./app/

# Expose the port Cloud Run expects
EXPOSE 8080

# Command to run on container start
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
