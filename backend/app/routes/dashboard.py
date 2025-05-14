from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.extensions import mysql
import json

# Create a Blueprint for dashboard-related routes
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/save-emotion', methods=['POST'])
def save_emotion():
    cursor = None  # Initialize cursor to None
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
        
        # Get user_id directly from request body instead of JWT
        user_id = data.get('user_id')
        emotion = data.get('emotion')
        confidence = data.get('confidence', 0)
        
        # Debug logging
        print(f"Received save-emotion request: user_id={user_id}, emotion={emotion}, confidence={confidence}")
        
        if not user_id:
            return jsonify({"status": "error", "message": "No user_id provided"}), 400
            
        if not emotion:
            return jsonify({"status": "error", "message": "No emotion provided"}), 400
            
        # Map detected emotion to database column
        emotion = emotion.lower()
        if 'happy' in emotion:
            emotion_column = 'happiness'
        elif 'relax' in emotion:
            emotion_column = 'relaxed'
        elif 'anger' in emotion or 'angry' in emotion:
            emotion_column = 'anger'
        elif 'fear' in emotion or 'afraid' in emotion or 'scared' in emotion:
            emotion_column = 'fear'
        else:
            return jsonify({"status": "error", "message": f"Invalid emotion: {emotion}"}), 400
        
        # Get current date info for the week calculation
        today = datetime.now().date()
        # Calculate the start of the week (assuming weeks start on Monday)
        week_start_date = today - timedelta(days=today.weekday())
        # Get day of week (1-7, where 1 is Monday)
        day_of_week = today.weekday() + 1
        
        # Debug: Print calculated date and day values
        print(f"Current date: {today}, week_start_date: {week_start_date}, day_of_week: {day_of_week}")
        
        # Connect to DB
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")  # Explicitly select the database
        
        # Check if entry exists for this user, week start date, and day of week
        cursor.execute(
            """SELECT * FROM dog_emotion_stats 
               WHERE user_id = %s AND week_start_date = %s AND day_of_week = %s""",
            (user_id, week_start_date, day_of_week)
        )
        existing_record = cursor.fetchone()
        
        if existing_record:
            # Update existing record - increment the emotion count and specific emotion
            query = f"""
                UPDATE dog_emotion_stats 
                SET {emotion_column} = {emotion_column} + 1,
                    emotion_count = emotion_count + 1,
                    updated_at = NOW() 
                WHERE user_id = %s AND week_start_date = %s AND day_of_week = %s
            """
            cursor.execute(query, (user_id, week_start_date, day_of_week))
        else:
            # Create new record with default 0 for all emotions except the detected one
            query = """
                INSERT INTO dog_emotion_stats 
                (user_id, week_start_date, day_of_week, emotion_count, happiness, relaxed, anger, fear) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
            # Initialize all emotion values to 0
            values = [user_id, week_start_date, day_of_week, 1, 0, 0, 0, 0]
            
            # Set the detected emotion to 1
            if emotion_column == 'happiness':
                values[4] = 1
            elif emotion_column == 'relaxed':
                values[5] = 1
            elif emotion_column == 'anger':
                values[6] = 1
            elif emotion_column == 'fear':
                values[7] = 1
                
            cursor.execute(query, values)
            
        conn.commit()
        
        return jsonify({
            "status": "success", 
            "message": f"Emotion {emotion} recorded successfully",
            "debug": {
                "date": today.strftime('%Y-%m-%d'),
                "week_start": week_start_date.strftime('%Y-%m-%d'),
                "day_of_week": day_of_week
            }
        }), 200
        
    except Exception as e:
        error_message = str(e)
        print(f"Error in save-emotion endpoint: {error_message}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": error_message}), 500
    finally:
        if cursor:  # Ensure cursor is not None before closing
            cursor.close()

@dashboard_bp.route('/stats', methods=['GET'])
def get_emotion_stats():
    """
    Get emotion statistics for the current user.
    Required query parameter:
    - user_id: the ID of the user to fetch stats for
    Optional query parameters:
    - period: 'week', 'month' (default: 'month')
    - week_start: specific week start date to fetch (if period is 'week')
    """
    cursor = None
    try:
        user_id = request.args.get('user_id')
        period = request.args.get('period', 'month')
        week_start = request.args.get('week_start')
        
        if not user_id:
            return jsonify({"status": "error", "message": "No user_id provided"}), 400
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")  # Explicitly select the database
        
        if period == 'week' and week_start:
            # Fetch data for a specific week
            query = """
                SELECT 
                    week_start_date, 
                    day_of_week,
                    emotion_count,
                    happiness, 
                    relaxed, 
                    anger, 
                    fear 
                FROM dog_emotion_stats 
                WHERE user_id = %s AND week_start_date = %s
                ORDER BY day_of_week
            """
            cursor.execute(query, (user_id, week_start))
            
        else:
            # Default: fetch data for the current month
            today = datetime.now().date()
            first_day_of_month = today.replace(day=1)
            
            query = """
                SELECT 
                    week_start_date, 
                    day_of_week,
                    emotion_count,
                    happiness, 
                    relaxed, 
                    anger, 
                    fear 
                FROM dog_emotion_stats 
                WHERE user_id = %s AND week_start_date >= %s
                ORDER BY week_start_date, day_of_week
            """
            cursor.execute(query, (user_id, first_day_of_month))
        
        results = cursor.fetchall()
        
        # Convert results to proper format for frontend
        formatted_results = []
        column_names = [desc[0] for desc in cursor.description]
        
        for row in results:
            result_dict = dict(zip(column_names, row))
            # Convert date objects to string
            if 'week_start_date' in result_dict:
                result_dict['week_start_date'] = result_dict['week_start_date'].strftime('%Y-%m-%d')
            formatted_results.append(result_dict)
            
        # Organize data by weeks
        weeks_data = {}
        for record in formatted_results:
            week_start = record.get('week_start_date')
            if week_start not in weeks_data:
                weeks_data[week_start] = []
            weeks_data[week_start].append(record)
            
        return jsonify({
            "status": "success",
            "data": formatted_results,
            "weeks": weeks_data
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor:  # Ensure cursor is not None before closing
            cursor.close()


@dashboard_bp.route('/weekly-summary', methods=['GET'])
def get_weekly_summary():
    """
    Get a weekly summary of emotions grouped by day.
    Required query parameter:
    - user_id: the ID of the user to fetch stats for
    """
    cursor = None
    try:
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({"status": "error", "message": "No user_id provided"}), 400
            
        today = datetime.now().date()
        first_day_of_month = today.replace(day=1)
        
        conn = mysql.connection
        cursor = conn.cursor()
        cursor.execute("USE doggo")  # Explicitly select the database
        
        # Get distinct weeks in the current month
        cursor.execute(
            """
            SELECT DISTINCT week_start_date 
            FROM dog_emotion_stats 
            WHERE user_id = %s AND week_start_date >= %s
            ORDER BY week_start_date
            """,
            (user_id, first_day_of_month)
        )
        weeks = [row[0] for row in cursor.fetchall()]
        
        result = []
        
        # For each week, get data summarized by day
        for week_start in weeks:
            cursor.execute(
                """
                SELECT 
                    day_of_week,
                    SUM(emotion_count) as total_emotions,
                    SUM(happiness) as happiness, 
                    SUM(relaxed) as relaxed, 
                    SUM(anger) as anger, 
                    SUM(fear) as fear
                FROM dog_emotion_stats 
                WHERE user_id = %s AND week_start_date = %s
                GROUP BY day_of_week
                ORDER BY day_of_week
                """,
                (user_id, week_start)
            )
            
            days_data = []
            for row in cursor.fetchall():
                days_data.append({
                    "day": f"Day {row[0]}",
                    "total_emotions": row[1],
                    "happiness": row[2],
                    "relaxed": row[3],
                    "anger": row[4],
                    "fear": row[5]
                })
            
            # Format the week label
            week_label = f"Week of {week_start.strftime('%b %d')}" if isinstance(week_start, datetime) else f"Week of {week_start}"
            
            result.append({
                "week_start": week_start.strftime('%Y-%m-%d') if isinstance(week_start, datetime) else week_start,
                "label": week_label,
                "days": days_data
            })
        
        return jsonify({
            "status": "success",
            "weeks": result
        }), 200
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if cursor:  # Ensure cursor is not None before closing
            cursor.close()