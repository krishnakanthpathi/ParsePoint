from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.pdf_routes import router as pdf_router

app = FastAPI(title="PDF Processing API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf_router, prefix="/pdf", tags=["PDF"])
