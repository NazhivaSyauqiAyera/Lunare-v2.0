from fastapi import FastAPI
from database import engine
from routes.auth import router as auth_router
from routes.periods import router as period_router
from fastapi.middleware.cors import CORSMiddleware

import models


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(period_router)

@app.get("/")
def home():
    return {
        "message": "Lunare API 🌙"
    }