from fastapi import FastAPI
from app.api.pdf_routes import router as pdf_router

app = FastAPI(title="PDF Processing API")

app.include_router(pdf_router, prefix="/pdf", tags=["PDF"])
