-- IntellGrade Database Schema
-- MySQL Database for Academic Management System

-- Create database
CREATE DATABASE IF NOT EXISTS intellgrade_db;
USE intellgrade_db;

-- Users table (admin, student, lecturer)
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student', 'lecturer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    unit INT NOT NULL DEFAULT 3,
    department_id INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Results table
CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    course_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    grade CHAR(2),
    session VARCHAR(10) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (student_id, course_id, session, semester)
);

-- Feedbacks table
CREATE TABLE feedbacks (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    course_id INT NOT NULL,
    lecturer_id VARCHAR(20) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    semester VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_feedback (student_id, course_id, lecturer_id, semester)
);

-- Lecturer courses pivot table (many-to-many)
CREATE TABLE lecturer_courses (
    lecturer_id VARCHAR(20) NOT NULL,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lecturer_id, course_id),
    FOREIGN KEY (lecturer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_results_student ON results(student_id);
CREATE INDEX idx_results_course ON results(course_id);
CREATE INDEX idx_results_session_semester ON results(session, semester);
CREATE INDEX idx_feedbacks_student ON feedbacks(student_id);
CREATE INDEX idx_feedbacks_course ON feedbacks(course_id);
CREATE INDEX idx_feedbacks_lecturer ON feedbacks(lecturer_id);
CREATE INDEX idx_feedbacks_semester ON feedbacks(semester);
CREATE INDEX idx_courses_department ON courses(department_id);

-- Sample data insertion
-- Departments
INSERT INTO departments (name, code) VALUES 
('Computer Science', 'CS'),
('Mathematics', 'MATH'),
('Physics', 'PHY'),
('Engineering', 'ENG');

-- Users (passwords are hashed with bcrypt)
INSERT INTO users (id, name, email, password, role) VALUES 
('ADMIN001', 'System Administrator', 'admin@intellgrade.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'admin'),
('LECT001', 'Dr. John Smith', 'john.smith@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'lecturer'),
('LECT002', 'Dr. Sarah Johnson', 'sarah.johnson@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'lecturer'),
('LECT003', 'Prof. Michael Brown', 'michael.brown@university.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'lecturer'),
('STU001', 'Alice Johnson', 'alice.johnson@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'student'),
('STU002', 'Bob Wilson', 'bob.wilson@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'student'),
('STU003', 'Carol Davis', 'carol.davis@student.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8mti', 'student');

-- Courses
INSERT INTO courses (title, code, unit, department_id, description) VALUES 
('Introduction to Programming', 'CS101', 3, 1, 'Basic programming concepts and problem solving'),
('Data Structures and Algorithms', 'CS201', 4, 1, 'Advanced data structures and algorithm analysis'),
('Database Management Systems', 'CS301', 3, 1, 'Database design and SQL programming'),
('Web Development', 'CS401', 3, 1, 'Modern web development technologies'),
('Calculus I', 'MATH101', 4, 2, 'Differential and integral calculus'),
('Linear Algebra', 'MATH201', 3, 2, 'Vector spaces and linear transformations'),
('Physics I', 'PHY101', 4, 3, 'Mechanics and thermodynamics'),
('Engineering Design', 'ENG101', 3, 4, 'Engineering principles and design process');

-- Lecturer courses assignments
INSERT INTO lecturer_courses (lecturer_id, course_id) VALUES 
('LECT001', 1), ('LECT001', 2),
('LECT002', 3), ('LECT002', 4),
('LECT003', 5), ('LECT003', 6);

-- Sample results
INSERT INTO results (student_id, course_id, score, grade, session, semester) VALUES 
('STU001', 1, 85.5, 'A', '2023/2024', '1'),
('STU001', 2, 78.0, 'B+', '2023/2024', '1'),
('STU001', 3, 92.0, 'A+', '2023/2024', '2'),
('STU001', 4, 88.5, 'A', '2023/2024', '2'),
('STU002', 1, 76.0, 'B', '2023/2024', '1'),
('STU002', 2, 82.5, 'B+', '2023/2024', '1'),
('STU002', 5, 79.0, 'B+', '2023/2024', '2'),
('STU003', 1, 91.0, 'A+', '2023/2024', '1'),
('STU003', 3, 87.0, 'A', '2023/2024', '2'),
('STU003', 6, 84.5, 'A', '2023/2024', '2');

-- Sample feedbacks
INSERT INTO feedbacks (id, student_id, course_id, lecturer_id, rating, comment, semester) VALUES 
('FB_001', 'STU001', 1, 'LECT001', 5, 'Excellent teaching style and very helpful explanations', '2023/2024-1'),
('FB_002', 'STU001', 2, 'LECT001', 4, 'Good course content but could use more examples', '2023/2024-1'),
('FB_003', 'STU002', 1, 'LECT001', 4, 'Clear explanations and good practical examples', '2023/2024-1'),
('FB_004', 'STU003', 1, 'LECT001', 5, 'Amazing instructor, very knowledgeable and patient', '2023/2024-1'),
('FB_005', 'STU001', 3, 'LECT002', 5, 'Great database course with hands-on projects', '2023/2024-2'),
('FB_006', 'STU003', 3, 'LECT002', 4, 'Good course but assignments were challenging', '2023/2024-2'),
('FB_007', 'STU002', 5, 'LECT003', 3, 'Course was okay but could be more engaging', '2023/2024-2'),
('FB_008', 'STU001', 5, 'LECT003', 4, 'Interesting mathematical concepts well explained', '2023/2024-2');

-- Create views for easier querying
CREATE VIEW student_results_view AS
SELECT 
    r.id,
    r.student_id,
    u.name as student_name,
    r.course_id,
    c.code as course_code,
    c.title as course_title,
    c.unit,
    r.score,
    r.grade,
    r.session,
    r.semester,
    r.created_at
FROM results r
JOIN users u ON r.student_id = u.id
JOIN courses c ON r.course_id = c.id
WHERE u.role = 'student';

CREATE VIEW lecturer_feedback_view AS
SELECT 
    f.id,
    f.student_id,
    s.name as student_name,
    f.course_id,
    c.code as course_code,
    c.title as course_title,
    f.lecturer_id,
    l.name as lecturer_name,
    f.rating,
    f.comment,
    f.semester,
    f.created_at
FROM feedbacks f
JOIN users s ON f.student_id = s.id
JOIN users l ON f.lecturer_id = l.id
JOIN courses c ON f.course_id = c.id
WHERE s.role = 'student' AND l.role = 'lecturer';

CREATE VIEW course_analytics_view AS
SELECT 
    c.id as course_id,
    c.code as course_code,
    c.title as course_title,
    c.unit,
    d.name as department_name,
    COUNT(DISTINCT r.student_id) as total_students,
    AVG(r.score) as average_score,
    COUNT(f.id) as total_feedbacks,
    AVG(f.rating) as average_rating
FROM courses c
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN results r ON c.id = r.course_id
LEFT JOIN feedbacks f ON c.id = f.course_id
GROUP BY c.id, c.code, c.title, c.unit, d.name; 