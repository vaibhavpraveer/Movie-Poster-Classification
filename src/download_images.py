"""
download_images.py
-------------------
Downloads movie poster images referenced by the `Poster_Url` column of
mymoviedb.csv, saves them locally, and produces a cleaned CSV
(`mymoviedb_clean.csv`) that only contains rows whose poster was
successfully downloaded.

Design goals:
    * Never let a single broken/slow URL crash the whole run.
    * Be resumable: images already on disk are not re-downloaded.
    * Run downloads in parallel for speed, but keep the code readable.

Usage:
    python src/download_images.py
"""

import os
import sys
import json
import hashlib
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd
import requests
from PIL import Image, UnidentifiedImageError

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger(__name__)


def safe_filename(title: str, url: str) -> str:
    """
    Build a filesystem-safe, unique filename for a poster.
    We hash the URL to guarantee uniqueness even if two titles collide.
    """
    url_hash = hashlib.md5(url.encode("utf-8")).hexdigest()[:10]
    clean_title = "".join(c if c.isalnum() or c in " _-" else "_" for c in str(title))
    clean_title = clean_title.strip().replace(" ", "_")[:60]
    if not clean_title:
        clean_title = "untitled"
    return f"{clean_title}_{url_hash}.jpg"


def download_single_image(row, images_dir):
    """
    Download one poster. Returns a dict describing the outcome so the
    caller can build a report without raising exceptions.
    """
    idx, title, url = row
    result = {"index": idx, "title": title, "url": url, "status": "failed", "path": None, "error": None}

    if not isinstance(url, str) or not url.strip():
        result["error"] = "empty_url"
        return result

    filename = safe_filename(title, url)
    filepath = os.path.join(images_dir, filename)

    # Resume support: skip already-downloaded, valid images.
    if os.path.exists(filepath):
        try:
            with Image.open(filepath) as img:
                img.verify()
            result["status"] = "already_exists"
            result["path"] = filepath
            return result
        except Exception:
            # Corrupted leftover file -- remove and re-download.
            os.remove(filepath)

    attempts = 0
    while attempts <= config.DOWNLOAD_MAX_RETRIES:
        attempts += 1
        try:
            response = requests.get(url, timeout=config.DOWNLOAD_TIMEOUT)
            response.raise_for_status()

            # Validate that the bytes are actually a readable image before saving.
            from io import BytesIO
            img = Image.open(BytesIO(response.content))
            img.verify()  # raises if corrupted

            # Re-open (verify() invalidates the file handle) and normalize to RGB JPEG.
            img = Image.open(BytesIO(response.content)).convert("RGB")
            img.save(filepath, format="JPEG", quality=90)

            result["status"] = "downloaded"
            result["path"] = filepath
            return result

        except (requests.RequestException, UnidentifiedImageError, OSError) as e:
            result["error"] = f"{type(e).__name__}: {e}"
            continue  # retry

    return result


def download_all_posters(csv_path=config.CSV_PATH, images_dir=config.IMAGES_DIR,
                          max_workers=config.DOWNLOAD_NUM_WORKERS, limit=None):
    """
    Reads the raw CSV, downloads every poster in parallel, and writes:
        * dataset/images/*.jpg           (downloaded posters)
        * dataset/mymoviedb_clean.csv    (rows with a valid local image path)
        * dataset/download_report.json   (summary of successes / failures)
    """
    config.ensure_dirs()

    if not os.path.exists(csv_path):
        logger.error(f"CSV file not found at {csv_path}. Aborting.")
        raise FileNotFoundError(f"CSV file not found at {csv_path}")

    df = pd.read_csv(csv_path, lineterminator="\n")

    required_cols = {config.COL_TITLE, config.COL_GENRE, config.COL_POSTER_URL}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    before = len(df)
    df = df.dropna(subset=[config.COL_POSTER_URL, config.COL_GENRE])
    df = df[df[config.COL_POSTER_URL].astype(str).str.strip() != ""]
    df = df[df[config.COL_GENRE].astype(str).str.strip() != ""]
    logger.info(f"Dropped {before - len(df)} rows with missing Poster_Url/Genre "
                f"({len(df)} rows remain).")

    if limit:
        df = df.head(limit)

    rows = list(zip(df.index, df[config.COL_TITLE], df[config.COL_POSTER_URL]))

    results = []
    logger.info(f"Downloading {len(rows)} posters with {max_workers} workers...")
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(download_single_image, r, images_dir): r for r in rows}
        for i, future in enumerate(as_completed(futures), 1):
            res = future.result()
            results.append(res)
            if i % 200 == 0 or i == len(rows):
                logger.info(f"  Progress: {i}/{len(rows)}")

    results_df = pd.DataFrame(results).set_index("index")
    df = df.join(results_df[["status", "path", "error"]])

    ok_mask = df["status"].isin(["downloaded", "already_exists"])
    clean_df = df[ok_mask].copy()
    clean_df = clean_df.rename(columns={"path": "Local_Image_Path"})
    clean_df = clean_df.drop(columns=["status", "error"])

    # Drop exact duplicate images (same file hash appearing twice, e.g. reused poster art)
    def file_hash(p):
        try:
            with open(p, "rb") as f:
                return hashlib.md5(f.read()).hexdigest()
        except Exception:
            return None

    clean_df["_img_hash"] = clean_df["Local_Image_Path"].apply(file_hash)
    dup_count = clean_df["_img_hash"].duplicated().sum()
    clean_df = clean_df.drop_duplicates(subset="_img_hash", keep="first").drop(columns=["_img_hash"])
    logger.info(f"Removed {dup_count} duplicate poster images.")

    clean_df.to_csv(config.CLEAN_CSV_PATH, index=False)

    summary = {
        "total_rows_considered": len(df),
        "downloaded": int((df["status"] == "downloaded").sum()),
        "already_existed": int((df["status"] == "already_exists").sum()),
        "failed": int((df["status"] == "failed").sum()),
        "duplicates_removed": int(dup_count),
        "final_clean_rows": len(clean_df),
    }
    with open(os.path.join(config.DATASET_DIR, "download_report.json"), "w") as f:
        json.dump(summary, f, indent=2)

    logger.info(f"Download summary: {summary}")
    logger.info(f"Clean CSV saved to {config.CLEAN_CSV_PATH}")
    return clean_df, summary


if __name__ == "__main__":
    download_all_posters()
