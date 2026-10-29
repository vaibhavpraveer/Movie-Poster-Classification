"""
api_server.py
-------------
Production-ready FastAPI REST API backend for FRAME//AI Movie Poster Classification.
Wraps the trained MobileNetV2 TensorFlow multi-label model with CORS support,
real-time inference, model health, architecture intelligence, and sample poster endpoints.
"""

import os
import sys
import time
import json
import logging
from typing import Optional, List
import pandas as pd
from PIL import Image, UnidentifiedImageError

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# Add src to python path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT_DIR, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

import config
from predict import get_predictor

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("frame_ai_api")

app = FastAPI(
    title="FRAME//AI API",
    description="Cinematic Movie Poster Genre Classification API powered by Deep Learning",
    version="1.0.0",
)

# Enable CORS for local dev and preview ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy/cached predictor instance
_predictor = None

def get_model():
    global _predictor
    if _predictor is None:
        logger.info("Initializing GenrePredictor...")
        _predictor = get_predictor()
    return _predictor


@app.get("/api/health")
def health_check():
    """Health check endpoint providing live connection status."""
    try:
        model = get_model()
        num_classes = len(model.classes) if hasattr(model, "classes") else 0
        return {
            "status": "online",
            "model_ready": True,
            "backbone": config.BACKBONE,
            "classes_count": num_classes,
            "default_threshold": config.PREDICTION_THRESHOLD,
            "timestamp": time.time(),
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "degraded",
                "model_ready": False,
                "error": str(e),
                "timestamp": time.time(),
            },
        )


@app.get("/api/model-info")
def get_model_info():
    """Returns technical details and evaluation statistics from the trained model."""
    try:
        model = get_model()
        classes = model.classes
    except Exception:
        classes = []

    # Read training history if available
    history = {}
    if os.path.exists(config.HISTORY_PATH):
        try:
            with open(config.HISTORY_PATH, "r") as f:
                history = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read history: {e}")

    # Read dataset sample count if metadata exists
    dataset_stats = {
        "total_cataloged": None,
        "clean_posters_count": None,
    }
    if os.path.exists(config.CLEAN_CSV_PATH):
        try:
            df = pd.read_csv(config.CLEAN_CSV_PATH)
            dataset_stats["clean_posters_count"] = len(df)
        except Exception:
            pass

    return {
        "product_name": "FRAME//AI",
        "tagline": "Every poster tells a story. Our AI reads it.",
        "architecture": {
            "backbone": config.BACKBONE,
            "input_resolution": f"{config.IMG_SIZE[0]}x{config.IMG_SIZE[1]}x{config.IMG_CHANNELS}",
            "classification_head": f"GlobalAvgPool2D -> Dense({config.DENSE_UNITS}, ReLU) -> Dropout({config.DROPOUT_RATE}) -> Dense({len(classes)}, Sigmoid)",
            "loss_function": "Binary Crossentropy (Multi-Label)",
            "optimizer": "Adam (Two-stage fine-tuning)",
            "prediction_threshold": config.PREDICTION_THRESHOLD,
            "top_k_fallback": config.TOP_K_FALLBACK,
        },
        "classes": classes,
        "classes_count": len(classes),
        "history": history,
        "dataset": dataset_stats,
    }


@app.get("/api/samples")
def get_samples(limit: int = 12):
    """
    Returns curated sample posters from the local dataset metadata.
    Includes title, actual genres, and local URL.
    """
    samples = []
    metadata_path = os.path.join(config.DATASET_DIR, "metadata.csv")
    
    if os.path.exists(metadata_path):
        try:
            df = pd.read_csv(metadata_path)
            # Find rows whose image file actually exists in images dir
            valid_rows = []
            for _, row in df.iterrows():
                img_name = str(row.get("image", "")).strip()
                img_path = os.path.join(config.IMAGES_DIR, img_name)
                if os.path.exists(img_path):
                    valid_rows.append(row)
                if len(valid_rows) >= limit:
                    break

            for r in valid_rows:
                img_file = str(r["image"]).strip()
                samples.append({
                    "id": img_file,
                    "title": str(r.get("Title", "Untitled Movie")),
                    "official_genres": [g.strip() for g in str(r.get("Genre", "")).split(",") if g.strip()],
                    "image_url": f"/api/sample-image/{img_file}",
                    "poster_url": str(r.get("Poster_Url", "")),
                })
        except Exception as e:
            logger.error(f"Error reading sample metadata: {e}")

    # Fallback to scanning dataset/images directly if metadata empty
    if not samples and os.path.exists(config.IMAGES_DIR):
        files = [f for f in os.listdir(config.IMAGES_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png"))][:limit]
        for f in files:
            samples.append({
                "id": f,
                "title": f"Sample Frame #{f.split('.')[0]}",
                "official_genres": ["Cinema Archive"],
                "image_url": f"/api/sample-image/{f}",
            })

    return {"samples": samples, "count": len(samples)}


@app.get("/api/sample-image/{filename}")
def get_sample_image(filename: str):
    """Serves sample image files safely from the dataset directory."""
    # Prevent directory traversal
    clean_name = os.path.basename(filename)
    img_path = os.path.join(config.IMAGES_DIR, clean_name)
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Sample image not found")
    return FileResponse(img_path, media_type="image/jpeg")


def _format_prediction_result(raw_result: dict, elapsed_ms: float, threshold: float):
    top_g = raw_result.get("top_genre")
    top_genre_obj = None
    if top_g:
        top_genre_obj = {
            "genre": top_g[0],
            "confidence": round(float(top_g[1]), 4),
            "percentage": f"{top_g[1] * 100:.1f}%",
        }

    predicted_genres = [
        {
            "genre": g,
            "confidence": round(float(p), 4),
            "percentage": f"{p * 100:.1f}%",
        }
        for g, p in raw_result.get("predicted_genres", [])
    ]

    all_predictions = [
        {
            "genre": g,
            "confidence": round(float(p), 4),
            "percentage": f"{p * 100:.1f}%",
        }
        for g, p in raw_result.get("all_predictions", [])
    ]

    return {
        "success": True,
        "top_genre": top_genre_obj,
        "predicted_genres": predicted_genres,
        "all_predictions": all_predictions,
        "used_fallback": raw_result.get("used_fallback", False),
        "threshold_used": threshold,
        "inference_time_ms": round(elapsed_ms, 2),
    }


@app.post("/api/predict")
async def predict_poster(
    file: UploadFile = File(...),
    threshold: Optional[float] = Form(config.PREDICTION_THRESHOLD),
):
    """
    Accepts an uploaded image file (JPG, PNG, WebP) and performs real model inference.
    Returns ranked genre probabilities and confidence scores.
    """
    if threshold is None or threshold <= 0 or threshold > 1:
        threshold = config.PREDICTION_THRESHOLD

    # Verify content type
    if file.content_type and not (
        file.content_type.startswith("image/") or file.content_type in ["application/octet-stream"]
    ):
        raise HTTPException(status_code=400, detail="Uploaded file is not a supported image format.")

    try:
        model = get_model()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI Model is unavailable: {e}")

    try:
        # Load image via PIL
        image = Image.open(file.file)
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="The file uploaded is not a valid or readable image.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read image: {e}")

    # Run inference
    start_time = time.perf_counter()
    try:
        result = model.predict(image, threshold=threshold)
    except Exception as e:
        logger.error(f"Inference error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
    elapsed_ms = (time.perf_counter() - start_time) * 1000

    return _format_prediction_result(result, elapsed_ms, threshold)


class PredictSampleRequest(BaseModel):
    filename: str
    threshold: Optional[float] = config.PREDICTION_THRESHOLD


@app.post("/api/predict-sample")
def predict_sample(payload: PredictSampleRequest):
    """
    Runs model inference on one of the existing sample posters without re-uploading bytes.
    """
    clean_name = os.path.basename(payload.filename)
    img_path = os.path.join(config.IMAGES_DIR, clean_name)
    if not os.path.exists(img_path):
        raise HTTPException(status_code=404, detail="Sample image not found on server")

    threshold = payload.threshold if payload.threshold and 0 < payload.threshold <= 1 else config.PREDICTION_THRESHOLD

    try:
        model = get_model()
        image = Image.open(img_path)
        image.load()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sample image: {e}")

    start_time = time.perf_counter()
    try:
        result = model.predict(image, threshold=threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
    elapsed_ms = (time.perf_counter() - start_time) * 1000

    return _format_prediction_result(result, elapsed_ms, threshold)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server:app", host="127.0.0.1", port=8000, reload=False)
