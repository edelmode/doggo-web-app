from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from azure.storage.blob import BlobServiceClient
from app.extensions import mysql
import os
import uuid


# Create a Blueprint for user-related routes
user_bp = Blueprint('user', __name__, url_prefix='/api/user')

AZURE_STORAGE_ACCOUNT_NAME = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
AZURE_STORAGE_CONTAINER_NAME = os.getenv('AZURE_STORAGE_CONTAINER_NAME')
AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')

blob_service_client = BlobServiceClient.from_connection_string(AZURE_STORAGE_CONNECTION_STRING)
container_client = blob_service_client.get_container_client(AZURE_STORAGE_CONTAINER_NAME)

@user_bp.route('/user-details', methods=['GET'])
def get_user_details():
    # Retrieve user_id from the query parameters
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "User ID is required."}), 400

    cursor = None

    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Fetch user details
        cursor.execute("SELECT name, pet_name, contact_number FROM user_info WHERE user_id = %s", (user_id,))
        user_info = cursor.fetchone()

        if not user_info:
            return jsonify({"error": "User details not found."}), 404

        name, pet_name, contact_number = user_info

        # Fetch pet details
        cursor.execute("SELECT sex, breed, age FROM pets_info WHERE user_id = %s", (user_id,))
        pet_info = cursor.fetchone()

        if not pet_info:
            return jsonify({"error": "Pet details not found."}), 404

        sex, breed, age = pet_info

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

@user_bp.route('/user-details', methods=['PUT'])
def update_user_details():
    data = request.get_json()
    
    # Retrieve user_id from the request body
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

        # Update user_info table
        cursor.execute("""
            UPDATE user_info
            SET name = %s, pet_name = %s, contact_number = %s
            WHERE user_id = %s
        """, (name, pet_name, contact_number, user_id))

        # Update pets_info table
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
        # Secure the filename and generate a unique name
        filename = secure_filename(file.filename)
        file_extension = filename.split('.')[-1]
        unique_filename = f"user_{user_id}_{uuid.uuid4().hex}.{file_extension}"

        # Upload to Azure Blob Storage
        blob_client = container_client.get_blob_client(unique_filename)
        blob_client.upload_blob(file, overwrite=True)

        # Get the blob URL
        blob_url = f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/{AZURE_STORAGE_CONTAINER_NAME}/{unique_filename}"

        # Update the database
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
    
