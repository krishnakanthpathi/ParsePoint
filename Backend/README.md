


    PrasePoint/
    │
    ├── app/
    │   ├── main.py                # FastAPI entry point
    │   ├── config.py              # Settings & environment variables
    │   ├── api/                   # Routes / endpoints
    │   │   ├── __init__.py
    │   │   └── pdf_routes.py      # Endpoints for PDF processing
    │   │
    │   ├── services/              # Business logic / reusable modules
    │   │   ├── __init__.py
    │   │   └── pdf_service.py     # Logic using pdfplumber
    │   │
    │   ├── models/                # Pydantic models / schemas
    │   │   ├── __init__.py
    │   │   └── pdf_models.py
    │   │
    │   ├── utils/                 # Helpers, validation, logging, etc.
    │   │   ├── __init__.py
    │   │   └── file_utils.py
    │   │
    │   ├── static/                # If storing uploaded files temporarily
    │   │   └── uploads/
    │   │
    │   ├── templates/             # Only if using Jinja2 (optional)
    │   │
    │   └── __init__.py
    │
    ├── tests/                    # Unit and integration tests
    │   └── test_pdf.py
    │
    ├── requirements.txt / pyproject.toml
    ├── README.md
    └── .env (optional)
