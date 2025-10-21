from fastapi import APIRouter, UploadFile, File

from app.services.pdf_service import extract_text_from_pdf
from app.services.pdf_service import extract_tables_from_pdf
from app.services.banks.union_bank import extract_upi_summary
from app.services.banks.sbi_bank import extract_sbi_summary

router = APIRouter()

@router.get("/")
async def read_root():
    return {"Hello :)": "PDF Parsing API is up and running."}

@router.post("/extract_text")
async def extract_pdf_text(file: UploadFile = File(...)):
    return await extract_text_from_pdf(file)

@router.post("/extract_tables")
async def extract_pdf_tables(file: UploadFile = File(...)):
    return await extract_tables_from_pdf(file)

@router.post("/extract_upi_summary")
async def extract_upi_data(file: UploadFile = File(...)):
    return await extract_upi_summary(file)

@router.post("/extract_sbi_summary")
async def extract_upi_data(file: UploadFile = File(...)):
    return await extract_sbi_summary(file)

