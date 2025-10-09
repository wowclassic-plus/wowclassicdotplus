# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import requests
import os

router = APIRouter(prefix="/auth/discord", tags=["auth"])

# Load from environment variables
CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

if not CLIENT_ID or not CLIENT_SECRET or not REDIRECT_URI:
    raise RuntimeError(
        "Missing DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, or REDIRECT_URI environment variable"
    )

@router.get("/callback")
def discord_callback(code: str):
    """
    Exchange the OAuth2 code for an access token, then fetch Discord user info.
    """
    print("=== Discord Callback Triggered ===")
    print("Received code:", code)

    # Token request
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

    print("Sending token request to Discord...")
    token_resp = requests.post(token_url, data=data, headers=headers)
    print("Token response status:", token_resp.status_code)
    print("Token response body:", token_resp.text)

    if token_resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get token from Discord: {token_resp.json()}"
        )

    access_token = token_resp.json().get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token returned by Discord")

    # Fetch user info
    user_resp = requests.get(
        "https://discord.com/api/users/@me",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    print("User info response status:", user_resp.status_code)
    print("User info response body:", user_resp.text)

    if user_resp.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to get user info from Discord: {user_resp.json()}"
        )

    user_data = user_resp.json()
    print("User data fetched:", user_data)

    return JSONResponse(content=user_data)
