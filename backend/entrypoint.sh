#!/bin/bash
set -e

# Optional: Generate new migration (not usually done in prod)
# Comment out in real prod environment
# uv run alembic revision --autogenerate -m "migration in prod"

# Run Alembic migrations
echo "Running Alembic migrations..."
uv run alembic history
uv run alembic current -v
uv run alembic upgrade head

# Start the FastAPI app
echo "Starting FastAPI with Gunicorn..."
exec uv run gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
