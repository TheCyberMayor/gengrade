# IntellGrade - Intelligent Academic Management System

## Overview

IntellGrade is an intelligent online platform designed specifically for Nigerian tertiary institutions to manage student results and feedback digitally and securely. The system combines traditional academic management with modern AI capabilities to provide insights that help improve teaching quality and student performance.

## Features

### 🔐 Role-Based Access Control
- **Administrators**: Manage departments, courses, users, and system settings
- **Lecturers**: Upload results, view feedback, manage courses
- **Students**: View results, submit anonymous feedback, access transcripts

### 📊 Result Management
- Manual and bulk result uploads with GPA/CGPA calculation
- Automatic grade computation and validation
- Student dashboard for viewing results and downloading transcripts
- PDF report generation

### 💬 Feedback System
- Anonymous course and instructor feedback submission
- Star rating system with comment functionality
- Sentiment analysis using keyword-based logic
- Lecturer feedback dashboard with analytics

### 🧠 AI-Powered Analytics
- **Performance Prediction**: Machine learning models to predict student performance
- **Sentiment Analysis**: Analyze feedback sentiment using NLP techniques
- **Risk Assessment**: Identify at-risk students early
- **Recommendations**: Personalized improvement suggestions

### 📈 Reporting & Analytics
- Comprehensive academic reports
- Performance trend analysis
- Department and course statistics
- Export capabilities (PDF, Excel)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Python Flask API
- **Database**: MySQL 8.0+
- **AI/ML**: Python with scikit-learn, pandas, numpy
- **UI Framework**: Bootstrap 5 with Font Awesome icons

## Project Structure

```
IntellGrade/
├── index.html                 # Landing page
├── login.html                 # Authentication page
├── admin/
│   └── dashboard.html         # Admin dashboard
├── lecturer/
│   └── dashboard.html         # Lecturer dashboard
├── student/
│   └── dashboard.html         # Student dashboard
├── assets/
│   ├── css/
│   │   └── style.css          # Custom styles
│   └── js/
│       ├── api-client.js      # API client for backend communication
│       ├── auth.js            # Authentication logic
│       ├── admin.js           # Admin functionality
│       ├── lecturer.js        # Lecturer functionality
│       ├── student-api.js     # Student functionality (API version)
│       └── main.js            # General utilities
├── python/
│   ├── sentiment_analysis.py  # Feedback sentiment analysis
│   └── performance_prediction.py # Student performance prediction
├── api_server.py              # Flask API server
├── server.py                  # Static file server
├── setup.py                   # Database setup script
├── database_schema.sql        # MySQL database schema
├── requirements.txt           # Python dependencies
├── config.env.example         # Environment configuration example
├── project Proposal.docx      # Original project proposal
├── project requirements.docx  # Original requirements
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites
- Python 3.7+
- MySQL 8.0+
- Modern web browser

### Quick Start

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd IntellGrade
   ```

2. **Run the setup script**
   ```bash
   python setup.py
   ```
   This will:
   - Configure your database connection
   - Install Python dependencies
   - Create the database schema
   - Set up sample data

3. **Start the API server**
   ```bash
   python api_server.py
   ```

4. **Start the web server**
   ```bash
   python server.py
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:8000`

### Manual Setup

If you prefer to set up manually:

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up MySQL database**
   ```bash
   mysql -u root -p < database_schema.sql
   ```

3. **Create environment file**
   ```bash
   cp config.env.example .env
   # Edit .env with your database credentials
   ```

4. **Start servers**
   ```bash
   # Terminal 1: API server
   python api_server.py
   
   # Terminal 2: Web server
   python server.py
   ```

## Database Schema

The system uses the following MySQL tables:

- **users**: User accounts (admin, lecturer, student)
- **departments**: Academic departments
- **courses**: Course information
- **results**: Student academic results
- **feedbacks**: Student feedback submissions
- **lecturer_courses**: Many-to-many relationship between lecturers and courses

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Student Endpoints
- `GET /api/student/results` - Get student results
- `GET /api/student/transcript` - Get student transcript

### Feedback Endpoints
- `POST /api/feedback/submit` - Submit feedback
- `GET /api/feedback/courses` - Get available courses for feedback

### Lecturer Endpoints
- `GET /api/lecturer/feedback` - Get lecturer feedback analytics

### Admin Endpoints
- `GET /api/admin/overview` - Get admin dashboard overview
- `GET /api/admin/feedback` - Get all feedback

### Results Management
- `POST /api/results/add` - Add new result
- `PUT /api/results/update` - Update existing result

## Demo Credentials

- **Admin**: admin@intellgrade.com / admin123
- **Lecturer**: john.smith@university.edu / lect123
- **Student**: alice.johnson@student.edu / stu123

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=intellgrade_db

# Flask Configuration
SECRET_KEY=your-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
```

### Database Configuration

The system supports MySQL 8.0+ with the following requirements:
- UTF8MB4 character set
- InnoDB storage engine
- Foreign key constraints enabled

## Development

### Adding New Features

1. **Database Changes**: Update `database_schema.sql`
2. **API Endpoints**: Add to `api_server.py`
3. **Frontend**: Update JavaScript files in `assets/js/`
4. **Styling**: Modify `assets/css/style.css`

### Testing

- API endpoints can be tested using tools like Postman
- Frontend functionality can be tested in the browser
- Database queries can be tested directly in MySQL

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL service is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **API Server Won't Start**
   - Check if port 5000 is available
   - Verify all dependencies are installed
   - Check `.env` file configuration

3. **Frontend Not Loading**
   - Ensure both API and web servers are running
   - Check browser console for JavaScript errors
   - Verify CORS settings in API server

### Logs

- API server logs are displayed in the terminal
- Database errors are logged to MySQL error log
- Browser console shows frontend errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Examine the database schema
- Contact the development team 