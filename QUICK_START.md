# 🚀 IntellGrade Quick Start Guide

Get IntellGrade running with MySQL database in 5 minutes!

## Prerequisites

- ✅ Python 3.7+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ Git (optional, for cloning)

## Step 1: Download/Clone the Project

```bash
# Option 1: Clone from Git
git clone <repository-url>
cd IntellGrade

# Option 2: Download and extract ZIP
# Extract to a folder and navigate to it
```

## Step 2: Run the Setup Script

```bash
python setup.py
```

The setup script will:
- 🔍 Test your MySQL connection
- 📦 Install Python dependencies
- 🗄️ Create the database and tables
- 📝 Create configuration files
- 📊 Insert sample data

**Just follow the prompts and enter your MySQL credentials when asked!**

## Step 3: Start the Servers

Open **two terminal windows** and run:

**Terminal 1 - API Server:**
```bash
python api_server.py
```

**Terminal 2 - Web Server:**
```bash
python server.py
```

## Step 4: Access the Application

Open your browser and go to: **http://localhost:8000**

## Step 5: Login with Demo Credentials

- **👨‍💼 Admin**: `admin@intellgrade.com` / `admin123`
- **👨‍🏫 Lecturer**: `john.smith@university.edu` / `lect123`
- **👨‍🎓 Student**: `alice.johnson@student.edu` / `stu123`

## 🎉 You're Ready!

The system is now fully functional with:
- ✅ MySQL database backend
- ✅ Flask API server
- ✅ Student feedback system
- ✅ Lecturer analytics dashboard
- ✅ Admin management panel
- ✅ Transcript generation
- ✅ Sentiment analysis

## 🔧 Troubleshooting

### "Database connection failed"
- Make sure MySQL is running
- Check your credentials in the setup
- Try: `mysql -u root -p` to test connection

### "Port already in use"
- Change ports in the scripts
- Or kill existing processes using those ports

### "Module not found"
- Run: `pip install -r requirements.txt`

### "Permission denied"
- On Windows: Run as Administrator
- On Linux/Mac: Use `sudo` if needed

## 📚 What's Next?

- Explore the different user roles
- Try submitting feedback as a student
- View analytics as a lecturer
- Manage the system as an admin
- Check out the API documentation in `README.md`

## 🆘 Need Help?

- Check the full `README.md` for detailed documentation
- Review `database_schema.sql` for database structure
- Examine `api_server.py` for API endpoints
- Look at the browser console for frontend errors

---

**Happy coding! 🎓** 