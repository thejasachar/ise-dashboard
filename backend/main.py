from flask import Flask, request, jsonify
import cv2
import numpy as np
import face_recognition
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore
import os
from flask_cors import CORS
import logging
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("CORS_ORIGINS", "http://localhost:3000")}})

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

# Initialize Firebase
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase_credentials.json")
cred = credentials.Certificate(firebase_cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load Emotion Recognition Model
emotion_pipeline = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.route('/')
def home():
    return jsonify({"message": "ISE Backend Running on Vercel!"})

# 1️⃣ API: Emotion Recognition (Text)
@app.route('/api/emotion', methods=['POST'])
def detect_emotion():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400
    try:
        result = emotion_pipeline(text)
        return jsonify({"emotion": result})
    except Exception as e:
        logging.error(f"Error in emotion detection: {e}")
        return jsonify({"error": "Failed to process emotion detection"}), 500

# 2️⃣ API: Face Detection (Image Processing)
@app.route('/api/face-detection', methods=['POST'])
def face_detection_api():
    file = request.files.get("image")
    if not file:
        return jsonify({"error": "No image provided"}), 400
    
    try:
        image = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(image, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_image)
        
        faces = [{"top": t, "right": r, "bottom": b, "left": l} for t, r, b, l in face_locations]
        return jsonify({"faces": faces})
    except Exception as e:
        logging.error(f"Error in face detection: {e}")
        return jsonify({"error": "Failed to process face detection"}), 500

# 3️⃣ API: Save User Progress (Firebase)
@app.route('/api/save-progress', methods=['POST'])
def save_progress():
    data = request.json
    user_id = data.get("user_id")
    progress_data = data.get("progress")
    
    if not user_id or not progress_data:
        return jsonify({"error": "Missing data"}), 400
    
    try:
        db.collection("users").document(user_id).set({"progress": progress_data})
        return jsonify({"message": "Progress saved successfully!"})
    except Exception as e:
        logging.error(f"Error saving progress: {e}")
        return jsonify({"error": "Failed to save progress"}), 500

# 4️⃣ API: Retrieve User Progress
@app.route('/api/get-progress/<user_id>', methods=['GET'])
def get_progress(user_id):
    try:
        doc = db.collection("users").document(user_id).get()
        if doc.exists:
            return jsonify({"progress": doc.to_dict().get("progress", {})})
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        logging.error(f"Error retrieving progress: {e}")
        return jsonify({"error": "Failed to retrieve progress"}), 500

# 5️⃣ API: User Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        user_doc = db.collection("users").where("email", "==", email).get()
        if not user_doc:
            return jsonify({"error": "Invalid email or password"}), 401

        user = user_doc[0].to_dict()
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid email or password"}), 401

        token = jwt.encode({
            "user_id": user["id"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"]}
        })
    except Exception as e:
        logging.error(f"Error during login: {e}")
        return jsonify({"error": "Failed to process login"}), 500

# 6️⃣ API: User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    try:
        user_doc = db.collection("users").where("email", "==", email).get()
        if user_doc:
            return jsonify({"error": "User with this email already exists"}), 409

        hashed_password = generate_password_hash(password)
        user_id = db.collection("users").document().id
        db.collection("users").document(user_id).set({
            "id": user_id,
            "name": name,
            "email": email,
            "password": hashed_password
        })

        return jsonify({"message": "User registered successfully", "user_id": user_id}), 201
    except Exception as e:
        logging.error(f"Error during registration: {e}")
        return jsonify({"error": "Failed to register user"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
