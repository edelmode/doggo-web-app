import os
import json
import base64
import uuid
from datetime import datetime
from flask import request, jsonify, Blueprint
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient, generate_blob_sas, BlobSasPermissions
from io import BytesIO
import re
from dotenv import load_dotenv
from app.extensions import mysql
from datetime import timedelta
from urllib.parse import unquote

load_dotenv()

gallery_bp = Blueprint('gallery', __name__, url_prefix='/api/gallery')

# Azure Blob Storage configuration
AZURE_STORAGE_CONNECTION_STRING = os.environ.get("AZURE_STORAGE_CONNECTION_STRING")
AZURE_STORAGE_ACCOUNT_NAME = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_STORAGE_ACCESS_KEY = os.environ.get('AZURE_STORAGE_ACCESS_KEY')
CONTAINER_NAME_PHOTOS = "pet-photos"
CONTAINER_NAME_VIDEOS = "pet-videos"

# Ensure the blob storage client is initialized
try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
    
    # Ensure containers exist
    for container_name in [CONTAINER_NAME_PHOTOS, CONTAINER_NAME_VIDEOS]:
        try:
            container_client = blob_service_client.get_container_client(container_name)
            container_client.get_container_properties()  # This will throw if container doesn't exist
        except Exception:
            # Create container if it doesn't exist
            container_client = blob_service_client.create_container(container_name)
            print(f"Container {container_name} created")
except Exception as e:
    print(f"Error connecting to Azure Blob Storage: {e}")
    blob_service_client = None

def generate_sas_token(container_name, blob_name):
    from azure.core.exceptions import AzureError

    try:
        if not AZURE_STORAGE_ACCOUNT_NAME or not AZURE_STORAGE_ACCESS_KEY:
            raise ValueError("Missing Azure storage credentials.")

        if not blob_name:
            raise ValueError("Blob name is required to generate SAS token.")

        sas_token = generate_blob_sas(
            account_name=AZURE_STORAGE_ACCOUNT_NAME,
            container_name=container_name,
            blob_name=blob_name,
            account_key=AZURE_STORAGE_ACCESS_KEY,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=2)
        )

        if not sas_token:
            raise ValueError("Generated SAS token is empty.")

        print(f"[SAS] Successfully generated SAS token for blob: {blob_name}")

        return sas_token

    except AzureError as azure_err:
        print(f"[SAS][AzureError] Failed to generate SAS token: {azure_err}")
        return None
    except Exception as e:
        print(f"[SAS][Error] Unexpected error: {str(e)}")
        return None

@gallery_bp.route('/save-photo', methods=['POST'])
def save_photo():
    if not blob_service_client:
        return jsonify({"error": "Azure Blob Storage not configured"}), 500
    
    try:
        data = request.json
        user_id = data.get('user_id')
        photo_data = data.get('photo_data')
        pet_name = data.get('pet_name', 'pet')
        emotion = data.get('emotion', 'Unknown')
        
        if not user_id or not photo_data:
            return jsonify({"error": "Missing required data"}), 400
        
        # Extract base64 data
        if 'data:image' in photo_data:
            # Format: data:image/jpeg;base64,/9j/4AAQSkZJRg...
            header, encoded = photo_data.split(",", 1)
        else:
            encoded = photo_data
        
        # Decode base64 data
        image_data = base64.b64decode(encoded)
        
        # Generate a unique blob name
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        blob_name = f"{user_id}/{timestamp}_{unique_id}.jpg"
        
        # Upload to Azure Blob Storage
        blob_client = blob_service_client.get_blob_client(
            container=CONTAINER_NAME_PHOTOS, 
            blob=blob_name
        )
        
        blob_client.upload_blob(image_data, overwrite=True)
        
        # Generate SAS token for the blob
        sas_token = generate_sas_token(CONTAINER_NAME_PHOTOS, blob_name)
        
        # Get the URL for the blob with SAS token
        photo_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_PHOTOS}/{blob_name}?{sas_token}"
        
        # Save metadata to MySQL database
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")  # Make sure to use the correct database name
        
        cursor.execute("""
            INSERT INTO gallery (user_id, media_type, file_path, pet_name, uploaded_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, 'photo', photo_url, pet_name, datetime.now()))
        
        # Get the auto-generated gallery_id
        gallery_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        
        return jsonify({
            "success": True,
            "gallery_id": gallery_id,
            "photo_url": photo_url
        })
        
    except Exception as e:
        print(f"Error saving photo: {e}")
        return jsonify({"error": str(e)}), 500


@gallery_bp.route('/download/<int:gallery_id>', methods=['GET'])
def download_media(gallery_id):
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        
        # Get the file path and media type
        cursor.execute("""
            SELECT file_path, media_type, pet_name FROM gallery 
            WHERE gallery_id = %s AND user_id = %s
        """, (gallery_id, user_id))
        
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Media not found or unauthorized"}), 404
        
        file_path, media_type, pet_name = result
        cursor.close()
        
        # Extract the URL without the SAS token
        url_parts = file_path.split('?')[0]
        
        # Determine container name based on media type
        container_name = CONTAINER_NAME_PHOTOS if media_type == 'photo' else CONTAINER_NAME_VIDEOS
        
        # Extract blob name from URL
        blob_name = url_parts.split(f"/{container_name}/")[1]
        
        # Get blob client
        blob_client = blob_service_client.get_blob_client(
            container=container_name,
            blob=blob_name
        )
        
        # Download the blob
        blob_data = blob_client.download_blob().readall()
        
        # Create filename for download
        date_str = datetime.now().strftime("%Y%m%d")
        safe_pet_name = re.sub(r'[^\w\-_\.]', '_', pet_name or 'pet')
        filename = f"{safe_pet_name}_{date_str}.{blob_name.split('.')[-1]}"
        
        # Prepare response with appropriate headers
        headers = {
            'Content-Type': 'image/jpeg' if media_type == 'photo' else 'video/mp4',
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
        
        # Return the blob data as a file download
        return blob_data, 200, headers
        
    except Exception as e:
        print(f"Error downloading media: {e}")
        return jsonify({"error": str(e)}), 500

@gallery_bp.route('/photos', methods=['GET'])
def get_photos():
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        
        cursor.execute("""
            SELECT gallery_id, file_path, pet_name, uploaded_at 
            FROM gallery 
            WHERE user_id = %s AND media_type = 'photo'
            ORDER BY uploaded_at DESC
        """, (user_id,))
        
        photos = []
        for row in cursor.fetchall():
            gallery_id, file_path, pet_name, uploaded_at = row
            
            # Refresh SAS token if needed
            if file_path and '?' in file_path:
                try:
                    # Extract the full blob path from the URL
                    # Example: https://doggo.blob.core.windows.net/pet-photos/2/20250419_104905_79c1dd05.jpg?se=...
                    url_parts = file_path.split('?')[0]  # Remove query parameters
                    container_part = f"/{CONTAINER_NAME_PHOTOS}/"
                    blob_name = url_parts.split(container_part)[1]  # Get everything after the container name
                    
                    print(f"Refreshing SAS token for blob: {blob_name}")
                    
                    new_sas_token = generate_sas_token(CONTAINER_NAME_PHOTOS, blob_name)
                    file_path = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_PHOTOS}/{blob_name}?{new_sas_token}"
                except Exception as e:
                    print(f"Error refreshing SAS token: {e}")
                    # If we can't refresh the token, just use the existing URL
                    pass
            
            photos.append({
                "id": gallery_id,
                "url": file_path,
                "pet_name": pet_name,
                "created_at": uploaded_at.isoformat() if isinstance(uploaded_at, datetime) else uploaded_at
            })
        
        cursor.close()
        
        return jsonify({"photos": photos})
        
    except Exception as e:
        print(f"Error retrieving photos: {e}")
        return jsonify({"error": str(e)}), 500

@gallery_bp.route('/videos', methods=['GET'])
def get_videos():
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"error": "Missing user_id parameter"}), 400
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        
        cursor.execute("""
            SELECT gallery_id, file_path, pet_name, uploaded_at 
            FROM gallery 
            WHERE user_id = %s AND media_type = 'video'
            ORDER BY uploaded_at DESC
        """, (user_id,))
        
        videos = []
        for row in cursor.fetchall():
            gallery_id, file_path, pet_name, uploaded_at = row
            
            # Refresh SAS token if needed
            if file_path and '?' in file_path:
                try:
                    # Extract the full blob path from the URL
                    url_parts = file_path.split('?')[0]  # Remove query parameters
                    container_part = f"/{CONTAINER_NAME_VIDEOS}/"
                    blob_name = url_parts.split(container_part)[1]  # Get everything after the container name
                    
                    print(f"Refreshing SAS token for blob: {blob_name}")
                    
                    new_sas_token = generate_sas_token(CONTAINER_NAME_VIDEOS, blob_name)
                    file_path = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_VIDEOS}/{blob_name}?{new_sas_token}"
                except Exception as e:
                    print(f"Error refreshing SAS token: {e}")
                    # If we can't refresh the token, just use the existing URL
                    pass
            
            videos.append({
                "id": gallery_id,
                "url": file_path,
                "pet_name": pet_name,
                "created_at": uploaded_at.isoformat() if isinstance(uploaded_at, datetime) else uploaded_at
            })
        
        cursor.close()
        
        return jsonify({"videos": videos})
        
    except Exception as e:
        print(f"Error retrieving videos: {e}")
        return jsonify({"error": str(e)}), 500

@gallery_bp.route('/save-video', methods=['POST'])
def save_video():
    if not blob_service_client:
        return jsonify({"error": "Azure Blob Storage not configured"}), 500
    
    try:
        if 'video' not in request.files:
            return jsonify({"error": "No video file provided"}), 400
        
        user_id = request.form.get('user_id')
        pet_name = request.form.get('pet_name', 'pet')
        
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400
        
        video_file = request.files['video']
        
        # Generate a unique blob name
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        original_filename = video_file.filename
        blob_name = f"{user_id}/{timestamp}_{unique_id}_{original_filename}"
        
        # Upload to Azure Blob Storage
        blob_client = blob_service_client.get_blob_client(
            container=CONTAINER_NAME_VIDEOS, 
            blob=blob_name
        )
        
        blob_client.upload_blob(video_file.read(), overwrite=True)
        
        # Generate SAS token for the blob
        sas_token = generate_sas_token(CONTAINER_NAME_VIDEOS, blob_name)
        
        # Get the URL for the blob with SAS token
        video_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{CONTAINER_NAME_VIDEOS}/{blob_name}?{sas_token}"
        
        # Save metadata to MySQL database
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")  # Make sure to use the correct database name
        
        cursor.execute("""
            INSERT INTO gallery (user_id, media_type, file_path, pet_name, uploaded_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (user_id, 'video', video_url, pet_name, datetime.now()))
        
        # Get the auto-generated gallery_id
        gallery_id = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        
        return jsonify({
            "success": True,
            "gallery_id": gallery_id,
            "video_url": video_url
        })
        
    except Exception as e:
        print(f"Error saving video: {e}")
        return jsonify({"error": str(e)}), 500


@gallery_bp.route('/delete', methods=['DELETE'])
def delete_media():
    try:
        data = request.json
        gallery_id = data.get('gallery_id')
        user_id = data.get('user_id')
        
        if not gallery_id or not user_id:
            return jsonify({"error": "Missing required parameters"}), 400
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        
        # First, get the file path and media type to determine which blob to delete
        cursor.execute("""
            SELECT file_path, media_type FROM gallery 
            WHERE gallery_id = %s AND user_id = %s
        """, (gallery_id, user_id))
        
        result = cursor.fetchone()
        if not result:
            return jsonify({"error": "Media not found or unauthorized"}), 404
        
        file_path, media_type = result
        
        # Delete from database first
        cursor.execute("""
            DELETE FROM gallery 
            WHERE gallery_id = %s AND user_id = %s
        """, (gallery_id, user_id))
        
        conn.commit()
        
        # Now try to delete from Azure Blob Storage
        if file_path and blob_service_client:
            try:
                # Determine container based on media type
                container_name = CONTAINER_NAME_PHOTOS if media_type == 'photo' else CONTAINER_NAME_VIDEOS
                
                # Extract blob name correctly from URL
                # The URL format is: https://storageaccount.blob.core.windows.net/container/path/to/blob?sas
                url_parts = file_path.split('?')[0]  # Remove SAS token
                storage_url_prefix = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{container_name}/"
                blob_name = url_parts.replace(storage_url_prefix, "")
                
                print(f"Attempting to delete blob: {blob_name} from container: {container_name}")
                
                # Delete the blob
                blob_client = blob_service_client.get_blob_client(
                    container=container_name, 
                    blob=blob_name
                )
                blob_client.delete_blob()
                
                print(f"Successfully deleted blob: {blob_name} from container: {container_name}")
            except Exception as e:
                print(f"Warning: Could not delete blob from Azure: {e}")
                # We don't want to fail the operation if the blob delete fails
                # The database record is already deleted, which is the most important part
        
        cursor.close()
        
        return jsonify({
            "success": True,
            "message": f"Successfully deleted {media_type}"
        })
        
    except Exception as e:
        print(f"Error deleting media: {e}")
        return jsonify({"error": str(e)}), 500
    
