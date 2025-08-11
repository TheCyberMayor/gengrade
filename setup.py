#!/usr/bin/env python3
"""
IntellGrade Setup Script
Helps users set up the MySQL database and configure the application
"""

import os
import sys
import mysql.connector
import bcrypt
from pathlib import Path

def print_banner():
    """Print setup banner"""
    print("=" * 60)
    print("🎓 IntellGrade - MySQL Database Setup")
    print("=" * 60)

def get_database_config():
    """Get database configuration from user"""
    print("\n📊 Database Configuration")
    print("-" * 30)
    
    config = {}
    config['host'] = input("Database host (default: localhost): ").strip() or 'localhost'
    config['user'] = input("Database username (default: root): ").strip() or 'root'
    config['password'] = input("Database password: ").strip()
    config['database'] = input("Database name (default: intellgrade_db): ").strip() or 'intellgrade_db'
    
    return config

def test_connection(config):
    """Test database connection"""
    print("\n🔍 Testing database connection...")
    
    try:
        # Try to connect without specifying database first
        test_config = config.copy()
        test_config.pop('database', None)
        
        connection = mysql.connector.connect(**test_config)
        cursor = connection.cursor()
        
        # Check if database exists
        cursor.execute("SHOW DATABASES LIKE %s", (config['database'],))
        database_exists = cursor.fetchone()
        
        if not database_exists:
            print(f"📝 Creating database '{config['database']}'...")
            cursor.execute(f"CREATE DATABASE {config['database']}")
            print("✅ Database created successfully!")
        
        cursor.close()
        connection.close()
        
        # Test connection with database
        connection = mysql.connector.connect(**config)
        connection.close()
        
        print("✅ Database connection successful!")
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        return False

def create_env_file(config):
    """Create .env file with database configuration"""
    print("\n📝 Creating environment configuration file...")
    
    env_content = f"""# IntellGrade Environment Configuration
# Database Configuration
DB_HOST={config['host']}
DB_USER={config['user']}
DB_PASSWORD={config['password']}
DB_NAME={config['database']}

# Flask Configuration
SECRET_KEY=intellgrade-secret-key-2024-change-this-in-production

# Server Configuration
FLASK_ENV=development
FLASK_DEBUG=True
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Environment file created successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to create environment file: {e}")
        return False

def run_database_schema():
    """Run the database schema SQL file"""
    print("\n🗄️  Setting up database schema...")
    
    try:
        # Read the schema file
        schema_file = Path('database_schema.sql')
        if not schema_file.exists():
            print("❌ database_schema.sql file not found!")
            return False
        
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
        
        # Connect to database
        from dotenv import load_dotenv
        load_dotenv()
        
        config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'intellgrade_db'),
            'charset': 'utf8mb4',
            'autocommit': True
        }
        
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Split SQL into individual statements
        statements = schema_sql.split(';')
        
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                except mysql.connector.Error as err:
                    if "already exists" not in str(err).lower():
                        print(f"⚠️  Warning: {err}")
        
        cursor.close()
        connection.close()
        
        print("✅ Database schema created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Failed to set up database schema: {e}")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("\n📦 Installing Python dependencies...")
    
    try:
        import subprocess
        result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Dependencies installed successfully!")
            return True
        else:
            print(f"❌ Failed to install dependencies: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def print_next_steps():
    """Print next steps for the user"""
    print("\n" + "=" * 60)
    print("🎉 Setup Complete!")
    print("=" * 60)
    print("\n📋 Next Steps:")
    print("1. Start the API server:")
    print("   python api_server.py")
    print("\n2. Start the web server:")
    print("   python server.py")
    print("\n3. Open your browser and go to:")
    print("   http://localhost:8000")
    print("\n4. Login with demo credentials:")
    print("   Admin: admin@intellgrade.com / admin123")
    print("   Lecturer: john.smith@university.edu / lect123")
    print("   Student: alice.johnson@student.edu / stu123")
    print("\n📚 Documentation:")
    print("   - Check README.md for detailed instructions")
    print("   - Database schema: database_schema.sql")
    print("   - API endpoints: api_server.py")
    print("\n🔧 Configuration:")
    print("   - Edit .env file to change database settings")
    print("   - Modify config.env.example for reference")
    print("\n" + "=" * 60)

def main():
    """Main setup function"""
    print_banner()
    
    # Check if .env file already exists
    if os.path.exists('.env'):
        print("⚠️  .env file already exists!")
        overwrite = input("Do you want to overwrite it? (y/N): ").strip().lower()
        if overwrite != 'y':
            print("Setup cancelled.")
            return
    
    # Get database configuration
    config = get_database_config()
    
    # Test database connection
    if not test_connection(config):
        print("\n❌ Setup failed. Please check your database configuration.")
        return
    
    # Create environment file
    if not create_env_file(config):
        print("\n❌ Setup failed. Could not create environment file.")
        return
    
    # Install dependencies
    if not install_dependencies():
        print("\n⚠️  Warning: Failed to install dependencies. You may need to install them manually.")
    
    # Run database schema
    if not run_database_schema():
        print("\n❌ Setup failed. Could not set up database schema.")
        return
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        print("Please check your configuration and try again.") 