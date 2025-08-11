#!/usr/bin/env python3
"""
Flask API Server for IntellGrade System
Handles all database operations and provides RESTful API endpoints
"""

import os
import json
import bcrypt
import mysql.connector
from datetime import datetime
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'intellgrade-secret-key-2024')
CORS(app, supports_credentials=True)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'intellgrade_db'),
    'charset': 'utf8mb4',
    'autocommit': True
}

def get_db_connection():
    """Create and return database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection error: {err}")
        return None

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def calculate_grade(score):
    """Calculate grade based on score"""
    if score >= 90: return 'A+'
    elif score >= 85: return 'A'
    elif score >= 80: return 'A-'
    elif score >= 75: return 'B+'
    elif score >= 70: return 'B'
    elif score >= 65: return 'B-'
    elif score >= 60: return 'C+'
    elif score >= 55: return 'C'
    elif score >= 50: return 'C-'
    elif score >= 45: return 'D+'
    elif score >= 40: return 'D'
    else: return 'F'

def analyze_sentiment(feedbacks):
    """Analyze sentiment of feedbacks"""
    if not feedbacks:
        return {'positive': 0, 'neutral': 0, 'negative': 0, 'total': 0}
    
    positive_words = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding', 'perfect', 'love', 'enjoy', 'helpful', 'clear', 'understand', 'learn', 'improve']
    negative_words = ['bad', 'poor', 'terrible', 'awful', 'horrible', 'confusing', 'difficult', 'hard', 'boring', 'waste', 'disappoint', 'frustrate', 'hate', 'dislike']
    
    positive = neutral = negative = 0
    
    for feedback in feedbacks:
        rating = feedback['rating']
        comment = feedback.get('comment', '').lower()
        
        # Rating-based sentiment
        if rating >= 4:
            positive += 1
        elif rating <= 2:
            negative += 1
        else:
            neutral += 1
        
        # Comment-based sentiment
        positive_score = sum(1 for word in positive_words if word in comment)
        negative_score = sum(1 for word in negative_words if word in comment)
        
        # Adjust sentiment based on comment analysis
        if positive_score > negative_score and rating == 3:
            neutral -= 1
            positive += 1
        elif negative_score > positive_score and rating == 3:
            neutral -= 1
            negative += 1
    
    total = len(feedbacks)
    return {
        'positive': positive,
        'neutral': neutral,
        'negative': negative,
        'total': total,
        'positivePercentage': round((positive / total) * 100, 1) if total > 0 else 0,
        'neutralPercentage': round((neutral / total) * 100, 1) if total > 0 else 0,
        'negativePercentage': round((negative / total) * 100, 1) if total > 0 else 0
    }

# Authentication endpoints
@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        # Check if input is username (id) or email
        cursor.execute("SELECT * FROM users WHERE id = %s OR email = %s", (username, username))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user and verify_password(password, user['password']):
            session['user_id'] = user['id']
            session['user_role'] = user['role']
            session['user_name'] = user['name']
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'role': user['role']
                }
            })
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """User logout endpoint"""
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'name': session['user_name'],
                'role': session['user_role']
            }
        })
    return jsonify({'authenticated': False}), 401

# Student endpoints
@app.route('/api/student/results', methods=['GET'])
def get_student_results():
    """Get results for current student"""
    if 'user_id' not in session or session['user_role'] != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.*, c.code as course_code, c.title as course_title, c.unit
            FROM results r
            JOIN courses c ON r.course_id = c.id
            WHERE r.student_id = %s
            ORDER BY r.session DESC, r.semester DESC, c.code
        """, (session['user_id'],))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Group by session and semester
        organized_results = {}
        for result in results:
            session_key = f"{result['session']}-{result['semester']}"
            if session_key not in organized_results:
                organized_results[session_key] = {
                    'session': result['session'],
                    'semester': result['semester'],
                    'courses': []
                }
            organized_results[session_key]['courses'].append(result)
        
        return jsonify({
            'success': True,
            'results': list(organized_results.values())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/student/transcript', methods=['GET'])
def get_student_transcript():
    """Get complete transcript for current student"""
    if 'user_id' not in session or session['user_role'] != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get student info
        cursor.execute("SELECT * FROM users WHERE id = %s", (session['user_id'],))
        student = cursor.fetchone()
        
        # Get all results
        cursor.execute("""
            SELECT r.*, c.code as course_code, c.title as course_title, c.unit
            FROM results r
            JOIN courses c ON r.course_id = c.id
            WHERE r.student_id = %s
            ORDER BY r.session DESC, r.semester DESC, c.code
        """, (session['user_id'],))
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Calculate statistics
        total_credits = sum(result['unit'] for result in results)
        completed_courses = len(results)
        total_score = sum(result['score'] for result in results)
        gpa = total_score / len(results) if results else 0
        
        # Group by session and semester
        organized_results = {}
        for result in results:
            session_key = f"{result['session']}-{result['semester']}"
            if session_key not in organized_results:
                organized_results[session_key] = {
                    'session': result['session'],
                    'semester': result['semester'],
                    'courses': [],
                    'semester_credits': 0,
                    'semester_gpa': 0
                }
            organized_results[session_key]['courses'].append(result)
            organized_results[session_key]['semester_credits'] += result['unit']
        
        # Calculate semester GPAs
        for semester_data in organized_results.values():
            semester_scores = [course['score'] for course in semester_data['courses']]
            semester_data['semester_gpa'] = sum(semester_scores) / len(semester_scores) if semester_scores else 0
        
        return jsonify({
            'success': True,
            'student': {
                'id': student['id'],
                'name': student['name'],
                'email': student['email']
            },
            'summary': {
                'total_credits': total_credits,
                'completed_courses': completed_courses,
                'overall_gpa': round(gpa, 2),
                'total_semesters': len(organized_results)
            },
            'results': list(organized_results.values())
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Feedback endpoints
@app.route('/api/feedback/submit', methods=['POST'])
def submit_feedback():
    """Submit new feedback"""
    if 'user_id' not in session or session['user_role'] != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        course_id = data.get('course_id')
        lecturer_id = data.get('lecturer_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        semester = data.get('semester')
        
        if not all([course_id, lecturer_id, rating, semester]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if not (1 <= rating <= 5):
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Check if feedback already exists
        cursor.execute("""
            SELECT id FROM feedbacks 
            WHERE student_id = %s AND course_id = %s AND lecturer_id = %s AND semester = %s
        """, (session['user_id'], course_id, lecturer_id, semester))
        
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Feedback already submitted for this course and semester'}), 400
        
        # Generate feedback ID
        feedback_id = f"FB_{int(datetime.now().timestamp())}_{session['user_id']}"
        
        # Insert feedback
        cursor.execute("""
            INSERT INTO feedbacks (id, student_id, course_id, lecturer_id, rating, comment, semester)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (feedback_id, session['user_id'], course_id, lecturer_id, rating, comment, semester))
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Feedback submitted successfully! Your response is anonymous.'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback/courses', methods=['GET'])
def get_feedback_courses():
    """Get courses available for feedback"""
    if 'user_id' not in session or session['user_role'] != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT DISTINCT c.id, c.code, c.title, u.id as lecturer_id, u.name as lecturer_name
            FROM courses c
            JOIN lecturer_courses lc ON c.id = lc.course_id
            JOIN users u ON lc.lecturer_id = u.id
            WHERE u.role = 'lecturer'
            ORDER BY c.code
        """)
        
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'courses': courses
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Lecturer endpoints
@app.route('/api/lecturer/feedback', methods=['GET'])
def get_lecturer_feedback():
    """Get feedback for current lecturer"""
    if 'user_id' not in session or session['user_role'] != 'lecturer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get feedback for lecturer
        cursor.execute("""
            SELECT f.*, c.code as course_code, c.title as course_title, c.unit
            FROM feedbacks f
            JOIN courses c ON f.course_id = c.id
            WHERE f.lecturer_id = %s
            ORDER BY f.created_at DESC
        """, (session['user_id'],))
        
        feedbacks = cursor.fetchall()
        
        # Get courses taught by lecturer
        cursor.execute("""
            SELECT c.id, c.code, c.title, c.unit
            FROM courses c
            JOIN lecturer_courses lc ON c.id = lc.course_id
            WHERE lc.lecturer_id = %s
            ORDER BY c.code
        """, (session['user_id'],))
        
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Calculate analytics
        total_feedbacks = len(feedbacks)
        average_rating = sum(f['rating'] for f in feedbacks) / total_feedbacks if total_feedbacks > 0 else 0
        
        # Course-wise analytics
        course_analytics = []
        for course in courses:
            course_feedbacks = [f for f in feedbacks if f['course_id'] == course['id']]
            if course_feedbacks:
                course_avg = sum(f['rating'] for f in course_feedbacks) / len(course_feedbacks)
                course_analytics.append({
                    'course_id': course['id'],
                    'course_code': course['code'],
                    'course_title': course['title'],
                    'unit': course['unit'],
                    'total_feedbacks': len(course_feedbacks),
                    'average_rating': round(course_avg, 1),
                    'sentiment': analyze_sentiment(course_feedbacks)
                })
        
        # Overall sentiment analysis
        overall_sentiment = analyze_sentiment(feedbacks)
        
        return jsonify({
            'success': True,
            'analytics': {
                'total_feedbacks': total_feedbacks,
                'average_rating': round(average_rating, 1),
                'total_courses': len(courses),
                'sentiment': overall_sentiment,
                'courses': course_analytics,
                'recent_feedbacks': feedbacks[:10]  # Last 10 feedbacks
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lecturer/courses', methods=['GET'])
def get_lecturer_courses():
    """Get courses for current lecturer"""
    if 'user_id' not in session or session['user_role'] != 'lecturer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.*, d.name as department_name,
                   COUNT(DISTINCT r.student_id) as student_count,
                   AVG(f.rating) as average_rating
            FROM courses c
            JOIN lecturer_courses lc ON c.id = lc.course_id
            JOIN departments d ON c.department_id = d.id
            LEFT JOIN results r ON c.id = r.course_id
            LEFT JOIN feedbacks f ON c.id = f.course_id
            WHERE lc.lecturer_id = %s
            GROUP BY c.id, c.title, c.code, c.unit, c.department_id, c.description, c.created_at, d.name
            ORDER BY c.code
        """, (session['user_id'],))
        
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'courses': courses
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lecturer/students', methods=['GET'])
def get_lecturer_students():
    """Get students for current lecturer's courses"""
    if 'user_id' not in session or session['user_role'] != 'lecturer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT DISTINCT u.id, u.name, u.email, d.name as department,
                   COUNT(DISTINCT r.course_id) as course_count
            FROM users u
            JOIN results r ON u.id = r.student_id
            JOIN courses c ON r.course_id = c.id
            JOIN lecturer_courses lc ON c.id = lc.course_id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE lc.lecturer_id = %s AND u.role = 'student'
            GROUP BY u.id, u.name, u.email, d.name
            ORDER BY u.name
        """, (session['user_id'],))
        
        students = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'students': students
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lecturer/reports', methods=['GET'])
def get_lecturer_reports():
    """Get reports for current lecturer"""
    if 'user_id' not in session or session['user_role'] != 'lecturer':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        # For now, return sample reports
        # In a real implementation, this would query a reports table
        sample_reports = [
            {
                'id': 1,
                'title': 'Course Performance Report',
                'description': 'Comprehensive analysis of student performance in all courses',
                'type': 'performance',
                'generatedAt': '2024-01-15T10:30:00Z'
            },
            {
                'id': 2,
                'title': 'Feedback Analysis Report',
                'description': 'Detailed feedback analysis and sentiment overview',
                'type': 'feedback',
                'generatedAt': '2024-01-10T14:20:00Z'
            },
            {
                'id': 3,
                'title': 'Student Progress Report',
                'description': 'Individual student progress tracking and recommendations',
                'type': 'progress',
                'generatedAt': '2024-01-05T09:15:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'reports': sample_reports
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin endpoints
@app.route('/api/admin/overview', methods=['GET'])
def get_admin_overview():
    """Get admin dashboard overview"""
    if 'user_id' not in session or session['user_role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get counts
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'")
        student_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'lecturer'")
        lecturer_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM courses")
        course_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM results")
        result_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM feedbacks")
        feedback_count = cursor.fetchone()['count']
        
        # Get recent feedbacks
        cursor.execute("""
            SELECT f.*, c.code as course_code, c.title as course_title, 
                   l.name as lecturer_name, s.name as student_name
            FROM feedbacks f
            JOIN courses c ON f.course_id = c.id
            JOIN users l ON f.lecturer_id = l.id
            JOIN users s ON f.student_id = s.id
            ORDER BY f.created_at DESC
            LIMIT 10
        """)
        
        recent_feedbacks = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'overview': {
                'students': student_count,
                'lecturers': lecturer_count,
                'courses': course_count,
                'results': result_count,
                'feedbacks': feedback_count,
                'recent_feedbacks': recent_feedbacks
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/feedback', methods=['GET'])
def get_all_feedback():
    """Get all feedback for admin"""
    if 'user_id' not in session or session['user_role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        
        # Get all feedback with details
        cursor.execute("""
            SELECT f.*, c.code as course_code, c.title as course_title, 
                   l.name as lecturer_name, s.name as student_name
            FROM feedbacks f
            JOIN courses c ON f.course_id = c.id
            JOIN users l ON f.lecturer_id = l.id
            JOIN users s ON f.student_id = s.id
            ORDER BY f.created_at DESC
        """)
        
        feedbacks = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Calculate overall analytics
        total_feedbacks = len(feedbacks)
        average_rating = sum(f['rating'] for f in feedbacks) / total_feedbacks if total_feedbacks > 0 else 0
        overall_sentiment = analyze_sentiment(feedbacks)
        
        return jsonify({
            'success': True,
            'feedbacks': feedbacks,
            'analytics': {
                'total_feedbacks': total_feedbacks,
                'average_rating': round(average_rating, 1),
                'sentiment': overall_sentiment
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Results management endpoints
@app.route('/api/results/add', methods=['POST'])
def add_result():
    """Add new result (admin/lecturer only)"""
    if 'user_id' not in session or session['user_role'] not in ['admin', 'lecturer']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        course_id = data.get('course_id')
        score = data.get('score')
        session_year = data.get('session')
        semester = data.get('semester')
        
        if not all([student_id, course_id, score, session_year, semester]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if not (0 <= score <= 100):
            return jsonify({'error': 'Score must be between 0 and 100'}), 400
        
        grade = calculate_grade(score)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Check if result already exists
        cursor.execute("""
            SELECT id FROM results 
            WHERE student_id = %s AND course_id = %s AND session = %s AND semester = %s
        """, (student_id, course_id, session_year, semester))
        
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Result already exists for this student, course, and semester'}), 400
        
        # Insert result
        cursor.execute("""
            INSERT INTO results (student_id, course_id, score, grade, session, semester)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (student_id, course_id, score, grade, session_year, semester))
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Result added successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/results/update', methods=['PUT'])
def update_result():
    """Update existing result (admin/lecturer only)"""
    if 'user_id' not in session or session['user_role'] not in ['admin', 'lecturer']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        result_id = data.get('result_id')
        score = data.get('score')
        
        if not result_id or score is None:
            return jsonify({'error': 'Result ID and score are required'}), 400
        
        if not (0 <= score <= 100):
            return jsonify({'error': 'Score must be between 0 and 100'}), 400
        
        grade = calculate_grade(score)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE results SET score = %s, grade = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (score, grade, result_id))
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Result not found'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Result updated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Utility endpoints
@app.route('/api/users/students', methods=['GET'])
def get_students():
    """Get all students"""
    if 'user_id' not in session or session['user_role'] not in ['admin', 'lecturer']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email FROM users WHERE role = 'student' ORDER BY name")
        students = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'students': students
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get all courses"""
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.*, d.name as department_name
            FROM courses c
            JOIN departments d ON c.department_id = d.id
            ORDER BY c.code
        """)
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'courses': courses
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Get all departments"""
    if 'user_id' not in session or session['user_role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM departments ORDER BY name")
        departments = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'departments': departments
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments', methods=['POST'])
def add_department():
    """Add new department"""
    if 'user_id' not in session or session['user_role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        name = data.get('name')
        code = data.get('code')
        
        if not name or not code:
            return jsonify({'error': 'Department name and code are required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Check if department code already exists
        cursor.execute("SELECT id FROM departments WHERE code = %s", (code,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Department code already exists'}), 400
        
        # Insert new department
        cursor.execute("INSERT INTO departments (name, code) VALUES (%s, %s)", (name, code))
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Department added successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments/<int:dept_id>', methods=['PUT'])
def update_department(dept_id):
    """Update department"""
    if 'user_id' not in session or session['user_role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        data = request.get_json()
        name = data.get('name')
        code = data.get('code')
        
        if not name or not code:
            return jsonify({'error': 'Department name and code are required'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Check if department code already exists for other departments
        cursor.execute("SELECT id FROM departments WHERE code = %s AND id != %s", (code, dept_id))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Department code already exists'}), 400
        
        # Update department
        cursor.execute("UPDATE departments SET name = %s, code = %s WHERE id = %s", (name, code, dept_id))
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Department not found'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Department updated successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/departments/<int:dept_id>', methods=['DELETE'])
def delete_department(dept_id):
    """Delete department"""
    if 'user_id' not in session or session['user_role'] != 'admin':
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = conn.cursor()
        
        # Check if department has courses
        cursor.execute("SELECT COUNT(*) FROM courses WHERE department_id = %s", (dept_id,))
        course_count = cursor.fetchone()[0]
        
        if course_count > 0:
            cursor.close()
            conn.close()
            return jsonify({'error': f'Cannot delete department. It has {course_count} course(s) assigned to it.'}), 400
        
        # Delete department
        cursor.execute("DELETE FROM departments WHERE id = %s", (dept_id,))
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({'error': 'Department not found'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Department deleted successfully'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 IntellGrade API Server Starting...")
    print("=" * 60)
    print("📊 Database: MySQL")
    print("🔗 API Endpoints: http://localhost:5000/api/")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 