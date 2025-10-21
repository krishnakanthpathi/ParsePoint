import pdfplumber
import re
import pandas as pd
from fastapi import UploadFile
from app.utils.extract_rows import extract_rows_from_pdf  # you may need a custom version for SBI

# Regex for UPI IDs

UPI_REGEX = r"UPI/[A-Z]*/[0-9]*/[A-Z0-9]*"

async def extract_sbi_summary(file: UploadFile):
    # Extract rows from SBI PDF
    rows = extract_rows_from_pdf(file)

    if not rows:
        return {"error": "No tables found in PDF"}

    df = pd.DataFrame(rows)

    # Clean numeric fields
    df["Debit"] = pd.to_numeric(
        df["Debit"].astype(str).str.replace(",", ""), errors="coerce"
    ).fillna(0)

    df["Credit"] = pd.to_numeric(
        df["Credit"].astype(str).str.replace(",", ""), errors="coerce"
    ).fillna(0)

    # SBI statements do NOT have summary rows at the end
    # So calculate total manually
    total_debited = df["Debit"].sum()
    total_credited = df["Credit"].sum()

    # Extract UPI IDs
    df["UPI"] = df["Details"].apply(lambda x: re.findall(UPI_REGEX, str(x)) or [None])
    df["UPI"] = df["UPI"].apply(lambda ids: ids[0] if ids else None)

    # Group by UPI
    summary = df.groupby("UPI").agg(
        total_debited=("Debit", "sum"),
        total_credited=("Credit", "sum"),
        transactions=("Details", list)
    ).reset_index()

    result = {
        "upi_summary": summary.to_dict(orient="records"),
        "overall_totals": {
            "total_debited": total_debited,
            "total_credited": total_credited
        }
    }

    return result
import pdfplumber
import re
import pandas as pd
from fastapi import UploadFile
from app.utils.extract_rows import extract_rows_from_pdf  # you may need a custom version for SBI

# Regex for UPI IDs

UPI_REGEX = r"UPI/[A-Z]*/[0-9]*/[A-Z0-9]*"

async def extract_sbi_summary(file: UploadFile):
    # Extract rows from SBI PDF
    rows = extract_rows_from_pdf(file)

    if not rows:
        return {"error": "No tables found in PDF"}

    df = pd.DataFrame(rows)

    # Clean numeric fields
    df["Debit"] = pd.to_numeric(
        df["Debit"].astype(str).str.replace(",", ""), errors="coerce"
    ).fillna(0)

    df["Credit"] = pd.to_numeric(
        df["Credit"].astype(str).str.replace(",", ""), errors="coerce"
    ).fillna(0)

    # SBI statements do NOT have summary rows at the end
    # So calculate total manually
    total_debited = df["Debit"].sum()
    total_credited = df["Credit"].sum()

    # Extract UPI IDs
    df["UPI"] = df["Details"].apply(lambda x: re.findall(UPI_REGEX, str(x)) or [None])
    df["UPI"] = df["UPI"].apply(lambda ids: ids[0] if ids else None)

    # Group by UPI
    summary = df.groupby("UPI").agg(
        total_debited=("Debit", "sum"),
        total_credited=("Credit", "sum"),
        transactions=("Details", list)
    ).reset_index()

    result = {
        "upi_summary": summary.to_dict(orient="records"),
        "overall_totals": {
            "total_debited": total_debited,
            "total_credited": total_credited
        }
    }

    return result
