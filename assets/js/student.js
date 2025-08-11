// Student Dashboard JavaScript

// Utility functions
const Utils = {
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};

class StudentDashboard {
    constructor() {
        this.currentPage = 'overview';
        this.init();
    }

    init() {
        console.log('StudentDashboard initializing...');
        
        // Check if we're in development mode
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Check authentication
        if (typeof window.auth !== 'undefined' && window.auth.requireAuth) {
            if (!window.auth.requireAuth('student')) {
                console.log('Authentication failed');
                return;
            }
        } else if (!isDevelopment) {
            console.log('Auth system not available and not in development mode');
            return;
        } else {
            console.log('Development mode detected, bypassing authentication');
        }

        this.setupEventListeners();
        this.loadUserInfo();
        this.loadPageContent();
        console.log('StudentDashboard initialized successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = e.target.closest('.nav-link').dataset.page;
                console.log('Navigation clicked:', page);
                this.navigateToPage(page);
            });
        });

        // Form submissions
        document.getElementById('feedbackForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Rating stars
        this.setupRatingStars();
        console.log('Event listeners setup complete');
    }

    setupRatingStars() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-stars') || e.target.closest('.rating-stars')) {
                const stars = e.target.closest('.rating-stars').querySelectorAll('i');
                const clickedStar = e.target.closest('i');
                
                if (clickedStar) {
                    const rating = parseInt(clickedStar.dataset.rating);
                    this.setRating(stars, rating);
                }
            }
        });
    }

    setRating(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.remove('far');
                star.classList.add('fas', 'text-warning');
            } else {
                star.classList.remove('fas', 'text-warning');
                star.classList.add('far');
            }
        });
        document.getElementById('ratingValue').value = rating;
    }

    loadUserInfo() {
        const user = auth.getCurrentUser();
        if (user) {
            document.getElementById('studentName').textContent = user.name;
        }
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page, 'from:', this.currentPage);
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const targetLink = document.querySelector(`[data-page="${page}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
            console.log('Active class added to navigation link');
        } else {
            console.error('Navigation link not found for page:', page);
        }

        // Update content
        this.currentPage = page;
        this.loadPageContent();
        this.updatePageTitle();
        console.log('Navigation to page completed:', page);
    }

    updatePageTitle() {
        const titles = {
            overview: 'Dashboard Overview',
            results: 'My Results',
            courses: 'My Courses',
            feedback: 'Submit Feedback',
            transcript: 'Academic Transcript',
            profile: 'Student Profile'
        };

        document.getElementById('pageTitle').textContent = titles[this.currentPage] || 'Dashboard';
    }

    async loadPageContent() {
        console.log('Loading page content for:', this.currentPage);
        
        // Hide all pages
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        // Show current page
        const currentPageElement = document.getElementById(this.currentPage);
        if (currentPageElement) {
            currentPageElement.classList.add('active');
            currentPageElement.style.display = 'block';
            console.log('Current page element displayed:', this.currentPage);
        } else {
            console.error('Content page element not found:', this.currentPage);
        }

        // Load specific content based on page
        switch (this.currentPage) {
            case 'results':
                await this.loadResultsPage();
                break;
            case 'courses':
                await this.loadCoursesPage();
                break;
            case 'feedback':
                await this.loadFeedbackPage();
                break;
            case 'transcript':
                await this.loadTranscriptPage();
                break;
            case 'profile':
                await this.loadProfilePage();
                break;
            default:
                console.log('Unknown page type:', this.currentPage);
        }
        
        console.log('Page content loading completed for:', this.currentPage);
    }

    loadResultsPage() {
        const resultsPage = document.getElementById('results');
        
        // Get current user
        const user = auth.getCurrentUser();
        if (!user) {
            resultsPage.innerHTML = '<div class="alert alert-danger">User not authenticated</div>';
            return;
        }

        // Get student results from result manager
        const studentResults = window.resultManager ? window.resultManager.getStudentResults(user.username) : null;
        
        if (!studentResults) {
            resultsPage.innerHTML = '<div class="alert alert-info">No results available yet.</div>';
            return;
        }

        // Calculate CGPA
        const cgpa = window.resultManager.calculateCGPA(user.username);
        
        // Get current semester GPA
        const currentSemester = Object.keys(studentResults.semesters)[0]; // Most recent semester
        const currentGPA = studentResults.semesters[currentSemester]?.gpa || 0;
        
        // Calculate total units
        let totalUnits = 0;
        Object.values(studentResults.semesters).forEach(semester => {
            totalUnits += semester.totalUnits;
        });

        resultsPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5>My Results</h5>
                <div>
                    <button class="btn btn-success me-2" onclick="exportResults('excel')">
                        <i class="fas fa-file-excel me-2"></i>Export Excel
                    </button>
                    <button class="btn btn-danger" onclick="exportResults('pdf')">
                        <i class="fas fa-file-pdf me-2"></i>Export PDF
                    </button>
                </div>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Academic Summary</h6>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <span>Current GPA:</span>
                                <span class="fw-bold text-primary">${currentGPA.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>CGPA:</span>
                                <span class="fw-bold text-success">${cgpa.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Total Credit Units:</span>
                                <span class="fw-bold">${totalUnits}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Level:</span>
                                <span class="fw-bold">${studentResults.level}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Department:</span>
                                <span class="fw-bold">${studentResults.department}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Semester Results</h6>
                        </div>
                        <div class="card-body">
                            ${this.generateSemesterResultsHTML(studentResults)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateSemesterResultsHTML(studentResults) {
        let html = '';
        
        Object.entries(studentResults.semesters).forEach(([semester, semesterData]) => {
            html += `
                <div class="semester-section mb-4">
                    <h6 class="text-primary">${semester} - Semester Results</h6>
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Credit Units</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Grade Points</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
            
            semesterData.courses.forEach(course => {
                const gradeClass = this.getGradeClass(course.grade);
                html += `
                    <tr>
                        <td>${course.code}</td>
                        <td>${course.title}</td>
                        <td>${course.units}</td>
                        <td>${course.score}</td>
                        <td><span class="badge ${gradeClass}">${course.grade}</span></td>
                        <td>${course.gpa}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="viewResultDetails('${course.code}', '${semester}')">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += `
                            </tbody>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span><strong>Semester GPA:</strong> ${semesterData.gpa.toFixed(2)}</span>
                        <span><strong>Total Units:</strong> ${semesterData.totalUnits}</span>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    getGradeClass(grade) {
        const gradeClasses = {
            'A': 'bg-success',
            'A-': 'bg-success',
            'B+': 'bg-primary',
            'B': 'bg-primary',
            'B-': 'bg-primary',
            'C+': 'bg-warning',
            'C': 'bg-warning',
            'C-': 'bg-warning',
            'D+': 'bg-danger',
            'D': 'bg-danger',
            'F': 'bg-danger'
        };
        return gradeClasses[grade] || 'bg-secondary';
    }

    loadCoursesPage() {
        const coursesPage = document.getElementById('courses');
        coursesPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5>My Courses</h5>
                <span class="badge bg-primary">Current Semester: 2024/1</span>
            </div>
            <div class="row g-4">
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">CSC101 - Introduction to Computer Science</h6>
                            <p class="text-muted">First Year, First Semester</p>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Lecturer:</span>
                                <span class="fw-bold">Dr. John Smith</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Credit Units:</span>
                                <span class="fw-bold">3</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Schedule:</span>
                                <span class="fw-bold">Mon, Wed 10:00 AM</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Venue:</span>
                                <span class="fw-bold">Room 101</span>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary btn-sm" onclick="viewCourseDetails('CSC101')">
                                    <i class="fas fa-eye me-1"></i>View Details
                                </button>
                                <button class="btn btn-success btn-sm" onclick="submitFeedbackForCourse('CSC101')">
                                    <i class="fas fa-comments me-1"></i>Submit Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">MTH101 - Calculus I</h6>
                            <p class="text-muted">First Year, First Semester</p>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Lecturer:</span>
                                <span class="fw-bold">Prof. Mary Johnson</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Credit Units:</span>
                                <span class="fw-bold">4</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Schedule:</span>
                                <span class="fw-bold">Tue, Thu 2:00 PM</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Venue:</span>
                                <span class="fw-bold">Room 205</span>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary btn-sm" onclick="viewCourseDetails('MTH101')">
                                    <i class="fas fa-eye me-1"></i>View Details
                                </button>
                                <button class="btn btn-success btn-sm" onclick="submitFeedbackForCourse('MTH101')">
                                    <i class="fas fa-comments me-1"></i>Submit Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 col-lg-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">PHY101 - General Physics</h6>
                            <p class="text-muted">First Year, First Semester</p>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Lecturer:</span>
                                <span class="fw-bold">Dr. Robert Wilson</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Credit Units:</span>
                                <span class="fw-bold">4</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Schedule:</span>
                                <span class="fw-bold">Fri 9:00 AM</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span>Venue:</span>
                                <span class="fw-bold">Lab 301</span>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-primary btn-sm" onclick="viewCourseDetails('PHY101')">
                                    <i class="fas fa-eye me-1"></i>View Details
                                </button>
                                <button class="btn btn-success btn-sm" onclick="submitFeedbackForCourse('PHY101')">
                                    <i class="fas fa-comments me-1"></i>Submit Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadFeedbackPage() {
        const feedbackPage = document.getElementById('feedback');
        
        // Get feedback data
        const allFeedback = window.feedbackManager.getAllFeedback();
        const courses = window.feedbackManager.getCourses();
        const lecturers = window.feedbackManager.getLecturers();
        
        // Populate course and lecturer dropdowns in modal
        this.populateFeedbackDropdowns(courses, lecturers);
        
        // Create rating stars in modal
        this.initializeRatingStars();
        
        feedbackPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5><i class="fas fa-comments me-2"></i>Submit Feedback</h5>
                <div>
                    <button class="btn btn-success me-2" onclick="exportFeedback('csv')">
                        <i class="fas fa-download me-2"></i>Export Feedback
                    </button>
                    <button class="btn btn-primary" onclick="showModal('submitFeedbackModal')">
                        <i class="fas fa-plus me-2"></i>Submit New Feedback
                    </button>
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-history me-2"></i>Recent Feedback
                            </h6>
                        </div>
                        <div class="card-body">
                            ${this.generateFeedbackHistoryHTML(allFeedback)}
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">
                                <i class="fas fa-chart-bar me-2"></i>Feedback Statistics
                            </h6>
                        </div>
                        <div class="card-body">
                            ${this.generateFeedbackStatsHTML(allFeedback)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateFeedbackHistoryHTML(feedbacks) {
        if (feedbacks.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No feedback submitted yet</h6>
                    <p class="text-muted">Be the first to share your experience!</p>
                    <button class="btn btn-primary" onclick="showModal('submitFeedbackModal')">
                        <i class="fas fa-plus me-2"></i>Submit Feedback
                    </button>
                </div>
            `;
        }

        const recentFeedbacks = feedbacks.slice(-5).reverse();
        let html = '';
        
        recentFeedbacks.forEach(feedback => {
            const date = new Date(feedback.submittedAt).toLocaleDateString();
            const time = new Date(feedback.submittedAt).toLocaleTimeString();
            
            html += `
                <div class="feedback-history-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${feedback.courseCode} - ${feedback.courseTitle}</h6>
                            <p class="text-muted mb-1"><strong>Lecturer:</strong> ${feedback.lecturerName}</p>
                            ${feedback.comment ? `<p class="feedback-comment mb-2">"${feedback.comment}"</p>` : ''}
                            <div class="d-flex align-items-center">
                                <div class="feedback-rating me-3">
                                    ${this.generateStarRating(feedback.rating)}
                                </div>
                                <span class="feedback-timestamp">
                                    <i class="fas fa-clock me-1"></i>${date} at ${time}
                                </span>
                            </div>
                        </div>
                        <div class="ms-3">
                            <span class="feedback-status submitted">
                                <i class="fas fa-check me-1"></i>Submitted
                            </span>
                            <div class="mt-2">
                                <span class="anonymous-badge">
                                    <i class="fas fa-user-secret me-1"></i>Anonymous
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    generateFeedbackStatsHTML(feedbacks) {
        if (feedbacks.length === 0) {
            return `
                <div class="text-center py-3">
                    <i class="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                    <p class="text-muted mb-0">No feedback data available</p>
                </div>
            `;
        }

        const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = (totalRating / feedbacks.length).toFixed(1);
        const courses = [...new Set(feedbacks.map(f => f.courseCode))];
        const lecturers = [...new Set(feedbacks.map(f => f.lecturerId))];

        return `
            <div class="feedback-stats">
                <div class="row text-center">
                    <div class="col-6">
                        <div class="stat-item">
                            <span class="stat-number">${feedbacks.length}</span>
                            <span class="stat-label">Total Feedback</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="stat-item">
                            <span class="stat-number">${averageRating}</span>
                            <span class="stat-label">Avg Rating</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-3">
                <h6><i class="fas fa-info-circle me-2"></i>Quick Stats</h6>
                <div class="d-flex justify-content-between mb-2">
                    <span>Courses Rated:</span>
                    <span class="fw-bold">${courses.length}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Lecturers Rated:</span>
                    <span class="fw-bold">${lecturers.length}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Latest Feedback:</span>
                    <span class="fw-bold">${new Date(feedbacks[feedbacks.length - 1].submittedAt).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }

    generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-warning"></i>';
            } else {
                stars += '<i class="far fa-star text-muted"></i>';
            }
        }
        return stars;
    }

    populateFeedbackDropdowns(courses, lecturers) {
        const courseSelect = document.getElementById('feedbackCourse');
        const lecturerSelect = document.getElementById('feedbackLecturer');
        
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Select course</option>';
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = `${course.code} - ${course.title}`;
                courseSelect.appendChild(option);
            });
        }
        
        if (lecturerSelect) {
            lecturerSelect.innerHTML = '<option value="">Select lecturer</option>';
            lecturers.forEach(lecturer => {
                const option = document.createElement('option');
                option.value = lecturer.id;
                option.textContent = lecturer.name;
                lecturerSelect.appendChild(option);
            });
        }
    }

    initializeRatingStars() {
        const ratingContainer = document.getElementById('ratingContainer');
        if (ratingContainer && window.feedbackManager) {
            window.feedbackManager.createRatingStars(ratingContainer, 0, false);
        }
    }

    loadTranscriptPage() {
        const transcriptPage = document.getElementById('transcript');
        
        // Check if TranscriptManager is available
        if (!window.transcriptManager) {
            // Load transcript manager if not already loaded
            const script = document.createElement('script');
            script.src = '../assets/js/transcript.js';
            script.onload = () => {
                if (window.transcriptManager) {
                    this.renderTranscriptPage();
                }
            };
            document.head.appendChild(script);
        } else {
            this.renderTranscriptPage();
        }
    }

    renderTranscriptPage() {
        const transcriptPage = document.getElementById('transcript');
        const student = window.transcriptManager?.getCurrentStudent();
        
        if (!student) {
            transcriptPage.innerHTML = `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Transcript data not available. Please contact your academic advisor.
                </div>
            `;
            return;
        }

        transcriptPage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5>Academic Transcript</h5>
                <div>
                    <button class="btn btn-outline-primary me-2" onclick="window.transcriptManager.downloadTranscript()">
                        <i class="fas fa-download me-2"></i>Download PDF
                    </button>
                    <button class="btn btn-outline-secondary" onclick="window.transcriptManager.printTranscript()">
                        <i class="fas fa-print me-2"></i>Print
                    </button>
                </div>
            </div>

            <!-- Student Information -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">Student Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Name:</strong> ${student.name}</p>
                                    <p><strong>Student ID:</strong> ${student.studentId}</p>
                                    <p><strong>Program:</strong> ${student.program}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Enrollment Date:</strong> ${student.enrollmentDate}</p>
                                    <p><strong>Current Semester:</strong> ${student.currentSemester}</p>
                                    <p><strong>Overall GPA:</strong> ${student.overallGPA.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Summary Statistics -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-primary" id="totalCredits">${this.calculateTotalCredits(student)}</h3>
                            <p class="card-text">Total Credits</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success" id="completedCourses">${this.calculateCompletedCourses(student)}</h3>
                            <p class="card-text">Courses Completed</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info" id="semestersCompleted">${student.semesters.length}</h3>
                            <p class="card-text">Semesters</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Semester Results -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">Academic Record</h6>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="showGPA" checked>
                                <label class="form-check-label" for="showGPA">
                                    Show GPA
                                </label>
                            </div>
                        </div>
                        <div class="card-body">
                            <div id="transcriptContent">
                                ${this.generateTranscriptContent(student)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Set up event listeners for the transcript page
        this.setupTranscriptEventListeners();
    }

    calculateTotalCredits(student) {
        return student.semesters.reduce((sum, semester) => {
            return sum + semester.courses.reduce((semesterSum, course) => semesterSum + course.credits, 0);
        }, 0);
    }

    calculateCompletedCourses(student) {
        return student.semesters.reduce((sum, semester) => {
            return sum + semester.courses.length;
        }, 0);
    }

    generateTranscriptContent(student) {
        let html = '';
        
        student.semesters.forEach((semester, index) => {
            html += this.generateSemesterHTML(semester, index);
        });

        return html;
    }

    generateSemesterHTML(semester, index) {
        const isExpanded = index === this.currentStudent?.semesters.length - 1;
        
        let html = `
            <div class="semester-section mb-4">
                <div class="semester-header" onclick="studentDashboard.toggleSemester(${index})" style="cursor: pointer;">
                    <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                        <h6 class="mb-0">
                            <i class="fas fa-chevron-${isExpanded ? 'down' : 'right'} me-2"></i>
                            ${semester.semester}
                        </h6>
                        <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">${semester.courses.length} Courses</span>
                            <span class="badge bg-success">GPA: ${semester.gpa.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div class="semester-content ${isExpanded ? 'show' : ''}" id="semester-${index}">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Credits</th>
                                    <th>Grade</th>
                                    <th>Grade Points</th>
                                    <th>Quality Points</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        semester.courses.forEach(course => {
            const qualityPoints = course.credits * course.points;
            html += `
                <tr>
                    <td><strong>${course.code}</strong></td>
                    <td>${course.name}</td>
                    <td>${course.credits}</td>
                    <td><span class="badge bg-${this.getGradeColor(course.grade)}">${course.grade}</span></td>
                    <td>${course.points.toFixed(1)}</td>
                    <td>${qualityPoints.toFixed(1)}</td>
                </tr>
            `;
        });

        const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
        const totalQualityPoints = semester.courses.reduce((sum, course) => sum + (course.credits * course.points), 0);
        
        html += `
                            </tbody>
                            <tfoot class="table-secondary">
                                <tr>
                                    <td colspan="2"><strong>Semester Total</strong></td>
                                    <td><strong>${totalCredits}</strong></td>
                                    <td colspan="2"><strong>GPA: ${semester.gpa.toFixed(2)}</strong></td>
                                    <td><strong>${totalQualityPoints.toFixed(1)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    getGradeColor(grade) {
        const gradeColors = {
            'A': 'success', 'A-': 'success',
            'B+': 'primary', 'B': 'primary', 'B-': 'primary',
            'C+': 'warning', 'C': 'warning', 'C-': 'warning',
            'D+': 'danger', 'D': 'danger', 'F': 'danger'
        };
        return gradeColors[grade] || 'secondary';
    }

    toggleSemester(index) {
        const content = document.getElementById(`semester-${index}`);
        const header = content.previousElementSibling;
        const icon = header.querySelector('i');
        
        if (content.classList.contains('show')) {
            content.classList.remove('show');
            icon.className = 'fas fa-chevron-right me-2';
        } else {
            content.classList.add('show');
            icon.className = 'fas fa-chevron-down me-2';
        }
    }

    setupTranscriptEventListeners() {
        // GPA toggle
        document.getElementById('showGPA')?.addEventListener('change', (e) => {
            this.toggleGPADisplay(e.target.checked);
        });
    }

    toggleGPADisplay(show) {
        const gpaElements = document.querySelectorAll('.badge.bg-success');
        gpaElements.forEach(element => {
            element.style.display = show ? 'inline-block' : 'none';
        });
    }

    loadProfilePage() {
        const profilePage = document.getElementById('profile');
        profilePage.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5>Student Profile</h5>
                <button class="btn btn-primary" onclick="editProfile()">
                    <i class="fas fa-edit me-2"></i>Edit Profile
                </button>
            </div>
            <div class="row g-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="mb-3">
                                <i class="fas fa-user-circle fa-5x text-primary"></i>
                            </div>
                            <h5>Alice Johnson</h5>
                            <p class="text-muted">Student ID: STU001</p>
                            <span class="badge bg-success">Active</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Personal Information</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Full Name:</strong> Alice Johnson</p>
                                    <p><strong>Student ID:</strong> STU001</p>
                                    <p><strong>Email:</strong> alice.johnson@university.edu</p>
                                    <p><strong>Phone:</strong> +234 801 234 5678</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Department:</strong> Computer Science</p>
                                    <p><strong>Level:</strong> 300</p>
                                    <p><strong>Date of Birth:</strong> 15 March 2002</p>
                                    <p><strong>Gender:</strong> Female</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Modal functions
    showModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }

    // Form submission functions
    submitFeedback() {
        // This function is now handled by the global submitFeedback function in feedback-management.js
        // The actual implementation is in the feedback management system
    }

    resetRatingStars() {
        const ratingContainer = document.querySelector('.rating-container');
        if (ratingContainer && window.feedbackManager) {
            window.feedbackManager.setRating(ratingContainer, 0);
            window.feedbackManager.updateRatingText(ratingContainer, 0);
        }
    }

    exportResults(format) {
        Utils.showNotification(`${format.toUpperCase()} results exported successfully!`, 'success');
    }

    downloadTranscript(format) {
        Utils.showNotification(`${format.toUpperCase()} transcript downloaded successfully!`, 'success');
    }

    viewAcademicCalendar() {
        Utils.showNotification('Academic calendar opened', 'info');
    }

    editProfile() {
        Utils.showNotification('Profile edit mode activated', 'info');
    }
}

// Global functions for modal access
function showModal(modalId) {
    studentDashboard.showModal(modalId);
}

function submitFeedback() {
    studentDashboard.submitFeedback();
}

function exportResults(format) {
    if (window.resultManager) {
        const user = auth.getCurrentUser();
        const csvContent = window.resultManager.exportResultsToCSV(user.username);
        const filename = `results_${user.username}_${format === 'excel' ? 'xlsx' : 'csv'}`;
        window.resultManager.downloadCSV(csvContent, filename);
        Utils.showNotification(`${format.toUpperCase()} results exported successfully!`, 'success');
    }
}

function downloadTranscript(format) {
    if (window.resultManager) {
        const user = auth.getCurrentUser();
        const csvContent = window.resultManager.exportResultsToCSV(user.username);
        const filename = `transcript_${user.username}_${format === 'excel' ? 'xlsx' : 'csv'}`;
        window.resultManager.downloadCSV(csvContent, filename);
        Utils.showNotification(`${format.toUpperCase()} transcript downloaded successfully!`, 'success');
    }
}

function viewAcademicCalendar() {
    studentDashboard.viewAcademicCalendar();
}

function editProfile() {
    studentDashboard.editProfile();
}

function navigateToPage(page) {
    studentDashboard.navigateToPage(page);
}

function viewCourseDetails(courseCode) {
    Utils.showNotification(`Viewing details for ${courseCode}`, 'info');
}

function submitFeedbackForCourse(courseCode) {
    // Pre-select course in modal
    document.getElementById('feedbackCourse').value = courseCode;
    showModal('submitFeedbackModal');
}

// Result viewing functions
function viewResultDetails(courseCode, semester) {
    const user = auth.getCurrentUser();
    const studentResults = window.resultManager.getStudentResults(user.username);
    
    if (!studentResults || !studentResults.semesters[semester]) {
        Utils.showNotification('Result details not found', 'error');
        return;
    }
    
    const course = studentResults.semesters[semester].courses.find(c => c.code === courseCode);
    if (!course) {
        Utils.showNotification('Course result not found', 'error');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('resultDetailsModal'));
    const content = document.getElementById('resultDetailsContent');
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Course Information</h6>
                <p><strong>Course Code:</strong> ${course.code}</p>
                <p><strong>Course Title:</strong> ${course.title}</p>
                <p><strong>Credit Units:</strong> ${course.units}</p>
                <p><strong>Semester:</strong> ${semester}</p>
            </div>
            <div class="col-md-6">
                <h6>Performance</h6>
                <p><strong>Score:</strong> ${course.score}/100</p>
                <p><strong>Grade:</strong> <span class="badge ${studentDashboard.getGradeClass(course.grade)}">${course.grade}</span></p>
                <p><strong>Grade Points:</strong> ${course.gpa}</p>
                <p><strong>Student:</strong> ${studentResults.name}</p>
            </div>
        </div>
        <div class="mt-3">
            <h6>Performance Analysis</h6>
            <div class="progress mb-2">
                <div class="progress-bar ${course.score >= 80 ? 'bg-success' : course.score >= 70 ? 'bg-primary' : course.score >= 60 ? 'bg-warning' : 'bg-danger'}" 
                     style="width: ${course.score}%">${course.score}%</div>
            </div>
            <small class="text-muted">
                ${course.score >= 80 ? 'Excellent performance!' : 
                  course.score >= 70 ? 'Good performance' : 
                  course.score >= 60 ? 'Satisfactory performance' : 
                  'Needs improvement'}
            </small>
        </div>
    `;
    
    modal.show();
}

function downloadResultPDF() {
    Utils.showNotification('PDF download feature coming soon!', 'info');
}

// Initialize student dashboard
const studentDashboard = new StudentDashboard(); 