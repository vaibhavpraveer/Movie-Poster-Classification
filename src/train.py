"""
train.py
--------
Builds a MobileNetV2-based multi-label genre classifier and trains it in
two stages:

    Stage 1 (feature extraction): backbone frozen, only the new head is
             trained with a relatively large learning rate.
    Stage 2 (fine-tuning): the top part of the backbone is unfrozen and
             trained with a much smaller learning rate.

Why sigmoid + binary cross-entropy instead of softmax + categorical
cross-entropy?
    A movie poster can belong to several genres at once (e.g. an
    "Action, Adventure, Science Fiction" film). Softmax forces all class
    probabilities to sum to 1, which is only correct when classes are
    mutually exclusive. Sigmoid gives every genre its own independent
    probability in [0, 1], so the model can confidently predict "yes" for
    several genres at the same time. Binary cross-entropy is the natural
    loss for a set of independent binary (genre present / absent)
    decisions.

Usage:
    python src/train.py
"""

import os
import sys
import json
import logging

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config
from data_preprocessing import prepare_all, set_global_seeds

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)


def build_model(num_classes: int):
    """
    Input Image -> 224x224x3 -> MobileNetV2 (frozen) -> GlobalAveragePooling
    -> Dropout -> Dense -> Sigmoid -> genre probabilities
    """
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(*config.IMG_SIZE, config.IMG_CHANNELS),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # Stage 1: freeze the backbone

    inputs = layers.Input(shape=(*config.IMG_SIZE, config.IMG_CHANNELS))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(config.DROPOUT_RATE)(x)
    x = layers.Dense(config.DENSE_UNITS, activation="relu")(x)
    x = layers.Dropout(config.DROPOUT_RATE)(x)
    outputs = layers.Dense(num_classes, activation="sigmoid")(x)

    model = models.Model(inputs, outputs, name="movie_genre_mobilenetv2")
    return model, base_model


def compile_model(model, learning_rate):
    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate),
        loss="binary_crossentropy",
        metrics=[
            tf.keras.metrics.BinaryAccuracy(name="binary_accuracy"),
            tf.keras.metrics.Precision(name="precision"),
            tf.keras.metrics.Recall(name="recall"),
            tf.keras.metrics.AUC(name="auc", multi_label=True),
        ],
    )


def get_callbacks(checkpoint_path):
    return [
        callbacks.ModelCheckpoint(
            checkpoint_path, monitor="val_loss", save_best_only=True, verbose=1
        ),
        callbacks.EarlyStopping(
            monitor="val_loss", patience=config.EARLY_STOPPING_PATIENCE,
            restore_best_weights=True, verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss", factor=config.REDUCE_LR_FACTOR,
            patience=config.REDUCE_LR_PATIENCE, min_lr=1e-8, verbose=1
        ),
    ]


def main():
    set_global_seeds()
    config.ensure_dirs()

    logger.info("Preparing datasets...")
    data = prepare_all()
    train_ds, val_ds = data["train_ds"], data["val_ds"]
    num_classes = len(data["classes"])
    logger.info(f"Training on {num_classes} genre classes: {data['classes']}")

    model, base_model = build_model(num_classes)

    # ---------------- Stage 1: feature extraction ----------------
    logger.info("=== Stage 1: training classification head (backbone frozen) ===")
    compile_model(model, config.STAGE1_LR)
    model.summary(print_fn=logger.info)

    history_1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.STAGE1_EPOCHS,
        callbacks=get_callbacks(config.BEST_STAGE1_PATH),
    )

    # ---------------- Stage 2: fine-tuning ----------------
    logger.info("=== Stage 2: fine-tuning top layers of MobileNetV2 ===")
    base_model.trainable = True
    for layer in base_model.layers[:config.FINE_TUNE_AT_LAYER]:
        layer.trainable = False  # keep early (generic) layers frozen

    compile_model(model, config.STAGE2_LR)

    history_2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=config.STAGE2_EPOCHS,
        callbacks=get_callbacks(config.BEST_STAGE2_PATH),
    )

    # ---------------- Save final artifacts ----------------
    model.save(config.MODEL_PATH)
    logger.info(f"Final model saved to {config.MODEL_PATH}")

    full_history = {
        "stage1": {k: [float(v) for v in vals] for k, vals in history_1.history.items()},
        "stage2": {k: [float(v) for v in vals] for k, vals in history_2.history.items()},
    }
    with open(config.HISTORY_PATH, "w") as f:
        json.dump(full_history, f, indent=2)
    logger.info(f"Training history saved to {config.HISTORY_PATH}")


if __name__ == "__main__":
    main()
