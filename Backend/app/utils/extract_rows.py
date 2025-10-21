import pdfplumber

def extract_rows_from_pdf(file):
    rows = []

    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            table = page.extract_table()
            if table:
                headers = [h.strip() for h in table[0]]
                for row in table[1:]:
                    row_dict = dict(zip(headers, row))
                    rows.append(row_dict)
    return rows