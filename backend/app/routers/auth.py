# app/routers/auth.py
from fastapi import APIRouter, HTTPException
import requests
import os

router = APIRouter(prefix="/auth/discord")

# app/routers/auth.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import requests
import os

router = APIRouter(prefix="/auth/discord", tags=["auth"])

# ⚠️ Do NOT hardcode secrets in code; use environment variables
CLIENT_ID = "1425731842442526733"
CLIENT_SECRET = os.environ.get("z7FpwnFB_FSo2c3yjZmGBB3JpxhUde7V")
REDIRECT_URI = "http://localhost:3000/auth/callback"


@router.get("/callback")
def discord_callback(code: str):
    """
    Exchange the OAuth2 code for an access token, then fetch the Discord user info.
    Returns the user object as JSON.
    """
    # Exchange code for access token
    token_url = "https://discord.com/api/oauth2/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "scope": "identify",
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    token_resp = requests.post(token_url, data=data, headers=headers)
    if token_resp.status_code != 200:
        raise HTTPException(
            status_code=400, detail=f"Failed to get token from Discord: {token_resp.text}"
        )

    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token returned by Discord")

    # Fetch user info
    user_resp = requests.get(
        "https://discord.com/api/users/@me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if user_resp.status_code != 200:
        raise HTTPException(
            status_code=400, detail=f"Failed to get user info from Discord: {user_resp.text}"
        )

    user_data = user_resp.json()
    return JSONResponse(content=user_data)
