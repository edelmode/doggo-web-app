from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import mysql, mail
from app.utils.validators import validate_email, validate_password
import jwt
import os
from datetime import datetime, timedelta
from flask_mail import Message

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")

@auth_bp.route('/users', methods=['GET'])
def get_all_users():
    cursor = None  
    try:
        conn = mysql.connection  
        if not conn:
            return jsonify({"error": "Database connection not established."}), 500

        cursor = conn.cursor()  
        cursor.execute("USE doggo")
        cursor.execute("SELECT id, email, created_at FROM users")
        users = cursor.fetchall()

        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor is not None:  
            cursor.close()


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    real_name = data.get('realName')
    contact_number = data.get('contactNumber')
    pet_name = data.get('petName')
    pet_sex = data.get('petSex')
    pet_breed = data.get('petBreed')
    pet_age = data.get('petAge')
    is_verified = 0  # Default to not verified on registration

    # Validate inputs
    if not validate_email(email):
        return jsonify({"error": "Invalid email address."}), 400

    if not validate_password(password):
        return jsonify({"error": "Password must be at least 8 characters long and contain a number or special character."}), 400

    if not real_name or not contact_number or not pet_name or not pet_sex or not pet_breed or not pet_age:
        return jsonify({"error": "All fields are required."}), 400

    cursor = None  # Initialize cursor to None
    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Check if the email already exists
        cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered."}), 400

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Insert user into the users table
        cursor.execute(
            "INSERT INTO users (email, password, is_verified, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW())",
            (email, hashed_password, is_verified)
        )
        # Important: Commit after each operation to ensure data is saved
        conn.commit()

        # Get the newly inserted user's ID
        user_id = cursor.lastrowid

        # Insert additional user info (real_name, contact_number) into the user_info table
        cursor.execute(
            "INSERT INTO user_info (user_id, name, contact_number, pet_name) VALUES (%s, %s, %s, %s)",
            (user_id, real_name, contact_number, pet_name)
        )
        conn.commit()

        # Insert pet info into the pets_info table
        cursor.execute(
            "INSERT INTO pets_info (user_id, sex, breed, age) VALUES (%s, %s, %s, %s)",
            (user_id, pet_sex, pet_breed, pet_age)
        )
        conn.commit()

        # Generate verification token
        verification_token = jwt.encode(
            {
                "user_id": user_id,
                "email": email,
                "exp": datetime.utcnow() + timedelta(hours=24)
            },
            SECRET_KEY,
            algorithm="HS256"
        )
        
        # Store token in the database
        cursor.execute(
            "UPDATE users SET verification_token = %s WHERE id = %s",
            (verification_token, user_id)
        )
        conn.commit()
        
        # Try to send verification email
        try:
            # Construct the verification URL
            client_url = os.getenv('CLIENT_URL', 'http://localhost:5173')
            verification_url = f"{client_url}/verify-account?token={verification_token}"
            
            # Create and send email
            msg = Message(
                sender=current_app.config['MAIL_USERNAME'],
                subject="Verify Your Doggo Account",
                recipients=[email],
                html=f"""
                    <h1>Welcome to Doggo!</h1>
                    <p>Thank you for registering. Please click the link below to verify your account:</p>
                    <a href="{verification_url}">Verify Account</a>
                    <p>This link will expire in 24 hours.</p>
                """
            )
            
            mail.send(msg)
        except Exception as e:
            # Log the error but continue with registration
            current_app.logger.error(f"Error sending verification email: {str(e)}")

        # Return user_id in the response
        return jsonify({
            "message": "Registration successful. Please check your email to verify your account.", 
            "user_id": int(user_id),
            "email": email
        }), 201
    except Exception as e:
        # Rollback in case of error
        if conn:
            conn.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        if cursor:  # Ensure cursor is not None before closing
            cursor.close()
            
                    
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    cursor = None
    try:
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        # Retrieve user by email
        cursor.execute("SELECT id, email, password FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password."}), 401

        user_id, user_email, hashed_password = user

        # Check password
        if not check_password_hash(hashed_password, password):
            return jsonify({"error": "Invalid email or password."}), 401

        # Generate tokens
        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))

        # Update refresh token and last login
        cursor.execute("UPDATE users SET refresh_token = %s WHERE id = %s", (refresh_token, user_id))
        conn.commit()

  

        return jsonify({"token": access_token, "refresh_token": refresh_token, "id": user_id }), 200
    
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
    finally:
        if cursor:
            cursor.close()


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    cursor = None
    try:
        # Use the existing mysql connection from flask-mysqldb
        cursor = mysql.connection.cursor()
        cursor.execute("USE doggo")  # Make sure we're using the right database

        # Check if the user exists in the database
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found with this email"}), 404

        # Create a reset token
        reset_token = jwt.encode(
            {
                "email": email,  # Use email from request since user is a tuple
                "exp": datetime.utcnow() + timedelta(hours=1)
            },
            current_app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        # Construct the reset URL
        client_url = os.getenv('CLIENT_URL', 'http://localhost:5173')
        reset_url = f"{client_url}/reset-password?token={reset_token}"

        # Define email options
        msg = Message(
            sender=current_app.config['MAIL_USERNAME'],
            subject="Password Reset Request",
            recipients=[email],
            html=f"""
                <h1>Password Reset</h1>
                <p>Click the link below to reset your password:</p>
                <a href="{reset_url}">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            """
        )

        # Send the email
        mail.send(msg)

        # Commit any database changes
        mysql.connection.commit()

        return jsonify({"message": "Password reset link sent to your email."}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "Error sending reset link. Please try again later."}), 500

    finally:
        if cursor:
            cursor.close()

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('newPassword')

    if not token or not new_password:
        return jsonify({"message": "Token and new password are required."}), 400

    try:
        # Decode the JWT token
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email = decoded.get('email')
        print(f"Decoded email: {email}")

        if not email:
            return jsonify({"message": "Invalid token."}), 400

        # Hash the new password
        hashed_password = generate_password_hash(new_password)

        # Update the user's password in the database
        connection = mysql.connection
        cursor = connection.cursor()
        cursor.execute("USE doggo")
        sql = "UPDATE users SET password = %s WHERE email = %s"
        cursor.execute(sql, (hashed_password, email))
        connection.commit()

        return jsonify({"message": "Password has been reset successfully."}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token."}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "An error occurred while resetting the password."}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()


@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    return jsonify(logged_in_as=current_user_id), 200

@auth_bp.route('/refresh-token', methods=['POST'])
def refresh_token():
    data = request.json
    refresh_token = data.get('refresh_token')
    
    if not refresh_token:
        return jsonify({"error": "Refresh token is required."}), 401

    try:
        
        decoded = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get("id")
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")

        cursor.execute("SELECT id, email FROM users WHERE id = %s AND refresh_token = %s", (user_id, refresh_token))
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid refresh token."}), 403

        new_token = create_access_token(identity=user_id)
        return jsonify({"token": new_token}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Refresh token has expired."}), 403
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid refresh token."}), 403
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@auth_bp.route("/verify-token", methods=["GET"])
def verify_token():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Unauthorized: No token provided"}), 401

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        return jsonify({"message": "Token is valid", "user": decoded}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Invalid or expired token"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token"}), 401
    
@auth_bp.route('/send-verification', methods=['POST'])
def send_verification():
    data = request.get_json()
    email = data.get('email')
    user_id = data.get('user_id')
    
    if not email or not user_id:
        return jsonify({"error": "Email and user ID are required."}), 400
    
    cursor = None
    try:
        # Generate verification token
        verification_token = jwt.encode(
            {
                "user_id": user_id,
                "email": email,
                "exp": datetime.utcnow() + timedelta(hours=24)
            },
            SECRET_KEY,
            algorithm="HS256"
        )
        
        # Store token in the database
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        
        # Update the user with the verification token
        cursor.execute(
            "UPDATE users SET verification_token = %s WHERE id = %s AND email = %s",
            (verification_token, user_id, email)
        )
        conn.commit()
        
        # Construct the verification URL
        client_url = os.getenv('CLIENT_URL', 'http://localhost:5173')
        verification_url = f"{client_url}/verify-account?token={verification_token}"
        
        # Create and send email
        msg = Message(
            sender=current_app.config['MAIL_USERNAME'],
            subject="Verify Your Doggo Account",
            recipients=[email],
            html=f"""
                <h1>Welcome to Doggo!</h1>
                <p>Thank you for registering. Please click the link below to verify your account:</p>
                <a href="{verification_url}">Verify Account</a>
                <p>This link will expire in 24 hours.</p>
            """
        )
        
        mail.send(msg)
        
        return jsonify({"message": "Verification email sent successfully."}), 200
        
    except Exception as e:
        current_app.logger.error(f"Verification email error: {str(e)}")
        if conn:
            conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
        
    finally:
        if cursor:
            cursor.close()

@auth_bp.route('/verify-account', methods=['GET'])
def verify_account():
    token = request.args.get('token')
    
    if not token:
        return jsonify({"error": "Verification token is required."}), 400
    
    cursor = None
    try:
        # Decode the token
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get('user_id')
        email = decoded.get('email')
        
        # Verify in database
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")
        
        # Check if token matches
        cursor.execute(
            "SELECT id FROM users WHERE id = %s AND email = %s AND verification_token = %s",
            (user_id, email, token)
        )
        user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "Invalid verification token."}), 400
        
        # Update user to verified status
        cursor.execute(
            "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = %s",
            (user_id,)
        )
        conn.commit()
        
        # Redirect to a success page
        return jsonify({"message": "Account verified successfully!"}), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Verification token has expired."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid verification token."}), 400
    except Exception as e:
        current_app.logger.error(f"Account verification error: {str(e)}")
        if conn:
            conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
        
    finally:
        if cursor:
            cursor.close()
