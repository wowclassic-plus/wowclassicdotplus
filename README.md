# WoW Classic Plus Project

A full-stack application with React frontend and FastAPI backend.

## Prerequisites

- Python 3.9+
- Node.js 18+ and npm

## Backend Setup

1. Navigate to the backend directory
2. Create a Python virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **macOS/Linux**: `source venv/bin/activate`
4. Install Python dependencies: `pip install -r requirements.txt`
5. Create a `.env` file in the backend directory with the environment variables below
6. Start the backend server: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

The backend will be available at: **http://localhost:8000**

## Frontend Setup

1. Navigate to the frontend directory
2. Install Node.js dependencies: `npm install`
3. Create a `.env` file in the frontend directory with the environment variables below
4. Start the development server: `npm start`

The frontend will be available at: **http://localhost:3000**

## Environment Variables

### Backend (.env)
Create this file in the `backend` directory:
1. DISCORD_CLIENT_ID=*See Discord for this
2. DISCORD_CLIENT_SECRET=*See Discord for this
3. DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback
4. DATABASE_URL=*See Discord for this


### Frontend (.env)
Create this file in the `frontend` directory:
1. REACT_APP_DISCORD_CLIENT_ID=*See Discord for this
2. REACT_APP_FRONTEND_REDIRECT=http://localhost:3000/auth/callback
3. REACT_APP_BACKEND_URL=http://127.0.0.1:8000

