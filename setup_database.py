#!/usr/bin/env python3
"""
Simple Database Setup Script
Creates the database and tables for IntellGrade
"""

import mysql.connector
import bcrypt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Set up the database and tables"""
    
    # Database configuration
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'charset': 'utf8mb4'
    }
    
    try:
        print("🔌 Connecting to MySQL...")
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        print("📖 Reading database schema...")
        with open('database_schema.sql', 'r', encoding='utf-8') as file:
            sql_commands = file.read()
        
        print("🗄️  Creating database and tables...")
        # Split and execute SQL commands
        commands = sql_commands.split(';')
        
        for command in commands:
            command = command.strip()
            if command:
                try:
                    cursor.execute(command)
                    print(f"✅ Executed: {command[:50]}...")
                except mysql.connector.Error as err:
                    if "already exists" not in str(err).lower():
                        print(f"⚠️  Warning: {err}")
        
        connection.commit()
        print("✅ Database setup completed successfully!")
        
        # Test the connection to the new database
        test_config = config.copy()
        test_config['database'] = 'intellgrade_db'
        
        test_connection = mysql.connector.connect(**test_config)
        test_cursor = test_connection.cursor()
        
        # Check if tables exist
        test_cursor.execute("SHOW TABLES")
        tables = test_cursor.fetchall()
        print(f"📋 Created {len(tables)} tables:")
        for table in tables:
            print(f"   - {table[0]}")
        
        test_cursor.close()
        test_connection.close()
        
        cursor.close()
        connection.close()
        
        print("\n🎉 Database is ready! You can now login with:")
        print("   Admin: admin@intellgrade.com / admin123")
        print("   Lecturer: john.smith@university.edu / lect123")
        print("   Student: alice.johnson@student.edu / stu123")
        
    except mysql.connector.Error as err:
        print(f"❌ Database setup failed: {err}")
        print("\n💡 Troubleshooting tips:")
        print("1. Make sure MySQL is running")
        print("2. Check your .env file configuration")
        print("3. Verify your MySQL username and password")
        print("4. If using XAMPP, make sure MySQL service is started")

if __name__ == "__main__":
    print("=" * 50)
    print("🎓 IntellGrade Database Setup")
    print("=" * 50)
    setup_database() 