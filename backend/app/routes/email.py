from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from ..extensions import mail

# Define the email Blueprint
email_bp = Blueprint('email', __name__, url_prefix='/api/email')

@email_bp.route('/contact', methods=['POST'])
def contact_email():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    # Validate the input
    if not all([name, email, message]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        # Compose and send the email
        msg = Message(
            subject=f"Contact Form: Message from {name}",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[current_app.config['MAIL_USERNAME']],  # Send to your admin email
            reply_to=email,  # Set reply-to as the sender's email
            body=f"""
            New contact form submission:
            
            Name: {name}
            Email: {email}
            
            Message:
            {message}
            """
        )

        mail.send(msg)
        return jsonify({'message': 'Email sent successfully'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500

@email_bp.route('/subscribe', methods=['POST'])
def subscribe_email():
    # Parse data from the request
    data = request.json
    email = data.get('email')

    # Ensure email is a list for multiple recipients
    if isinstance(email, str):
        recipients = [email]  # Convert single email string to list
    elif isinstance(email, list):
        recipients = email
    else:
        return jsonify({'error': 'Invalid email format'}), 400

    try:
        # Create and send the email
        msg = Message(
            subject="Subscription Confirmation",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=recipients,
        )
        msg.body = f"Hi, thank you for subscribing to our updates!"

        mail.send(msg)
        return jsonify({'message': 'Email sent successfully'}), 200
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': str(e)}), 500
