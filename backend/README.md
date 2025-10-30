# WoW Classic Dot Plus - Backend

FastAPI backend with PostgreSQL.

## Quick Start

Prerequisites: Docker, Docker Compose, Python 3.11+, [uv](https://docs.astral.sh/uv/getting-started/installation/)

### Automated Setup

```bash
./setup.sh
```

### Manual Setup

```bash
cp env.example .env
docker-compose up -d postgres
uv sync
uv run python add_pins.py
```

### Run Development Server

```bash
# With Docker Compose (database + app)
docker-compose up

# Or just the FastAPI app (requires postgres to be running)
uv run uvicorn app.main:app --reload
```

Seed data: Run `python add_pins.py` to add 100 sample pins.

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PASSWORD` - Database password (default: postgres)
- `DISCORD_CLIENT_ID` - Discord OAuth client ID (optional)
- `DISCORD_CLIENT_SECRET` - Discord OAuth secret (optional)
- `DISCORD_REDIRECT_URI` - OAuth redirect URI (optional)

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Reset database (deletes all data)
docker-compose down -v

# Access PostgreSQL shell
docker-compose exec postgres psql -U postgres -d wowclassicdotplus

# Seed database
uv run python add_pins.py

# Install new dependencies
uv add package-name

```