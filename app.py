"""
app.py
------
Streamlit web application for the Movie Genre Classification project.

Run with:
    streamlit run app.py
"""

import os
import sys

import streamlit as st
from PIL import Image, UnidentifiedImageError

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "src"))
import config
from predict import get_predictor

st.set_page_config(page_title="Movie Genre Classification", page_icon="🎬", layout="centered")

st.title("🎬 Movie Genre Classification")
st.write(
    "Upload a movie poster and this app will predict its genre(s) using a "
    "MobileNetV2 model fine-tuned for **multi-label** poster classification "
    "(a poster can belong to more than one genre)."
)

# ---------------------------------------------------------------------------
# Load model (cached so it only happens once per session)
# ---------------------------------------------------------------------------
@st.cache_resource(show_spinner="Loading model...")
def load_predictor():
    return get_predictor()


model_ready = True
predictor = None
try:
    predictor = load_predictor()
except FileNotFoundError as e:
    model_ready = False
    st.error(
        "The trained model could not be found.\n\n"
        f"Details: {e}\n\n"
        "Please run the training pipeline first:\n"
        "```bash\n"
        "python src/download_images.py\n"
        "python src/train.py\n"
        "```"
    )

# ---------------------------------------------------------------------------
# Sidebar controls
# ---------------------------------------------------------------------------
st.sidebar.header("Settings")
threshold = st.sidebar.slider(
    "Prediction threshold",
    min_value=0.05, max_value=0.90, value=config.PREDICTION_THRESHOLD, step=0.05,
    help="A genre is reported as predicted if its probability is at or above this value.",
)
top_n_display = st.sidebar.slider("Number of genres to display", 3, 10, 5)

# ---------------------------------------------------------------------------
# Upload section
# ---------------------------------------------------------------------------
st.header("Upload a movie poster")
uploaded_file = st.file_uploader(
    "Choose an image file", type=["jpg", "jpeg", "png"], disabled=not model_ready
)

if uploaded_file is not None and model_ready:
    try:
        image = Image.open(uploaded_file)
        image.load()
    except UnidentifiedImageError:
        st.error("This file doesn't look like a valid image. Please upload a JPG, JPEG, or PNG.")
        st.stop()
    except Exception as e:
        st.error(f"Could not open the uploaded file: {e}")
        st.stop()

    col1, col2 = st.columns([1, 1.3])

    with col1:
        st.subheader("Uploaded Movie Poster")
        st.image(image, use_container_width=True)

    with st.spinner("Running model..."):
        try:
            result = predictor.predict(image, threshold=threshold)
        except Exception as e:
            st.error(f"Prediction failed: {e}")
            st.stop()

    with col2:
        st.subheader("Prediction")

        top_genre, top_prob = result["top_genre"]
        st.markdown(f"🎬 **Top Genre:** {top_genre}")
        st.markdown(f"**Confidence:** {top_prob * 100:.1f}%")
        st.progress(min(max(top_prob, 0.0), 1.0))

        if result["used_fallback"]:
            st.caption(
                "No genre crossed the threshold, so the top 3 most likely "
                "genres are shown instead."
            )

        st.markdown("**Other likely genres:**")
        for genre, prob in result["all_predictions"][1:top_n_display]:
            st.write(f"{genre}")
            st.progress(min(max(prob, 0.0), 1.0), text=f"{prob * 100:.1f}%")

    st.divider()
    st.subheader("All genre probabilities")
    chart_data = {genre: prob for genre, prob in result["all_predictions"]}
    st.bar_chart(chart_data)

else:
    if model_ready:
        st.info("Upload a JPG, JPEG, or PNG movie poster to get started.")

st.divider()
st.caption(
    "This model was trained on movie **poster images** (not video frames/scenes), "
    "so predictions reflect visual cues typical of poster artwork -- color palette, "
    "typography, composition, depicted characters/objects -- rather than actual footage."
)
