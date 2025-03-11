import os

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST') or exit("Missing environment variable: MYSQL_HOST")
    MYSQL_PORT = int(os.getenv('MYSQL_PORT') or exit("Missing environment variable: MYSQL_PORT"))
    MYSQL_USER = os.getenv('MYSQL_USER') or exit("Missing environment variable: MYSQL_USER")
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD') or exit("Missing environment variable: MYSQL_PASSWORD")
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE') or exit("Missing environment variable: MYSQL_DATABASE")
    SECRET_KEY = os.getenv('SECRET_KEY') or exit("Missing environment variable: SECRET_KEY")
    REFRESH_SECRET_KEY = os.getenv('REFRESH_SECRET_KEY') or exit("Missing environment variable: REFRESH_SECRET_KEY")
    MAIL_USERNAME = os.getenv('MAIL_USERNAME') or exit("Missing environment variable: MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD') or exit("Missing environment variable: MAIL_PASSWORD")

    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # Directory to store uploaded images
    MAX_CONTENT_LENGTH = 2 * 1024 * 1024  # Limit file size to 2 MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'} 