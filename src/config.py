"""
config.py
---------
Central configuration for the Movie Genre Classification project.
Every script imports paths, hyperparameters, and constants from here so
that there is a single source of truth.
"""

import os

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset")
CSV_PATH = os.path.join(DATASET_DIR, "mymoviedb.csv")
IMAGES_DIR = os.path.join(DATASET_DIR, "images")
CLEAN_CSV_PATH = os.path.join(DATASET_DIR, "mymoviedb_clean.csv")  # after download step

MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "movie_genre_model.keras")
BEST_STAGE1_PATH = os.path.join(MODELS_DIR, "stage1_best.keras")
BEST_STAGE2_PATH = os.path.join(MODELS_DIR, "stage2_best.keras")
CLASSES_PATH = os.path.join(MODELS_DIR, "classes.json")
HISTORY_PATH = os.path.join(MODELS_DIR, "training_history.json")
EVAL_REPORT_PATH = os.path.join(MODELS_DIR, "evaluation_report.json")

REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")  # EDA / evaluation plots

# ---------------------------------------------------------------------------
# Image / data settings
# ---------------------------------------------------------------------------
IMG_SIZE = (224, 224)
IMG_CHANNELS = 3
BATCH_SIZE = 32

# CSV column names (kept as constants in case the schema changes)
COL_TITLE = "Title"
COL_GENRE = "Genre"
COL_POSTER_URL = "Poster_Url"
COL_OVERVIEW = "Overview"

GENRE_SEPARATOR = ","  # genres in the CSV are comma separated, e.g. "Action, Adventure"

# Split ratios (must sum to 1.0)
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------
RANDOM_SEED = 42

# ---------------------------------------------------------------------------
# Model / training hyperparameters
# ---------------------------------------------------------------------------
BACKBONE = "MobileNetV2"
DROPOUT_RATE = 0.3
DENSE_UNITS = 256

STAGE1_EPOCHS = 15
STAGE1_LR = 1e-3

STAGE2_EPOCHS = 10
STAGE2_LR = 1e-5
FINE_TUNE_AT_LAYER = 100  # unfreeze layers from this index onward (out of ~155 in MobileNetV2)

EARLY_STOPPING_PATIENCE = 4
REDUCE_LR_PATIENCE = 2
REDUCE_LR_FACTOR = 0.5

# ---------------------------------------------------------------------------
# Prediction settings
# ---------------------------------------------------------------------------
PREDICTION_THRESHOLD = 0.35
TOP_K_FALLBACK = 3  # if nothing crosses the threshold, show this many top genres

# ---------------------------------------------------------------------------
# Download settings
# ---------------------------------------------------------------------------
DOWNLOAD_TIMEOUT = 10  # seconds
DOWNLOAD_MAX_RETRIES = 2
DOWNLOAD_NUM_WORKERS = 16  # parallel poster downloads


def ensure_dirs():
    """Create all directories the project needs if they don't already exist."""
    for d in [DATASET_DIR, IMAGES_DIR, MODELS_DIR, REPORTS_DIR]:
        os.makedirs(d, exist_ok=True)
