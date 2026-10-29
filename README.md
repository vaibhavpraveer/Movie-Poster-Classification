# Movie Genre Classification Using Deep Learning

A complete, end-to-end deep learning project that predicts a movie's genre(s)
**from its poster image** using transfer learning with MobileNetV2.

---

## Problem Statement

Movie posters carry strong visual cues about genre — color palette, typography,
composition, depicted characters and objects — even before you read a
synopsis. This project builds a model that looks at a poster image and
predicts which genre(s) it likely belongs to.

Because a real movie almost always belongs to **more than one genre**
(e.g. "Action, Adventure, Science Fiction"), this is framed as a
**multi-label image classification problem**, not a single-label one.

## Objective

Given a movie poster image as input, output a set of predicted genres, each
with an independent confidence score:

```
Action       92.4%
Adventure    86.1%
Science Fiction 74.8%

Top Predicted Genre: Action
```

## Dataset

`dataset/mymoviedb.csv` contains ~9,800 movies scraped from TMDB, with columns:

| Column               | Description                                   |
|----------------------|------------------------------------------------|
| `Title`              | Movie title                                    |
| `Overview`           | Text synopsis (not used as model input)        |
| `Genre`              | Comma-separated genre list, e.g. "Action, Drama" |
| `Poster_Url`         | Full URL to the poster image on TMDB           |
| `Popularity`         | Not used as model input                        |
| `Vote_Count`         | Not used as model input                        |
| `Vote_Average`       | Not used as model input                        |
| `Original_Language`  | Not used as model input                        |

Only `Poster_Url` (as the image input) and `Genre` (as the label) are used
by the model — title, overview, popularity, and other metadata are
deliberately excluded so that predictions are based purely on the poster
artwork.

The raw CSV has no missing values, but `download_images.py` still
defensively drops any row missing a poster URL or genre, since real-world
scrapes can be incomplete.

## Technologies

- **Python** — project language
- **TensorFlow / Keras** — model definition, training, inference
- **MobileNetV2** (ImageNet-pretrained) — convolutional backbone via transfer learning
- **Pandas / NumPy** — data wrangling
- **Scikit-learn** — label encoding, train/val/test splitting, evaluation metrics
- **Matplotlib** — exploratory data analysis plots
- **Pillow / Requests** — image downloading, validation, and preprocessing
- **Streamlit** — interactive web application for predictions

## Architecture

```
Input Image
     ↓
224 × 224 × 3
     ↓
MobileNetV2 (ImageNet weights, include_top=False)
     ↓
GlobalAveragePooling2D
     ↓
Dropout
     ↓
Dense(256, relu)
     ↓
Dropout
     ↓
Dense(num_genres, activation="sigmoid")
     ↓
Independent genre probabilities
```

### Why sigmoid instead of softmax?

Softmax forces every class probability to sum to 1 — appropriate when
classes are mutually exclusive (a photo is *either* a cat *or* a dog).
A movie poster is different: it can simultaneously be Action **and**
Adventure **and** Science Fiction. Sigmoid gives every genre its own
independent probability in `[0, 1]`, and the model is trained with
**binary cross-entropy**, which is the correct loss for a set of
independent binary (genre present / absent) decisions — one per genre.

## Dataset Preparation

`src/download_images.py`:
1. Loads `mymoviedb.csv` and drops rows missing `Poster_Url` or `Genre`.
2. Downloads each poster in parallel (thread pool), with retries and a
   timeout, so a single slow or broken URL cannot stall the run.
3. Validates every downloaded file is actually a decodable image before
   saving it (corrupted downloads are discarded).
4. Normalizes every poster to RGB JPEG on disk.
5. Removes duplicate images (identical file hash — the same artwork
   reused for a different listing).
6. Writes `dataset/mymoviedb_clean.csv` (only rows with a valid local
   image) and `dataset/download_report.json` (a summary of the run).

`src/data_preprocessing.py`:
1. Parses the `Genre` string into a list, e.g. `"Action, Drama"` → `["Action", "Drama"]`.
2. Multi-hot encodes genres with `sklearn.preprocessing.MultiLabelBinarizer`
   (e.g. `[1, 0, 1, 0, ...]`), and saves the class order to `models/classes.json`.
3. Splits the data **70% / 15% / 15%** into train / validation / test by
   unique movie title with a fixed random seed (`42`), so the same movie
   can never appear in two different splits.
4. Builds `tf.data.Dataset` pipelines that read each image from disk,
   resize to 224×224, and apply `mobilenet_v2.preprocess_input`
   normalization. Training data additionally gets light augmentation
   (horizontal flip, small brightness/contrast jitter, small random
   crop-based zoom/translation) — validation and test data are never
   augmented.

## Training

Two-stage transfer learning (`src/train.py`):

**Stage 1 — Feature extraction.** The MobileNetV2 backbone is frozen; only
the new head (`GlobalAveragePooling2D → Dropout → Dense → Dropout → Dense`)
is trained, with Adam at `lr=1e-3`. `EarlyStopping`, `ModelCheckpoint`, and
`ReduceLROnPlateau` all monitor validation loss.

**Stage 2 — Fine-tuning.** The top portion of MobileNetV2 (layers from
index `FINE_TUNE_AT_LAYER` onward — see `src/config.py`) is unfrozen and
trained jointly with the head, using a much smaller learning rate
(`lr=1e-5`) so the pretrained ImageNet features aren't destroyed. The same
callbacks apply, and the best checkpoint (by validation loss) is kept.

The final model is saved to `models/movie_genre_model.keras`, and the
ordered genre list is saved to `models/classes.json`. The Streamlit app
loads these files directly — it never retrains on startup.

## Evaluation

Since this is multi-label, plain "accuracy" (exact match across every
genre) is a harsh and misleading headline metric. `src/evaluate.py` instead
reports, on the held-out test split:

- Binary accuracy (per-label, averaged)
- Precision / Recall / F1 — both **micro** (pooled across all label
  decisions) and **macro** (averaged per genre, treating rare genres
  equally with common ones)
- AUC (macro)
- Hamming loss (fraction of individual genre labels that are wrong)
- A full per-genre precision/recall/F1 breakdown
- Sample correct and incorrect predictions, e.g.:

  ```
  Actual: Action, Adventure        Actual: Horror
  Predicted: Action, Adventure     Predicted: Thriller, Mystery
  ```

Results are written to `models/evaluation_report.json`.

## How to Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Download poster images referenced in mymoviedb.csv
python src/download_images.py

# 3. (Optional) Explore the data
python src/eda.py

# 4. Train the model (two-stage transfer learning)
python src/train.py

# 5. Evaluate on the held-out test set
python src/evaluate.py

# 6. Launch the web app
streamlit run app.py
```

> **Note:** step 2 requires outbound internet access to `image.tmdb.org`,
> and step 4 benefits greatly from a GPU. If you're running in an offline
> or CPU-only sandbox, these steps must be run in an environment that has
> both internet access and (ideally) a GPU.

## Prediction

```python
from src.predict import predict_movie_genre

result = predict_movie_genre("path/to/poster.jpg", threshold=0.35)
print(result["top_genre"])          # ('Action', 0.924)
print(result["predicted_genres"])   # [('Action', 0.924), ('Adventure', 0.861), ...]
```

`predict_movie_genre`:
1. Loads the image (path or `PIL.Image`)
2. Converts to RGB
3. Resizes to 224×224
4. Applies the same MobileNetV2 preprocessing used in training
5. Runs a forward pass through the trained model
6. Sorts genres by probability
7. Returns every genre at or above `threshold` — or, if none cross it,
   the top 3 genres as a fallback

In the Streamlit app, upload a poster and you'll see the top genre, its
confidence, a progress bar per likely genre, and a full bar chart of every
genre's probability.

## Project Structure

```
movie-genre-classification/
│
├── dataset/
│   ├── mymoviedb.csv              # raw input data (provided)
│   ├── mymoviedb_clean.csv        # generated by download_images.py
│   └── images/                    # downloaded posters (generated)
│
├── models/
│   ├── movie_genre_model.keras    # generated by train.py
│   ├── classes.json               # generated by train.py
│   ├── training_history.json      # generated by train.py
│   └── evaluation_report.json     # generated by evaluate.py
│
├── reports/                       # EDA plots, generated by eda.py
│
├── notebooks/
│   └── movie_genre_classification.ipynb
│
├── src/
│   ├── config.py                  # all paths & hyperparameters
│   ├── data_preprocessing.py      # labels, splitting, tf.data pipelines
│   ├── download_images.py         # poster downloading
│   ├── eda.py                     # exploratory data analysis
│   ├── train.py                   # model + two-stage training
│   ├── evaluate.py                # multi-label evaluation metrics
│   └── predict.py                 # prediction function used by app.py
│
├── app.py                         # Streamlit application
├── requirements.txt
├── README.md
└── .gitignore
```

## Reproducibility

`src/data_preprocessing.py::set_global_seeds()` seeds Python's `random`,
NumPy, and TensorFlow with `RANDOM_SEED = 42` (see `src/config.py`), and
this is called at the start of every entry point (`train.py`,
`evaluate.py`, `data_preprocessing.py`). The train/val/test split is
seeded the same way, so re-running the pipeline reproduces the same splits.

Primary library versions are pinned in `requirements.txt`.

## Poster Classification vs. Scene Classification

This project is a **Movie Poster → Genre** classifier: it was trained
exclusively on poster artwork downloaded from `Poster_Url`. It has **not**
seen any actual movie footage/scenes, and its predictions should be
understood as "what genre does this poster's artwork suggest," not "what
genre is this scene from."

A **Movie Scene → Genre** classifier is a related but different task —
predicting genre from video frames/screenshots rather than promotional
poster art — and would require a different dataset (labeled frames or
video clips). The same architecture (MobileNetV2 backbone + sigmoid multi-
label head) could be reused for that task; only the data pipeline
(`download_images.py` / `data_preprocessing.py`) would need to be swapped
to source and load scene frames instead of posters.

## Future Improvements

- Swap the backbone for **ResNet50**, **EfficientNet**, or a **Vision
  Transformer (ViT)** and compare.
- Train on a larger poster dataset (more movies, more balanced genre
  coverage — genres like Documentary/Western/War are rare here).
- Extend to **scene/frame classification** using sampled video frames.
- Add **OCR-based title recognition** to cross-reference poster text.
- Build a **hybrid image + metadata model** that combines the poster with
  the overview text, cast, or release year for stronger predictions.

---

## Error Handling Summary

This project is designed so that no single bad input can crash a whole
run:

| Situation | Handling |
|---|---|
| Missing CSV file | `FileNotFoundError` raised with a clear message at load time |
| Missing required columns | `ValueError` listing exactly which columns are missing |
| Missing genre / poster URL per row | Row is dropped during cleaning, run continues |
| Invalid / dead poster URL | Retried, then marked `failed` in the download report; run continues |
| Corrupted image bytes | Detected via `PIL.Image.verify()`, file discarded, run continues |
| Duplicate poster images | De-duplicated by file hash after download |
| Empty dataset after cleaning | `ValueError` raised with a clear message before training starts |
| Model file not found | `FileNotFoundError` with instructions to run `train.py`, shown in both CLI and the Streamlit UI |
| Invalid uploaded image (Streamlit) | Caught and shown as a friendly on-screen error, app keeps running |
| Unsupported image format | `st.file_uploader` restricts to jpg/jpeg/png; unreadable files raise a caught, user-facing error |
