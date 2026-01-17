import streamlit as st
import cv2
import numpy as np
import tempfile
import os
import sys

# Add current directory to path for classifiers import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import the classifiers and necessary modules
try:
    from classifiers import Meso4
except ImportError as e:
    st.error(f"Could not import classifiers: {str(e)}")
    st.error("Please ensure all dependencies are installed:")
    st.code("pip install -r requirements_simple.txt")
    st.stop()

# Set page layout
st.set_page_config(page_title="Deepfake Detection", layout="centered")
st.markdown("<h1 style='text-align: center;'>Deepfake Video Detection</h1>", unsafe_allow_html=True)

# Check if weights file exists
weights_path = "weights/Meso4_DF.h5"
if not os.path.exists(weights_path):
    st.error(f"Weights file not found: {weights_path}")
    st.stop()

# Load the model and cache it for faster reloads
@st.cache_resource
def load_model():
    try:
        model = Meso4()
        model.load(weights_path)
        return model
    except Exception as e:
        st.error(f"Error loading model: {str(e)}")
        return None

model = load_model()

if model is None:
    st.stop()

# Upload video
uploaded_video = st.file_uploader("Upload a video file", type=["mp4", "avi", "mov"])

if uploaded_video:
    tfile = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tfile.write(uploaded_video.read())
    tfile.close()
    
    # Show uploaded video in Streamlit
    st.video(tfile.name)

    # Run Deepfake Detection
    if st.button("Run Deepfake Detection"):
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

                # Process every 10th frame for speed
                if frame_count % 10 == 0:
                    frame_resized = cv2.resize(frame, (256, 256))
                    frame_normalized = frame_resized / 255.0
                    frame_input = np.expand_dims(frame_normalized, axis=0)
                    
                    # Predict
                    try:
                        pred = model.model.predict(frame_input, verbose=0)[0][0]
                        fake_scores.append(pred)
                    except Exception as e:
                        st.warning(f"Error during prediction: {str(e)}")

                frame_count += 1

                # Update progress
                if total_frames > 0:
                    progress_bar.progress(min(frame_count / total_frames, 1.0))
                    status_text.text(f"Processing frame {frame_count} / {total_frames}")

            cap.release()

            # Compute average fake probability
            if fake_scores:
                avg_fake = sum(fake_scores) / len(fake_scores)
                st.subheader("📊 Result")
                st.write(f"Average Fake Probability: **{avg_fake:.4f}**")
                st.write(f"Frames Analyzed: **{len(fake_scores)}**")
                
                if avg_fake > 0.5:
                    st.error("❌ FAKE VIDEO DETECTED")
                else:
                    st.success("✅ REAL VIDEO DETECTED")
            else:
                st.warning("No frames were processed. Please try another video.")
                
        except Exception as e:
            st.error(f"Error processing video: {str(e)}")
        finally:
            # Clean up
            try:
                os.unlink(tfile.name)
            except:
                pass
