import os
from starlette.middleware.cors import CORSMiddleware
from fastapi import FastAPI

origins = os.getenv("ALLOWED_ORIGINS").split(",")

def add_middlewares(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
