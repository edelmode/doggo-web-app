from flask import Blueprint, request, jsonify
from urllib.parse import unquote
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta
from app.extensions import mysql
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

# Create a Blueprint for user-related routes
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

AZURE_STORAGE_ACCOUNT_NAME = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_STORAGE_CONTAINER_NAME = os.getenv('AZURE_STORAGE_CONTAINER_NAME')
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
AZURE_STORAGE_ACCESS_KEY = os.getenv('AZURE_STORAGE_ACCESS_KEY')

blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(AZURE_STORAGE_CONTAINER_NAME)

@user_bp.route('/user-details', methods=['GET'])
def get_user_details():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    cursor = None
    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        cursor.execute("SELECT name, pet_name, contact_number, file_path FROM user_info WHERE user_id = %s", (user_id,))
        user_info = cursor.fetchone()

        if not user_info:
            return jsonify({"error": "User details not found."}), 404

        name, pet_name, contact_number, file_path = user_info

        cursor.execute("SELECT sex, breed, age FROM pets_info WHERE user_id = %s", (user_id,))
        pet_info = cursor.fetchone()

        if not pet_info:
            return jsonify({"error": "Pet details not found."}), 404

        sex, breed, age = pet_info

        # Generate a new SAS token for the file path
        if file_path:
            raw_blob_name = file_path.split("/")[-1].split("?")[0]
            blob_name = unquote(raw_blob_name)
            new_sas_token = generate_sas_token(blob_name)
            file_path = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_STORAGE_CONTAINER_NAME}/{blob_name}?{new_sas_token}"

        return jsonify({
            "name": name,
            "pet_name": pet_name,
            "contact_number": contact_number,
            "file_path": file_path,
            "pet_info": {
                "sex": sex,
                "breed": breed,
                "age": age
            }
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()

@user_bp.route('/user-details', methods=['PUT'])
def update_user_details():
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    name = data.get('name')
    pet_name = data.get('pet_name')
    contact_number = data.get('contact_number')
    sex = data.get('sex')
    breed = data.get('breed')
    age = data.get('age')

    cursor = None
    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        cursor.execute("""
            UPDATE user_info
            SET name = %s, pet_name = %s, contact_number = %s
            WHERE user_id = %s
        """, (name, pet_name, contact_number, user_id))

        cursor.execute("""
            UPDATE pets_info
            SET sex = %s, breed = %s, age = %s
            WHERE user_id = %s
        """, (sex, breed, age, user_id))

        conn.commit()

        return jsonify({
            "name": name,
            "pet_name": pet_name,
            "contact_number": contact_number,
            "pet_info": {
                "sex": sex,
                "breed": breed,
                "age": age
            }
        })
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()

def generate_sas_token(blob_name):
    from azure.core.exceptions import AzureError

    try:
        if not AZURE_STORAGE_ACCOUNT_NAME or not AZURE_STORAGE_ACCESS_KEY:
            raise ValueError("Missing Azure storage credentials.")

        if not blob_name:
            raise ValueError("Blob name is required to generate SAS token.")

        sas_token = generate_blob_sas(
            account_name=AZURE_STORAGE_ACCOUNT_NAME,
            container_name=AZURE_STORAGE_CONTAINER_NAME,
            blob_name=blob_name,
            account_key=AZURE_STORAGE_ACCESS_KEY,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=2)
            # You can add `version="2023-11-03"` here if needed
        )

        if not sas_token:
            raise ValueError("Generated SAS token is empty.")

        # Debug logging (remove or adjust for production)
        print(f"[SAS] Successfully generated SAS token for blob: {blob_name}")

        return sas_token

    except AzureError as azure_err:
        print(f"[SAS][AzureError] Failed to generate SAS token: {azure_err}")
        return None
    except Exception as e:
        print(f"[SAS][Error] Unexpected error: {str(e)}")
        return None



@user_bp.route('/upload-profile-picture', methods=['POST'])
def upload_profile_picture():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        filename = secure_filename(file.filename)
        file_extension = filename.split('.')[-1]
        unique_filename = f"user_{user_id}_{uuid.uuid4().hex}.{file_extension}"

        blob_client = container_client.get_blob_client(unique_filename)
        blob_client.upload_blob(file, overwrite=True)

        sas_token = generate_sas_token(unique_filename)
        blob_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_STORAGE_CONTAINER_NAME}/{unique_filename}?{sas_token}"

        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        cursor.execute("""
            UPDATE user_info 
            SET file_path = %s 
            WHERE user_id = %s
        """, (blob_url, user_id))
        conn.commit()
        cursor.close()

        return jsonify({"message": "Profile picture uploaded successfully", "file_url": blob_url})
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

