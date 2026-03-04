# ===================================================================
# Dockerfile — AI Monitor Python API
# Single-stage build for maximum reliability on Railway.
# ===================================================================

FROM python:3.12-slim

# Logs appear immediately in Railway (no buffering)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY apps/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/api/src/ ./src/

# Railway injects PORT at runtime; default to 8000 for local docker
EXPOSE 8000

# Health check for local docker run (Railway uses its own from railway.toml)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# Default CMD — Railway's startCommand in railway.toml overrides this
CMD ["sh", "-c", "python -m uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
