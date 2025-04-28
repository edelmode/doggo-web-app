from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import mysql, mail
from .routes.auth import auth_bp
from .routes.user_blueprint import user_bp
from .routes.email import email_bp
from .routes.gallery import gallery_bp
from .routes.dog_pose import dog_pose_bp
from .routes.camera import camera_bp
import os
from flask_jwt_extended import JWTManager

jwt = JWTManager()

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object('app.config.Config')

    app.config['DEBUG'] = True
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME') 
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['REFRESH_SECRET_KEY'] = os.environ.get('REFRESH_SECRET_KEY') 
    app.config['AZURE_STORAGE_ACCOUNT_NAME'] = os.environ.get('AZURE_STORAGE_ACCOUNT_NAME') 
    app.config['AZURE_STORAGE_ACCESS_KEY'] = os.environ.get('AZURE_STORAGE_ACCESS_KEY')
    app.config['AZURE_STORAGE_CONTAINER_NAME'] = os.environ.get('AZURE_STORAGE_CONTAINER_NAME')
    app.config['AZURE_STORAGE_CONNECTION_STRING'] = os.environ.get('AZURE_STORAGE_CONNECTION_STRING')          

    # Initialize JWT
    jwt.init_app(app)

    # Initialize Mail
    mail.init_app(app)

    # Initialize extensions
    mysql.init_app(app)

    # Enable CORS globally
    CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173"]}})

    # Ensure that the connection uses the specified database
    app.config['MYSQL_DATABASE'] = 'doggo'

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(email_bp, url_prefix="/api/email")
    app.register_blueprint(gallery_bp, url_prefix="/api/gallery")
    app.register_blueprint(dog_pose_bp, url_prefix="/api/dog-pose")
    app.register_blueprint(camera_bp, url_prefix="/api/camera")
    
    return app
