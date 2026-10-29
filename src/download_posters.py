import os
import time
import pandas as pd
import requests
from PIL import Image
from io import BytesIO

# -----------------------------
# Paths
# -----------------------------
CSV_PATH = "dataset/mymoviedb.csv"
IMAGE_DIR = "dataset/images"
OUTPUT_CSV = "dataset/metadata.csv"
FAILED_CSV = "dataset/failed_downloads.csv"

os.makedirs(IMAGE_DIR, exist_ok=True)

# -----------------------------
# Load dataset
# -----------------------------
print("Loading dataset...")

df = pd.read_csv(
    CSV_PATH,
    engine="python"
)

# Remove rows without genre or poster
df = df.dropna(subset=["Genre", "Poster_Url"]).copy()

print(f"Movies available for download: {len(df)}")

# -----------------------------
# HTTP session
# -----------------------------
session = requests.Session()

session.headers.update({
    "User-Agent": "Mozilla/5.0"
})

# -----------------------------
# Download posters
# -----------------------------
metadata = []
failed = []

total = len(df)

for count, (_, row) in enumerate(df.iterrows(), start=1):

    title = str(row["Title"])
    url = str(row["Poster_Url"])

    filename = f"{count:05d}.jpg"
    filepath = os.path.join(IMAGE_DIR, filename)

    # Skip if already downloaded
    if os.path.exists(filepath):
        metadata.append({
            "image": filename,
            "Title": title,
            "Genre": row["Genre"],
            "Poster_Url": url
        })

        print(f"[{count}/{total}] Already exists: {title}")
        continue

    try:
        response = session.get(
            url,
            timeout=20
        )

        response.raise_for_status()

        # Verify that the downloaded file is actually an image
        image = Image.open(
            BytesIO(response.content)
        )

        # Convert to RGB
        image = image.convert("RGB")

        # Resize poster to a reasonable size
        image.thumbnail((600, 900))

        # Save as JPEG
        image.save(
            filepath,
            "JPEG",
            quality=90
        )

        metadata.append({
            "image": filename,
            "Title": title,
            "Genre": row["Genre"],
            "Poster_Url": url
        })

        print(f"[{count}/{total}] Downloaded: {title}")

    except Exception as e:

        failed.append({
            "Title": title,
            "Genre": row["Genre"],
            "Poster_Url": url,
            "Error": str(e)
        })

        print(
            f"[{count}/{total}] FAILED: {title} -> {e}"
        )

    # Small delay to avoid sending requests too quickly
    time.sleep(0.05)

# -----------------------------
# Save metadata
# -----------------------------
metadata_df = pd.DataFrame(metadata)

metadata_df.to_csv(
    OUTPUT_CSV,
    index=False
)

# -----------------------------
# Save failed downloads
# -----------------------------
failed_df = pd.DataFrame(failed)

failed_df.to_csv(
    FAILED_CSV,
    index=False
)

# -----------------------------
# Final report
# -----------------------------
print("\n" + "=" * 50)
print("DOWNLOAD COMPLETE")
print("=" * 50)

print(f"Total dataset rows:       {len(df)}")
print(f"Successfully downloaded:  {len(metadata_df)}")
print(f"Failed downloads:         {len(failed_df)}")

print("\nFiles created:")
print(f"Images:   {IMAGE_DIR}")
print(f"Metadata: {OUTPUT_CSV}")
print(f"Failures: {FAILED_CSV}")