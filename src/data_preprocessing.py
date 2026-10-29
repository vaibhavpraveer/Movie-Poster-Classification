"""
data_preprocessing.py
----------------------
Turns the cleaned CSV (produced by download_images.py) into:
    * a multi-hot encoded label matrix
    * reproducible train / validation / test splits (70/15/15) with no
      movie leaking across splits
    * tf.data.Dataset pipelines that load images from disk, resize,
      normalize (MobileNetV2 preprocessing) and, for training only,
      apply data augmentation.

This module is imported by train.py and evaluate.py; it can also be run
directly to sanity-check the pipeline end-to-end.
"""

import os
import sys
import json
import logging

import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def set_global_seeds(seed=config.RANDOM_SEED):
    """Make results reproducible across numpy / tensorflow / python."""
    import random
    random.seed(seed)
    np.random.seed(seed)
    tf.random.set_seed(seed)


def parse_genres(genre_string: str):
    """'Action, Adventure, Science Fiction' -> ['Action', 'Adventure', 'Science Fiction']"""
    if not isinstance(genre_string, str):
        return []
    return [g.strip() for g in genre_string.split(config.GENRE_SEPARATOR) if g.strip()]


def load_clean_dataframe(clean_csv_path=config.CLEAN_CSV_PATH):
    """Load the cleaned CSV produced by download_images.py, with validation."""
    if not os.path.exists(clean_csv_path):
        raise FileNotFoundError(
            f"{clean_csv_path} not found. Run `python src/download_images.py` first."
        )
    df = pd.read_csv(clean_csv_path)

    required = {config.COL_TITLE, config.COL_GENRE, "Local_Image_Path"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Clean CSV is missing columns: {missing}")

    # Guard against rows whose image file went missing after the CSV was written.
    exists_mask = df["Local_Image_Path"].apply(lambda p: isinstance(p, str) and os.path.exists(p))
    dropped = (~exists_mask).sum()
    if dropped:
        logger.warning(f"Dropping {dropped} rows whose image file is missing on disk.")
    df = df[exists_mask].reset_index(drop=True)

    if len(df) == 0:
        raise ValueError("No valid image rows remain after cleaning. Check the images directory.")

    return df


def build_multi_hot_labels(df: pd.DataFrame):
    """
    Returns:
        df with an added 'genre_list' column,
        label matrix (n_samples, n_classes) as float32,
        MultiLabelBinarizer fitted on the genres (holds the class order).
    """
    df = df.copy()
    df["genre_list"] = df[config.COL_GENRE].apply(parse_genres)
    df = df[df["genre_list"].apply(len) > 0].reset_index(drop=True)

    mlb = MultiLabelBinarizer()
    labels = mlb.fit_transform(df["genre_list"]).astype("float32")
    return df, labels, mlb


def split_dataset(df: pd.DataFrame, labels: np.ndarray, seed=config.RANDOM_SEED):
    """
    70/15/15 train/val/test split. Because each row in mymoviedb.csv is
    already a distinct movie (one poster per movie), splitting by row
    index is equivalent to splitting by movie -- no leakage.
    We still split on the unique 'Title' to be extra safe in case the
    same movie ever appears twice (e.g. re-releases).
    """
    unique_titles = df[config.COL_TITLE].drop_duplicates()
    train_titles, temp_titles = train_test_split(
        unique_titles, test_size=(1 - config.TRAIN_RATIO), random_state=seed
    )
    val_ratio_of_temp = config.VAL_RATIO / (config.VAL_RATIO + config.TEST_RATIO)
    val_titles, test_titles = train_test_split(
        temp_titles, test_size=(1 - val_ratio_of_temp), random_state=seed
    )

    train_mask = df[config.COL_TITLE].isin(train_titles)
    val_mask = df[config.COL_TITLE].isin(val_titles)
    test_mask = df[config.COL_TITLE].isin(test_titles)

    splits = {
        "train": (df[train_mask].reset_index(drop=True), labels[train_mask.values]),
        "val": (df[val_mask].reset_index(drop=True), labels[val_mask.values]),
        "test": (df[test_mask].reset_index(drop=True), labels[test_mask.values]),
    }

    logger.info(
        f"Split sizes -> train: {len(splits['train'][0])}, "
        f"val: {len(splits['val'][0])}, test: {len(splits['test'][0])}"
    )
    return splits


def _load_and_preprocess_image(path, label, augment=False):
    """Decode a JPEG from disk, resize to 224x224, apply MobileNetV2 preprocessing."""
    image = tf.io.read_file(path)
    image = tf.image.decode_jpeg(image, channels=3)
    image = tf.image.resize(image, config.IMG_SIZE)

    if augment:
        image = tf.image.random_flip_left_right(image)
        image = tf.image.random_brightness(image, max_delta=0.08)
        image = tf.image.random_contrast(image, lower=0.9, upper=1.1)
        # Small random rotation via padding + random crop approximates zoom/translation
        image = tf.image.resize_with_crop_or_pad(image, 244, 244)
        image = tf.image.random_crop(image, size=[224, 224, 3])

    image = tf.cast(image, tf.float32)
    image = tf.keras.applications.mobilenet_v2.preprocess_input(image)
    return image, label


def make_dataset(df: pd.DataFrame, labels: np.ndarray, batch_size=config.BATCH_SIZE,
                  augment=False, shuffle=False, seed=config.RANDOM_SEED):
    """Build a tf.data.Dataset of (image, multi_hot_label) pairs."""
    paths = df["Local_Image_Path"].values
    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    if shuffle:
        ds = ds.shuffle(buffer_size=len(df), seed=seed, reshuffle_each_iteration=True)

    ds = ds.map(
        lambda p, l: _load_and_preprocess_image(p, l, augment=augment),
        num_parallel_calls=tf.data.AUTOTUNE,
    )
    ds = ds.batch(batch_size)
    ds = ds.prefetch(tf.data.AUTOTUNE)
    return ds


def prepare_all(save_classes=True):
    """
    Convenience entry point used by train.py / evaluate.py:
    loads the CSV, builds labels, splits, and returns tf.data datasets
    plus the fitted MultiLabelBinarizer.
    """
    set_global_seeds()
    config.ensure_dirs()

    df = load_clean_dataframe()
    df, labels, mlb = build_multi_hot_labels(df)
    splits = split_dataset(df, labels)

    train_df, train_labels = splits["train"]
    val_df, val_labels = splits["val"]
    test_df, test_labels = splits["test"]

    train_ds = make_dataset(train_df, train_labels, augment=True, shuffle=True)
    val_ds = make_dataset(val_df, val_labels, augment=False, shuffle=False)
    test_ds = make_dataset(test_df, test_labels, augment=False, shuffle=False)

    if save_classes:
        with open(config.CLASSES_PATH, "w") as f:
            json.dump(list(mlb.classes_), f, indent=2)
        logger.info(f"Saved {len(mlb.classes_)} classes to {config.CLASSES_PATH}")

    return {
        "train_ds": train_ds, "val_ds": val_ds, "test_ds": test_ds,
        "train_df": train_df, "val_df": val_df, "test_df": test_df,
        "train_labels": train_labels, "val_labels": val_labels, "test_labels": test_labels,
        "classes": list(mlb.classes_),
        "mlb": mlb,
    }


if __name__ == "__main__":
    data = prepare_all()
    print(f"Classes ({len(data['classes'])}): {data['classes']}")
    for x, y in data["train_ds"].take(1):
        print("Batch image shape:", x.shape, "Batch label shape:", y.shape)
