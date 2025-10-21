import pdfplumber
import re
import pandas as pd
from fastapi import UploadFile
from app.utils.extract_rows import extract_rows_from_pdf

# Regex to extract UPI IDs (simplified, adjust if needed)
UPI_REGEX = r"[a-zA-Z0-9.\-_]+@[a-zA-Z]+"

async def extract_upi_summary(file: UploadFile):
    rows = extract_rows_from_pdf(file)

    if not rows:
        return {"error": "No tables found in PDF"}

    df = pd.DataFrame(rows)

    # Clean numeric fields
    df["Withdrawal"] = pd.to_numeric(
        df["Withdrawal"].astype(str).str.replace(",", ""), errors="coerce"
    ).fillna(0)

    df["Deposit"] = pd.to_numeric(
        df["Deposit"].astype(str).str.replace(",", ""), errors="coerce"
    ).fillna(0)

    # ✅ Extract last valid summary row
    last_row_debit = df.iloc[-4]
    last_row_credit = df.iloc[-3]

    total_debit_summary = last_row_debit.get("Withdrawal", 0)
    total_credit_summary = last_row_credit.get("Withdrawal", 0)

    # ✅ Extract UPI IDs
    df["UPI"] = df["Particulars"].apply(lambda x: re.findall(UPI_REGEX, str(x)) or [None])
    df["UPI"] = df["UPI"].apply(lambda ids: ids[0] if ids else None)

    # ✅ Group by UPI
    summary = df.groupby("UPI").agg(
        total_debited=("Withdrawal", "sum"),
        total_credited=("Deposit", "sum"),
        transactions=("Particulars", list)
    ).reset_index()

    result = {
        "upi_summary": summary.to_dict(orient="records"),
        "overall_totals": {
            "total_debited": total_debit_summary,
            "total_credited": total_credit_summary
        }
    }

    return result
