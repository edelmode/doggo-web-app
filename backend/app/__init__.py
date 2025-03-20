from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .extensions import mysql, mail 
from .routes import auth
from flask_jwt_extended import JWTManager
from .routes.auth import auth_bp 
from .routes.user_blueprint import user_bp 
from .routes.email import email_bp  
import os

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

    #Initialize Mail
    mail.init_app(app)

    # Initialize extensions
    mysql.init_app(app)

    # Enable CORS for the whole app and the specific blueprint
    CORS(app, origins=["http://localhost:5173"], methods=["GET", "POST", "PUT", "OPTIONS"])
    CORS(user_bp, origins=["http://localhost:5173"], methods=["GET", "POST", "PUT","OPTIONS"])  # Enable CORS for user blueprint
    CORS(auth_bp, origins=["http://localhost:5173"], methods=["GET", "POST", "OPTIONS"])  # Enable CORS for auth blueprint
    CORS(email_bp, origins=["http://localhost:5173"], methods=["GET", "POST", "OPTIONS"])  # Enable CORS for email blueprint

    # Ensure that the connection uses the specified database
    app.config['MYSQL_DATABASE'] = 'doggo'

    # Register blueprints
    app.register_blueprint(auth_bp)  # Register auth blueprint
    app.register_blueprint(user_bp)  # Register user blueprint
    app.register_blueprint(email_bp)  # Register email blueprint

    return app
