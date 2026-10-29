"""
eda.py
------
Exploratory Data Analysis for the movie poster dataset.

Run AFTER download_images.py has produced dataset/mymoviedb_clean.csv.

Produces:
    reports/genre_distribution.png
    reports/genres_per_movie.png
    reports/sample_posters.png
and prints a text summary to stdout.

Usage:
    python src/eda.py
"""

import os
import sys
import json
from collections import Counter

import pandas as pd
import matplotlib
matplotlib.use("Agg")  # safe for headless environments
import matplotlib.pyplot as plt
from PIL import Image

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import config
from data_preprocessing import parse_genres, load_clean_dataframe


def run_eda():
    config.ensure_dirs()

    raw_df = pd.read_csv(config.CSV_PATH, lineterminator="\n")
    print(f"Total movies in raw CSV: {len(raw_df)}")
    print("\nMissing values per column (raw CSV):")
    print(raw_df.isna().sum())

    clean_df = load_clean_dataframe()
    print(f"\nMovies with a successfully downloaded poster: {len(clean_df)}")

    clean_df["genre_list"] = clean_df[config.COL_GENRE].apply(parse_genres)

    all_genres = [g for lst in clean_df["genre_list"] for g in lst]
    genre_counts = Counter(all_genres)
    print(f"\nNumber of unique genres: {len(genre_counts)}")

    top10 = genre_counts.most_common(10)
    print("\nTop 10 most common genres:")
    for g, c in top10:
        print(f"  {g:<18} {c}")

    multi_genre_count = (clean_df["genre_list"].apply(len) > 1).sum()
    print(f"\nMovies with more than one genre: {multi_genre_count} "
          f"({multi_genre_count / len(clean_df):.1%})")

    # ---- Plot 1: genre distribution (all genres) ----
    genres_sorted = sorted(genre_counts.items(), key=lambda x: -x[1])
    labels, counts = zip(*genres_sorted)
    plt.figure(figsize=(10, 6))
    plt.barh(labels[::-1], counts[::-1], color="#4C72B0")
    plt.xlabel("Number of movies")
    plt.title("Genre Distribution")
    plt.tight_layout()
    plt.savefig(os.path.join(config.REPORTS_DIR, "genre_distribution.png"), dpi=150)
    plt.close()

    # ---- Plot 2: number of genres per movie ----
    n_genres_per_movie = clean_df["genre_list"].apply(len)
    plt.figure(figsize=(6, 4))
    n_genres_per_movie.value_counts().sort_index().plot(kind="bar", color="#DD8452")
    plt.xlabel("Number of genres")
    plt.ylabel("Number of movies")
    plt.title("Genres per Movie")
    plt.tight_layout()
    plt.savefig(os.path.join(config.REPORTS_DIR, "genres_per_movie.png"), dpi=150)
    plt.close()

    # ---- Plot 3: sample posters with labels ----
    sample = clean_df.sample(min(9, len(clean_df)), random_state=config.RANDOM_SEED)
    fig, axes = plt.subplots(3, 3, figsize=(12, 14))
    for ax, (_, row) in zip(axes.flatten(), sample.iterrows()):
        try:
            img = Image.open(row["Local_Image_Path"])
            ax.imshow(img)
        except Exception:
            ax.text(0.5, 0.5, "image error", ha="center")
        ax.set_title(f"{row[config.COL_TITLE][:25]}\n{', '.join(row['genre_list'][:3])}", fontsize=9)
        ax.axis("off")
        print(f"Movie: {row[config.COL_TITLE]}\nGenres: {', '.join(row['genre_list'])}\nImage: {row['Local_Image_Path']}\n")
    plt.tight_layout()
    plt.savefig(os.path.join(config.REPORTS_DIR, "sample_posters.png"), dpi=150)
    plt.close()

    summary = {
        "total_movies_raw": int(len(raw_df)),
        "downloaded_posters": int(len(clean_df)),
        "unique_genres": int(len(genre_counts)),
        "top_10_genres": top10,
        "movies_with_multiple_genres": int(multi_genre_count),
    }
    with open(os.path.join(config.REPORTS_DIR, "eda_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nPlots saved to {config.REPORTS_DIR}/")
    return summary


if __name__ == "__main__":
    run_eda()
