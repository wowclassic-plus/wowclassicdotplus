#!/bin/bash

set -e

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed. Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

if [ ! -f .env ]; then
    cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/wowclassicdotplus
POSTGRES_PASSWORD=postgres
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
EOF
fi

docker-compose up -d postgres

echo "Waiting for PostgreSQL..."
until docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
done

uv sync
uv run python add_pins.py

echo "Setup complete. Start server with: uv run uvicorn app.main:app --reload"
