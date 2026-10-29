"""
predict.py
----------
Loads the trained model + class list and exposes:

    predict_movie_genre(image_path_or_pil_image, threshold=0.35)

which returns a sorted list of (genre, probability) tuples, and applies
the "if nothing crosses the threshold, fall back to top-3" rule.

Can be run directly:
    python src/predict.py path/to/poster.jpg
"""

import os
import sys
import json
import logging

import numpy as np
from PIL import Image, UnidentifiedImageError
import tensorflow as tf

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

SUPPORTED_FORMATS = {"JPEG", "PNG", "MPO"}  # PIL format names; covers jpg/jpeg/png uploads


class GenrePredictor:
    """Wraps the trained model + class list so it only has to be loaded once."""

    def __init__(self, model_path=config.MODEL_PATH, classes_path=config.CLASSES_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. "
                f"Train the model first with `python src/train.py`."
            )
        if not os.path.exists(classes_path):
            raise FileNotFoundError(
                f"Classes file not found at {classes_path}. "
                f"It is created automatically during training."
            )

        logger.info(f"Loading model from {model_path}")
        self.model = tf.keras.models.load_model(model_path)

        with open(classes_path) as f:
            self.classes = json.load(f)
        logger.info(f"Loaded {len(self.classes)} genre classes: {self.classes}")

    def _load_image(self, image):
        """Accepts a filesystem path OR an already-open PIL.Image (e.g. from Streamlit's uploader)."""
        if isinstance(image, (str, os.PathLike)):
            if not os.path.exists(image):
                raise FileNotFoundError(f"Image file not found: {image}")
            try:
                img = Image.open(image)
                img.load()
            except UnidentifiedImageError:
                raise ValueError(f"File is not a valid/supported image: {image}")
        elif isinstance(image, Image.Image):
            img = image
        else:
            raise TypeError("image must be a file path or a PIL.Image.Image instance")

        img = img.convert("RGB")               # step 2: convert to RGB
        img = img.resize(config.IMG_SIZE)       # step 3: resize to 224x224
        return img

    def predict(self, image, threshold=config.PREDICTION_THRESHOLD, top_k_fallback=config.TOP_K_FALLBACK):
        """
        Returns:
            {
              "all_predictions": [(genre, prob), ...] sorted descending,
              "predicted_genres": [(genre, prob), ...] above threshold
                                   (or top-k fallback if none crossed it),
              "top_genre": (genre, prob) or None,
              "used_fallback": bool
            }
        """
        img = self._load_image(image)
        arr = np.array(img, dtype=np.float32)
        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)  # step 4: same preprocessing as training
        arr = np.expand_dims(arr, axis=0)

        probs = self.model.predict(arr, verbose=0)[0]  # step 5-6: forward pass -> probabilities

        ranked = sorted(zip(self.classes, probs.tolist()), key=lambda x: x[1], reverse=True)  # step 7

        above_threshold = [(g, p) for g, p in ranked if p >= threshold]
        used_fallback = False
        if above_threshold:
            predicted_genres = above_threshold
        else:
            predicted_genres = ranked[:top_k_fallback]
            used_fallback = True

        return {
            "all_predictions": ranked,
            "predicted_genres": predicted_genres,
            "top_genre": ranked[0] if ranked else None,
            "used_fallback": used_fallback,
        }


_predictor_singleton = None


def get_predictor():
    """Lazily instantiate a single shared GenrePredictor (used by app.py)."""
    global _predictor_singleton
    if _predictor_singleton is None:
        _predictor_singleton = GenrePredictor()
    return _predictor_singleton


def predict_movie_genre(image_path, threshold=config.PREDICTION_THRESHOLD):
    """Standalone convenience function matching the spec's requested signature."""
    predictor = get_predictor()
    return predictor.predict(image_path, threshold=threshold)


def _print_results(result):
    print("\nPrediction Results")
    print("-" * 40)
    for genre, prob in result["all_predictions"][:5]:
        print(f"{genre:<18} {prob * 100:5.1f}%")
    if result["top_genre"]:
        print(f"\nTop Genre:\n{result['top_genre'][0]}")
    if result["used_fallback"]:
        print("\n(No genre crossed the threshold; showing top-3 fallback.)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python src/predict.py <path_to_poster_image>")
        sys.exit(1)

    image_path = sys.argv[1]
    try:
        result = predict_movie_genre(image_path)
        _print_results(result)
    except (FileNotFoundError, ValueError, TypeError) as e:
        print(f"Error: {e}")
        sys.exit(1)
