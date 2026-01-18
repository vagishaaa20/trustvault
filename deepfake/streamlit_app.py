import streamlit as st
import cv2
import numpy as np
import psycopg2
import tempfile
import os
import sys
from PIL import Image
from PIL.ExifTags import TAGS
import json

def extract_video_metadata(video_path):
    """Extract metadata from video file"""
    cap = cv2.VideoCapture(video_path)
    
    metadata = {
        'total_frames': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        'fps': cap.get(cv2.CAP_PROP_FPS),
        'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        'duration_seconds': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) / cap.get(cv2.CAP_PROP_FPS) if cap.get(cv2.CAP_PROP_FPS) > 0 else 0
    }
    
    cap.release()
    return metadata
# ---------------- DB UPDATE FUNCTION ---------------- #

def update_deepfake_result(case_id, evidence_id, avg_probability, prediction,video_metadata=None, geolocation=None):
    conn = psycopg2.connect(
        host="localhost",
        database="postgres",
        user="postgres",
        password="vvss",
        port=5432
    )
    cur = conn.cursor()

    cur.execute("""
        UPDATE evidence_metadata
        SET
            avg_probability = %s,
            prediction = %s,
            deepfake_analyzed_at = NOW(),
            total_frames = %s,
            fps = %s,
            video_width = %s,
            video_height = %s,
            duration_seconds = %s,
            latitude = %s,
            longitude = %s,
            location_name = %s
        WHERE case_id = %s
          AND evidence_id = %s
    """, (
        avg_probability,
        prediction,
        video_metadata.get('total_frames') if video_metadata else None,
        video_metadata.get('fps') if video_metadata else None,
        video_metadata.get('width') if video_metadata else None,
        video_metadata.get('height') if video_metadata else None,
        video_metadata.get('duration_seconds') if video_metadata else None,
        geolocation.get('latitude') if geolocation else None,
        geolocation.get('longitude') if geolocation else None,
        geolocation.get('location_name') if geolocation else None,
        case_id,
        evidence_id
    ))

    conn.commit()

    if cur.rowcount == 0:
        st.warning("⚠️ No matching evidence found. Please upload evidence first.")

    cur.close()
    conn.close()


# --------------------------------------------------- #

# Add current directory to path for classifiers import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import model
try:
    from classifiers import Meso4
except ImportError as e:
    st.error(f"Could not import classifiers: {str(e)}")
    st.code("pip install -r requirements_simple.txt")
    st.stop()

# Page config
st.set_page_config(page_title="Deepfake Detection", layout="centered")
st.markdown("<h1 style='text-align: center;'>Deepfake Video Detection</h1>", unsafe_allow_html=True)

# Load weights
weights_path = "weights/Meso4_DF.h5"
if not os.path.exists(weights_path):
    st.error(f"Weights file not found: {weights_path}")
    st.stop()

@st.cache_resource
def load_model():
    model = Meso4()
    model.load(weights_path)
    return model

model = load_model()

# ---------------- USER INPUTS ---------------- #

case_id = st.text_input("Case ID")
evidence_id = st.text_input("Evidence ID")

uploaded_video = st.file_uploader(
    "Upload a video file",
    type=["mp4", "avi", "mov"]
)

st.subheader("📍 Geolocation (Optional)")
col1, col2 = st.columns(2)
with col1:
    latitude = st.number_input("Latitude", value=0.0, format="%.6f")
with col2:
    longitude = st.number_input("Longitude", value=0.0, format="%.6f")

location_name = st.text_input("Location Name (City, Country, etc.)")

geolocation = {
    'latitude': latitude if latitude != 0.0 else None,
    'longitude': longitude if longitude != 0.0 else None,
    'location_name': location_name if location_name else None
}

# ---------------- VALIDATION ---------------- #

if uploaded_video:
    tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tfile.write(uploaded_video.read())
    tfile.close()

    st.video(tfile.name)

if not case_id or not evidence_id:
    st.warning("Please enter Case ID and Evidence ID")

elif uploaded_video and st.button("Run Deepfake Detection"):

    try:
        cap = cv2.VideoCapture(tfile.name)
        fake_scores = []
        frame_count = 0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        progress_bar = st.progress(0)
        status_text = st.empty()

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % 10 == 0:
                frame_resized = cv2.resize(frame, (256, 256))
                frame_normalized = frame_resized / 255.0
                frame_input = np.expand_dims(frame_normalized, axis=0)

                pred = model.model.predict(frame_input, verbose=0)[0][0]
                fake_scores.append(pred)

            frame_count += 1

            if total_frames > 0:
                progress_bar.progress(min(frame_count / total_frames, 1.0))
                status_text.text(
                    f"Processing frame {frame_count} / {total_frames}"
                )

        cap.release()

        # ---------------- RESULT ---------------- #

        if fake_scores:
            avg_fake = float(sum(fake_scores) / len(fake_scores))
            frames_used = len(fake_scores)

            if avg_fake > 0.5:
                prediction = "FAKE"
                st.error("❌ FAKE VIDEO DETECTED")
            else:
                prediction = "REAL"
                st.success("✅ REAL VIDEO DETECTED")

            st.subheader("📊 Result")
            st.write(f"Average Fake Probability: **{avg_fake:.4f}**")
            st.write(f"Prediction: **{prediction}**")
            st.write(f"Frames Analyzed: **{frames_used}**")

            # 🔥 UPDATE SAME EVIDENCE ROW
            update_deepfake_result(
                case_id=case_id,
                evidence_id=evidence_id,
                avg_probability=avg_fake,
                prediction=prediction
            )

            st.info("📁 Deepfake result updated in evidence record")

        else:
            st.warning("No frames were processed. Please try another video.")

    except Exception as e:
        st.error(f"Error processing video: {str(e)}")

    finally:
        try:
            os.unlink(tfile.name)
        except:
            pass
