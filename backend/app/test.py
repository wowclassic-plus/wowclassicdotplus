import requests

CLIENT_ID = "1425731842442526733"
CLIENT_SECRET = "z7FpwnFB_FSo2c3yjZmGBB3JpxhUde7V"
REDIRECT_URI = "https://classic-plus-site-frontend.onrender.com/auth/callback"
CODE = "Hbynp6bbLSjZBiXq2xsvAH84XxTRdt"

data = {
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "grant_type": "authorization_code",
    "code": CODE,
    "redirect_uri": REDIRECT_URI,
    "scope": "identify"
}

headers = {"Content-Type": "application/x-www-form-urlencoded"}

resp = requests.post("https://discord.com/api/oauth2/token", data=data, headers=headers)
print(resp.status_code)
print(resp.text)

# https://discord.com/oauth2/authorize?client_id=1425731842442526733&redirect_uri=https://classic-plus-site-frontend.onrender.com/auth/callback&response_type=code&scope=identify
