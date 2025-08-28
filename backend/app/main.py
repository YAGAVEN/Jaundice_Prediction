from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil, os, uuid
from model import predict_jaundice

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://jaundice-prediction.vercel.app"],  # Replace with your frontend URL in production
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_FOLDER = os.path.join(os.path.dirname(__file__), "temp_uploads")
os.makedirs(TEMP_FOLDER, exist_ok=True)

@app.post("/predict")
async def predict(face: UploadFile = File(...), eye: UploadFile = File(...)):
    # Temporary file paths
    eye_path = os.path.join(TEMP_FOLDER, f"{uuid.uuid4()}_{eye.filename}")
    face_path = os.path.join(TEMP_FOLDER, f"{uuid.uuid4()}_{face.filename}")

    # Save files temporarily
    with open(eye_path, "wb") as f:
        shutil.copyfileobj(eye.file, f)
    with open(face_path, "wb") as f:
        shutil.copyfileobj(face.file, f)

    try:
        # Run model prediction
        result = predict_jaundice(face_path, eye_path)
    finally:
        # Delete temporary files
        os.remove(eye_path)
        os.remove(face_path)

    return result
