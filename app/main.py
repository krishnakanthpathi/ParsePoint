from fastapi import FastAPI


app = FastAPI(title="PDF Processing API")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the PDF Processing API!"}
