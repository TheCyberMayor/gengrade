#!/usr/bin/env python3
"""
Simple HTTP Server for IntellGrade System
Run this script to start a local server for the IntellGrade application
"""

import http.server
import socketserver
import os
import sys
import webbrowser
from pathlib import Path

class IntellGradeServer:
    def __init__(self, port=8000):
        self.port = port
        self.handler = http.server.SimpleHTTPRequestHandler
        
    def start(self):
        """Start the HTTP server"""
        try:
            with socketserver.TCPServer(("", self.port), self.handler) as httpd:
                print("=" * 60)
                print("🚀 IntellGrade Server Started Successfully!")
                print("=" * 60)
                print(f"📍 Server running at: http://localhost:{self.port}")
                print(f"📁 Serving files from: {os.getcwd()}")
                print("=" * 60)
                print("🔑 Demo Credentials:")
                print("   Admin:     admin@intellgrade.com or ADMIN001 / admin123")
                print("   Lecturer:  john.smith@university.edu or LECT001 / admin123")
                print("   Student:   alice.johnson@student.edu or STU001 / admin123")
                print("=" * 60)
                print("🌐 Opening browser automatically...")
                print("⏹️  Press Ctrl+C to stop the server")
                print("=" * 60)
                
                # Open browser automatically
                webbrowser.open(f"http://localhost:{self.port}")
                
                # Start serving
                httpd.serve_forever()
                
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"❌ Port {self.port} is already in use!")
                print(f"💡 Try using a different port: python server.py {self.port + 1}")
            else:
                print(f"❌ Error starting server: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")

def check_dependencies():
    """Check if required Python packages are available"""
    required_packages = ['numpy', 'pandas', 'sklearn']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("⚠️  Warning: Some Python packages are missing for AI features:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 To install missing packages, run:")
        print(f"   pip install {' '.join(missing_packages)}")
        print("\n📝 The web interface will still work without these packages.")
        print("   AI features (sentiment analysis, performance prediction) will be limited.\n")
        return False
    else:
        print("✅ All required Python packages are available!")
        return True

def main():
    """Main function"""
    print("🎓 IntellGrade - Intelligent Academic Management System")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('index.html'):
        print("❌ Error: index.html not found!")
        print("💡 Make sure you're running this script from the IntellGrade directory.")
        sys.exit(1)
    
    # Check dependencies
    check_dependencies()
    
    # Get port from command line argument or use default
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number!")
            sys.exit(1)
    
    # Start server
    server = IntellGradeServer(port)
    server.start()

if __name__ == "__main__":
    main() 