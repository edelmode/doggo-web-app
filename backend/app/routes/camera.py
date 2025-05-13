from flask import Blueprint, request, jsonify, Response
import cv2
import numpy as np
import base64
import json
import os
import time
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.utils import secure_filename
from azure.storage.blob import ContentSettings, BlobServiceClient

load_dotenv()

camera_bp = Blueprint('camera', __name__)

AZURE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
AZURE_STORAGE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
CONTAINER_NAME_PHOTOS = "pet-photos"
CONTAINER_NAME_VIDEOS = "pet-videos"

try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    
    photos_container_client = blob_service_client.get_container_client(CONTAINER_NAME_PHOTOS)
    videos_container_client = blob_service_client.get_container_client(CONTAINER_NAME_VIDEOS)
        
    azure_storage_available = True
    print("Azure Blob Storage initialized successfully")
    
except Exception as e:
    print(f"Warning: Azure Blob Storage initialization failed: {e}")
    azure_storage_available = False
    photos_container_client = None
    videos_container_client = None

try:
    from app.extensions import mysql
    mysql_available = True
    print("MySQL connection imported successfully")
except Exception as e:
    print(f"Warning: MySQL import failed: {e}")
    mysql_available = False

def generate_sas_token(container_name, blob_name):
    from azure.storage.blob import generate_blob_sas, BlobSasPermissions
    from datetime import timedelta
    
    try:
        sas_token = generate_blob_sas(
            account_name=AZURE_STORAGE_ACCOUNT_NAME,
            container_name=container_name,
            blob_name=blob_name,
            account_key=os.environ.get('AZURE_STORAGE_ACCESS_KEY'),
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=2)
        )
        return sas_token
    except Exception as e:
        print(f"Error generating SAS token: {e}")
        return None

camera = None

def get_camera():
    global camera
    if camera is None:
        try:
            camera = cv2.VideoCapture(0) 
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
        
        ret, frame = cam.read()
        if not ret:
            return jsonify({'error': 'Failed to capture image'}), 500
        
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        
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
        data = request.json
        user_id = data.get('user_id')
        pet_name = data.get('pet_name', 'pet')
        emotion = data.get('emotion', 'No Emotion')
        
        cam = get_camera()
        if not cam or not cam.isOpened():
            return jsonify({'error': 'Camera not available'}), 500
            
        ret, frame = cam.read()
        if not ret:
            return jsonify({'error': 'Failed to capture image'}), 500
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{user_id}_{pet_name}_{timestamp}.jpg"
        
        os.makedirs('./photos', exist_ok=True)
        
        local_path = os.path.join('./photos', filename)
        
        cv2.imwrite(local_path, frame)
        
        _, buffer = cv2.imencode('.jpg', frame)
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        
        return jsonify({
            'success': True,
            'local_path': local_path,
            'photo': f'data:image/jpeg;base64,{jpg_as_text}',
            'filename': filename
        })
        
    except Exception as e:
        print(f"Error taking and saving photo: {e}")
        return jsonify({'error': f'Error: {str(e)}'}), 500

def generate_frames():
    """Generate frames for MJPEG streaming"""
    cam = get_camera()
    if not cam:
        return
    
    while True:
        success, frame = cam.read()
        if not success:
            break
        
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@camera_bp.route('/video_feed')
def video_feed():
    """Video streaming route for MJPEG"""
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

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
        
        width = int(cam.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cam.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cam.get(cv2.CAP_PROP_FPS)
        
        os.makedirs('./videos', exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        recording_file = f'./videos/recording_{timestamp}.mp4'
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4')
        video_writer = cv2.VideoWriter(recording_file, fourcc, fps, (width, height))
        
        recording = True

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
        recording = False
        
        time.sleep(0.5)
        
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
        
        filename = os.path.basename(video_path)
        simulated_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_VIDEOS}/{filename}"
        
        return jsonify({
            'success': True,
            'local_path': video_path,
            'video_url': simulated_url
        })
    except Exception as e:
        return jsonify({'error': f'Error transferring video: {str(e)}'}), 500

@camera_bp.route('/gallery/save-video', methods=['POST'])
def save_video():
    """Endpoint to save a video file to Azure Blob Storage and MySQL database"""
    try:
        if 'video_file' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        file = request.files['video_file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        user_id = request.form.get('user_id', 'unknown_user')
        pet_name = request.form.get('pet_name', 'pet')
        emotion = request.form.get('emotion', 'Unknown')

        filename = secure_filename(file.filename)
        timestamp = int(datetime.now().timestamp())
        blob_name = f"{user_id}/{timestamp}-{filename}"

        video_url = None
        
        if azure_storage_available and videos_container_client:
            blob_client = videos_container_client.get_blob_client(blob_name)
            
            file_content = file.read()

            blob_client.upload_blob(
                file_content,
                blob_type="BlockBlob",
                content_settings=ContentSettings(content_type=file.content_type)
            )

            sas_token = generate_sas_token(CONTAINER_NAME_VIDEOS, blob_name)

            if sas_token:
                video_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_VIDEOS}/{blob_name}?{sas_token}"
            else:
                video_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_VIDEOS}/{blob_name}"

            if mysql_available:
                try:
                    conn = mysql.connection
                    cursor = conn.cursor()
                    cursor.execute("USE doggo") 
                    
                    cursor.execute("""
                        INSERT INTO gallery (user_id, media_type, file_path, pet_name, uploaded_at)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (user_id, 'video', video_url, pet_name, datetime.now()))
                    
                    gallery_id = cursor.lastrowid
                    
                    conn.commit()
                    cursor.close()
                    
                    print(f"Successfully saved video metadata to database with ID: {gallery_id}")
                    
                except Exception as db_error:
                    print(f"Database error when saving video: {db_error}")
            else:
                print("MySQL not available, video metadata not saved to database")

            return jsonify({
                'success': True,
                'video_url': video_url,
                'user_id': user_id,
                'pet_name': pet_name,
                'emotion': emotion
            })
        else:
            return jsonify({'error': 'Azure Blob Storage not available'}), 500

    except Exception as e:
        print(f"Error uploading video: {e}")
        return jsonify({'error': str(e)}), 500
