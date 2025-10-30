# app/routers/auth.py
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth/discord", tags=["auth"])

# Load environment variables
CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")

# Discord OAuth is optional - only enable if all required env vars are set
DISCORD_OAUTH_ENABLED = bool(CLIENT_ID and CLIENT_SECRET and REDIRECT_URI)

if DISCORD_OAUTH_ENABLED:
    @router.get("/callback")
    def discord_callback(code: str = Query(..., description="OAuth2 code from Discord")):
        """
        Exchange the OAuth2 code for an access token, then fetch Discord user info.
        """
        if not code:
            raise HTTPException(status_code=400, detail="Missing OAuth code")

        # Step 1: Exchange code for access token
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
            # Discord returns 400 for invalid or expired code
            return JSONResponse(
                status_code=400,
                content={"error": "invalid_grant", "details": token_resp.json()}
            )

        access_token = token_resp.json().get("access_token")
        if not access_token:
            return JSONResponse(
                status_code=400,
                content={"error": "no_access_token", "details": token_resp.json()}
            )

        # Step 2: Fetch user info
        user_resp = requests.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if user_resp.status_code != 200:
            return JSONResponse(
                status_code=400,
                content={"error": "failed_user_info", "details": user_resp.json()}
            )

        user_data = user_resp.json()

        return JSONResponse(content=user_data)
else:
    @router.get("/callback")
    def discord_callback_disabled():
        """
        Discord OAuth is not configured.
        """
        return JSONResponse(
            status_code=503,
            content={"error": "Discord OAuth is not configured"}
        )
