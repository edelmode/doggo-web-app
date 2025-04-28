from flask import Blueprint, request, jsonify, Response
import cv2
import numpy as np
import base64
import os
import time
from datetime import datetime

# Create blueprint for camera operations
camera_bp = Blueprint('camera', __name__)

# Global camera object (initialized only once)
camera = None

def get_camera():
    global camera
    if camera is None:
        try:
            camera = cv2.VideoCapture(0)  # or use specific Pi camera setup
            # Set camera properties if needed
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        except Exception as e:
            print(f"Error initializing camera: {e}")
    return camera

def release_camera():
    global camera
    if camera is not None:
        camera.release()
        camera = None

@camera_bp.route('/capture_photo', methods=['POST'])
def capture_photo():
    """Endpoint to capture a photo and return as base64"""
    try:
        cam = get_camera()
        if not cam or not cam.isOpened():
            return jsonify({'error': 'Camera not available'}), 500
        
        # Capture frame
        ret, frame = cam.read()
        if not ret:
            return jsonify({'error': 'Failed to capture image'}), 500
        
        # Convert to JPEG and encode as base64
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        
        # Return the image as base64
        return jsonify({
            'success': True,
            'photo': f'data:image/jpeg;base64,{jpg_as_text}'
        })
    except Exception as e:
        print(f"Error capturing photo: {e}")
        return jsonify({'error': f'Error capturing photo: {str(e)}'}), 500

@camera_bp.route('/take_and_save_photo', methods=['POST'])
def take_and_save_photo():
    """Endpoint to capture, save locally, and return photo URL"""
    try:
        # Get data from request
        data = request.json
        user_id = data.get('user_id')
        pet_name = data.get('pet_name', 'pet')
        emotion = data.get('emotion', 'No Emotion')
        
        # Take a photo
        cam = get_camera()
        if not cam or not cam.isOpened():
            return jsonify({'error': 'Camera not available'}), 500
            
        ret, frame = cam.read()
        if not ret:
            return jsonify({'error': 'Failed to capture image'}), 500
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}_{pet_name}_{timestamp}.jpg"
        
        # Ensure directory exists
        os.makedirs('./photos', exist_ok=True)
        
        # Local path to save the image
        local_path = os.path.join('./photos', filename)
        
        # Save locally
        cv2.imwrite(local_path, frame)
        
        # Convert to base64 to return to client
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        
        # In a real implementation, you would upload to Azure here
        # For now, return both the local path and base64 data
        return jsonify({
            'success': True,
            'local_path': local_path,
            'photo': f'data:image/jpeg;base64,{jpg_as_text}',
            'filename': filename
        })
        
    except Exception as e:
        print(f"Error taking and saving photo: {e}")
        return jsonify({'error': f'Error: {str(e)}'}), 500

# Video streaming generator function
def generate_frames():
    """Generate frames for MJPEG streaming"""
    cam = get_camera()
    if not cam:
        return
    
    while True:
        success, frame = cam.read()
        if not success:
            break
        
        # Encode the frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        # Yield the frame in the MJPEG format
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@camera_bp.route('/video_feed')
def video_feed():
    """Video streaming route for MJPEG"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@camera_bp.route('/zoom', methods=['POST'])
def zoom_camera():
    """Endpoint to adjust camera zoom (simulated)"""
    try:
        # Get zoom level from request
        data = request.json
        zoom_level = data.get('zoom_level', 1.0)
        
        # In a real implementation, you would adjust camera parameters here
        # For now, just return success
        return jsonify({
            'success': True,
            'zoom_level': zoom_level
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Recording functionality
recording = False
video_writer = None
recording_file = None

@camera_bp.route('/start_recording', methods=['POST'])
def start_recording():
    """Start recording video from camera"""
    global recording, video_writer, recording_file
    
    if recording:
        return jsonify({'error': 'Already recording'}), 400
    
    try:
        cam = get_camera()
        if not cam or not cam.isOpened():
            return jsonify({'error': 'Camera not available'}), 500
        
        # Get camera properties
        width = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cam.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30  # Default value if camera doesn't report FPS
        
        # Create directory if not exists
        os.makedirs('./videos', exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        recording_file = f'./videos/recording_{timestamp}.mp4'
        
        # Create VideoWriter object
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # or 'avc1' for H.264
        video_writer = cv2.VideoWriter(recording_file, fourcc, fps, (width, height))
        
        recording = True
        
        # Start recording in a separate thread
        import threading
        threading.Thread(target=record_frames).start()
        
        return jsonify({
            'success': True,
            'message': 'Recording started',
            'file': recording_file
        })
    except Exception as e:
        recording = False
        if video_writer:
            video_writer.release()
            video_writer = None
        return jsonify({'error': f'Error starting recording: {str(e)}'}), 500

def record_frames():
    """Function to record frames in a separate thread"""
    global recording, video_writer
    
    cam = get_camera()
    if not cam:
        recording = False
        return
    
    try:
        while recording and cam.isOpened():
            ret, frame = cam.read()
            if not ret:
                break
                
            if video_writer:
                video_writer.write(frame)
            
            # Add small delay to reduce CPU usage
            time.sleep(0.01)
    except Exception as e:
        print(f"Error in recording thread: {e}")
    finally:
        if video_writer:
            video_writer.release()
        recording = False

@camera_bp.route('/stop_recording', methods=['POST'])
def stop_recording():
    """Stop recording and return the file path"""
    global recording, video_writer, recording_file
    
    if not recording:
        return jsonify({'error': 'Not recording'}), 400
    
    try:
        # Set flag to stop recording thread
        recording = False
        
        # Wait a moment for thread to finish
        time.sleep(0.5)
        
        # Release writer (though thread should have done this)
        if video_writer:
            video_writer.release()
            video_writer = None
        
        if not recording_file or not os.path.exists(recording_file):
            return jsonify({'error': 'Recording file not found'}), 500
        
        return jsonify({
            'success': True,
            'message': 'Recording stopped',
            'video_path': recording_file
        })
    except Exception as e:
        return jsonify({'error': f'Error stopping recording: {str(e)}'}), 500

@camera_bp.route('/transfer_video', methods=['POST'])
def transfer_video():
    """Transfer a video file to Azure (simulated)"""
    try:
        data = request.json
        video_path = data.get('video_path')
        user_id = data.get('user_id')
        pet_name = data.get('pet_name', 'pet')
        
        if not video_path or not os.path.exists(video_path):
            return jsonify({'error': 'Video file not found'}), 400
        
        # In a real implementation, you would upload to Azure here
        # For now, just return the local path
        # Simulate a cloud URL for the frontend
        filename = os.path.basename(video_path)
        simulated_url = f"https://yourstorage.blob.core.windows.net/videos/{filename}"
        
        return jsonify({
            'success': True,
            'local_path': video_path,
            'video_url': simulated_url
        })
    except Exception as e:
        return jsonify({'error': f'Error transferring video: {str(e)}'}), 500
    