from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import base64
import os
from ultralytics import YOLO
import tempfile

# Create blueprint
dog_pose_bp = Blueprint('dog_pose', __name__)

# Initialize the YOLO model (load only once when the blueprint is registered)
model = None

def load_model():
    global model
    if model is None:
        try:
            model = YOLO("doggo_pose.pt")  # Adjust the path as needed
            print("Dog pose model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    return True

@dog_pose_bp.route('/detect', methods=['POST'])
def detect_dog_pose():
    # Check if model is loaded
    if not load_model():
        return jsonify({"error": "Failed to load model"}), 500
    
    # Get the base64 image from the request
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({"error": "No image data received"}), 400
    
    try:
        # Process the base64 image
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400
        
        # Run inference
        results = model.predict(frame, show=False)
        
        # Extract keypoints and other detection info
        keypoints = None
        confidence = 0
        bbox = None
        
        if results and len(results) > 0 and results[0].keypoints is not None:
            # Get keypoints data
            keypoints = results[0].keypoints.data.tolist() if results[0].keypoints.data is not None else []
            
            # Get bounding boxes and confidence if available
            if results[0].boxes and len(results[0].boxes) > 0:
                confidence = float(results[0].boxes.conf[0]) if len(results[0].boxes.conf) > 0 else 0
                bbox = results[0].boxes.xyxy[0].tolist() if len(results[0].boxes.xyxy) > 0 else None
        
        # Draw keypoints on the image
        annotated_frame = results[0].plot()
        
        # Convert the annotated frame back to base64
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        annotated_image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            "success": True,
            "annotated_image": f"data:image/jpeg;base64,{annotated_image_base64}",
            "keypoints": keypoints,
            "confidence": confidence,
            "bbox": bbox
        })
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({"error": f"Error processing image: {str(e)}"}), 500