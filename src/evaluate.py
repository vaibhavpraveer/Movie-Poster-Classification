"""
evaluate.py
-----------
Evaluates the trained model on the held-out test split and reports
metrics appropriate for MULTI-LABEL classification (plain "accuracy" is
misleading here, since it's rare for a model to get every single genre
in a set exactly right).

Reports:
    * Binary accuracy, precision, recall, F1 (micro & macro), AUC
    * Hamming loss
    * Per-genre precision/recall/F1
    * A handful of correct and incorrect qualitative examples

Usage:
    python src/evaluate.py
"""

import os
import sys
import json
import logging

import numpy as np
import tensorflow as tf
from sklearn.metrics import (
    precision_score, recall_score, f1_score, roc_auc_score,
    hamming_loss, classification_report,
)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config
from data_preprocessing import prepare_all, set_global_seeds

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def evaluate_model(model_path=config.MODEL_PATH, threshold=config.PREDICTION_THRESHOLD):
    set_global_seeds()

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found at {model_path}. Run `python src/train.py` first."
        )

    logger.info(f"Loading model from {model_path}")
    model = tf.keras.models.load_model(model_path)

    data = prepare_all(save_classes=False)
    test_ds, test_df, classes = data["test_ds"], data["test_df"], data["classes"]
    y_true = data["test_labels"]

    logger.info("Running inference on the test set...")
    y_prob = model.predict(test_ds, verbose=1)
    y_pred = (y_prob >= threshold).astype(int)

    metrics = {
        "threshold": threshold,
        "binary_accuracy": float(np.mean(y_true == y_pred)),
        "precision_micro": float(precision_score(y_true, y_pred, average="micro", zero_division=0)),
        "recall_micro": float(recall_score(y_true, y_pred, average="micro", zero_division=0)),
        "f1_micro": float(f1_score(y_true, y_pred, average="micro", zero_division=0)),
        "precision_macro": float(precision_score(y_true, y_pred, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(y_true, y_pred, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "hamming_loss": float(hamming_loss(y_true, y_pred)),
    }

    try:
        metrics["auc_macro"] = float(roc_auc_score(y_true, y_prob, average="macro"))
    except ValueError as e:
        logger.warning(f"Could not compute AUC (likely a class with only one label value): {e}")
        metrics["auc_macro"] = None

    logger.info("=== Overall test-set metrics ===")
    for k, v in metrics.items():
        logger.info(f"  {k}: {v}")

    # Per-genre report
    per_genre = classification_report(
        y_true, y_pred, target_names=classes, zero_division=0, output_dict=True
    )

    # Qualitative examples
    correct_examples, incorrect_examples = [], []
    for i in range(len(test_df)):
        actual = [classes[j] for j in range(len(classes)) if y_true[i, j] == 1]
        predicted = [classes[j] for j in range(len(classes)) if y_pred[i, j] == 1]
        record = {
            "title": test_df.iloc[i][config.COL_TITLE],
            "actual": actual,
            "predicted": predicted,
        }
        if set(actual) == set(predicted):
            correct_examples.append(record)
        else:
            incorrect_examples.append(record)

    print("\n--- Correct predictions (sample) ---")
    for ex in correct_examples[:5]:
        print(f"{ex['title']}\n  Actual:    {', '.join(ex['actual'])}\n  Predicted: {', '.join(ex['predicted'])}\n")

    print("\n--- Incorrect predictions (sample) ---")
    for ex in incorrect_examples[:5]:
        print(f"{ex['title']}\n  Actual:    {', '.join(ex['actual'])}\n  Predicted: {', '.join(ex['predicted'])}\n")

    report = {
        "overall_metrics": metrics,
        "per_genre_metrics": per_genre,
        "num_correct_exact_match": len(correct_examples),
        "num_incorrect_exact_match": len(incorrect_examples),
        "sample_correct": correct_examples[:10],
        "sample_incorrect": incorrect_examples[:10],
    }
    with open(config.EVAL_REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    logger.info(f"Full evaluation report saved to {config.EVAL_REPORT_PATH}")

    return report


if __name__ == "__main__":
    evaluate_model()
