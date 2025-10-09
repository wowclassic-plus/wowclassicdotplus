from fastapi import FastAPI
from app.routers import items, survey, pins, admin, auth
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

app = FastAPI()  # only once!

# Correct CORS setup
origins = [
    "https://classic-plus-site-frontend.onrender.com",  # remove the trailing slash
    "http://localhost:3000",  # optional for local dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router)
app.include_router(survey.router)
app.include_router(pins.router)
app.include_router(admin.router)
app.include_router(auth.router) 


@app.get("/")
def root():
    return {"message": "Hello from FastAPI"}