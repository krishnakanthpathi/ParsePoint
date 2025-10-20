import pdfplumber
from fastapi import UploadFile

async def extract_text_from_pdf(file: UploadFile):
    content = ""
    
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            content += page.extract_text() or ""
            
    return {"text": content.strip()}

async def extract_tables_from_pdf(file: UploadFile):
    tables = []
    
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            page_tables = page.extract_tables()
            for table in page_tables:
                tables.append(table)
                
    return {"tables": tables}



