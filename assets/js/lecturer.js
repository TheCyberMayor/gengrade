// Lecturer Dashboard JavaScript
console.log('Lecturer.js file loaded at:', new Date().toISOString());

// Utility functions
const Utils = {
    showNotification: function(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};

class LecturerDashboard {
    constructor() {
        this.currentPage = 'overview';
        this.currentLecturerId = 'LEC001';
        this.init();
    }

    init() {
        console.log('Initializing lecturer dashboard...');
        
        // For development/testing, allow bypassing authentication
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Check if auth object exists and handle authentication
        if (typeof window.auth !== 'undefined' && window.auth.requireAuth) {
            if (!window.auth.requireAuth('lecturer')) {
                if (isDevelopment) {
                    console.log('Authentication failed, but continuing in development mode...');
                } else {
                    console.log('Authentication failed, returning...');
            return;
        }
            }
        } else {
            console.log('Auth object not available, continuing in development mode...');
        }
        
        console.log('Setting up dashboard...');
        this.setupEventListeners();
        this.loadUserInfo();
        this.loadOverviewPage();
        
        console.log('Dashboard initialization completed');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Simple direct event listeners for each nav link
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        console.log('Found nav links:', navLinks.length);
        
        navLinks.forEach((link, index) => {
            console.log(`Setting up listener ${index + 1} for:`, link.dataset.page);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const page = link.dataset.page;
                console.log('Nav link clicked:', page);
                
                // Call navigateToPage directly
                this.navigateToPage(page);
            });
        });

        // Handle external navigation links
        document.querySelectorAll('.nav-link[href]').forEach(link => {
            if (link.getAttribute('href') !== '#') {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = link.getAttribute('href');
                    if (href.includes('courses.html')) {
                        this.navigateToPage('courses');
                    } else if (href.includes('results.html')) {
                        this.navigateToPage('results');
                    } else if (href.includes('feedback-analytics.html')) {
                        this.navigateToPage('feedback');
                    } else if (href.includes('profile.html')) {
                        this.navigateToPage('profile');
                    } else if (href.includes('reports.html')) {
                        this.navigateToPage('reports');
                    } else if (href.includes('students.html')) {
                        this.navigateToPage('students');
                    }
                });
            }
        });
        
        console.log('Event listeners setup completed');
    }

    loadUserInfo() {
        const user = auth.getCurrentUser();
        if (user) {
            this.currentLecturerId = user.lecturerId || 'LEC001';
            const dropdownToggle = document.querySelector('.dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.innerHTML = `<i class="fas fa-user me-2"></i>${user.name || 'Lecturer'}`;
            }
            const lecturerNameSpan = document.getElementById('lecturerName');
            if (lecturerNameSpan) {
                lecturerNameSpan.textContent = user.name || 'Lecturer';
            }
        }
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        console.log('Current page before navigation:', this.currentPage);
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current nav link
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            console.log('Added active class to nav link:', page);
        } else {
            console.error('Nav link not found for page:', page);
        }
        
        this.currentPage = page;
        console.log('Current page set to:', this.currentPage);
        
        this.loadPageContent();
        this.updatePageTitle();
        
        console.log('Navigation completed for page:', page);
    }

    updatePageTitle() {
        const titles = {
            overview: 'Dashboard Overview',
            feedback: 'Feedback Analytics',
            courses: 'My Courses',
            results: 'Results Management',
            students: 'My Students',
            reports: 'Reports',
            profile: 'Lecturer Profile'
        };
        const pageTitleElement = document.getElementById('pageTitle');
        if (pageTitleElement) {
            pageTitleElement.textContent = titles[this.currentPage] || 'Dashboard';
        }
    }

    async loadPageContent() {
        console.log('Loading page content for:', this.currentPage);
        
        // Hide all content pages
        document.querySelectorAll('.content-page').forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
            console.log('Hiding page:', page.id, 'Display style:', page.style.display);
        });
        
        // Show current page
        const currentPageElement = document.getElementById(this.currentPage);
        if (currentPageElement) {
            currentPageElement.classList.add('active');
            currentPageElement.style.display = 'block';
            console.log('Showing page:', this.currentPage, 'Display style:', currentPageElement.style.display);
        } else {
            console.error('Page element not found:', this.currentPage);
        }
        
        // Load specific page content
        switch (this.currentPage) {
            case 'overview':
                await this.loadOverviewPage();
                break;
            case 'courses':
                await this.loadCoursesPage();
                break;
            case 'results':
                await this.loadResultsPage();
                break;
            case 'feedback':
                await this.loadFeedbackAnalytics();
                break;
            case 'students':
                await this.loadStudentsPage();
                break;
            case 'reports':
                await this.loadReportsPage();
                break;
            case 'profile':
                await this.loadProfilePage();
                break;
            default:
                console.error('Unknown page:', this.currentPage);
        }
        
        console.log('Page content loading completed for:', this.currentPage);
    }

    loadOverviewPage() {
        // Overview page is already loaded by default
        console.log('Overview page loaded');
        this.updateOverviewStats();
    }

    updateOverviewStats() {
        // Update overview statistics with real data
        const statsCards = document.querySelectorAll('.stats-card h3');
        if (statsCards.length >= 4) {
            // These would normally come from API calls
            statsCards[0].textContent = '4'; // Active Courses
            statsCards[1].textContent = '156'; // Total Students
            statsCards[2].textContent = '23'; // New Feedback
            statsCards[3].textContent = '4.2'; // Avg Rating
        }
    }

    async loadFeedbackAnalytics() {
        try {
            // Try to get feedback data from API first
            if (window.apiClient) {
                const response = await window.apiClient.getLecturerFeedback();
                if (response.success && response.feedback) {
                    this.displayFeedbackAnalytics(response.feedback);
            return;
        }
            }
            
            // Fallback to local feedback manager if available
            if (window.feedbackManager) {
        const analytics = window.feedbackManager.getLecturerAnalytics(this.currentLecturerId);
                if (analytics) {
                    this.displayFeedbackAnalytics(analytics);
            return;
        }
            }
            
            // Show no feedback message
            this.showNoFeedbackMessage();
        } catch (error) {
            console.error('Error loading feedback analytics:', error);
            this.showNoFeedbackMessage();
        }
    }

    displayFeedbackAnalytics(analytics) {
        const feedbackContainer = document.getElementById('feedback');
        if (!feedbackContainer) return;
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Feedback Analytics</h5>
                <div>
                    <button class="btn btn-outline-primary me-2" onclick="refreshAnalytics()">
                        <i class="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-outline-success" onclick="exportFeedbackAnalytics('csv')">
                            <i class="fas fa-download me-2"></i>Export CSV
                        </button>
                        <button class="btn btn-outline-info" onclick="exportFeedbackAnalytics('json')">
                            <i class="fas fa-download me-2"></i>Export JSON
                        </button>
            </div>
            </div>
            </div>
            
            <div class="row g-4 mb-4">
                <div class="col-md-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">${analytics.totalFeedbacks || 0}</h3>
                            <p class="mb-0">Total Feedback</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-success text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">${analytics.averageRating || 0}</h3>
                            <p class="mb-0">Average Rating</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-info text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">${analytics.courses ? analytics.courses.length : 0}</h3>
                            <p class="mb-0">Courses</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-warning text-white">
                        <div class="card-body text-center">
                            <h3 class="mb-0">${analytics.recentFeedbacks ? analytics.recentFeedbacks.length : 0}</h3>
                            <p class="mb-0">Recent Feedback</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Rating Distribution</h6>
                        </div>
                        <div class="card-body">
                            <div id="ratingDistribution">
                                ${this.generateRatingDistributionHTML(analytics)}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Sentiment Analysis</h6>
                        </div>
                        <div class="card-body">
                            <div id="sentimentAnalysis">
                                ${this.generateSentimentHTML(analytics.sentiment)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row g-4 mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Course Performance</h6>
                        </div>
                        <div class="card-body">
                            <div id="coursePerformance">
                                ${this.generateCoursePerformanceHTML(analytics)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row g-4 mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="card-title mb-0">Recent Feedback</h6>
                        </div>
                        <div class="card-body">
                            <div id="recentFeedbackList">
                                ${this.generateRecentFeedbackHTML(analytics.recentFeedbacks)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        feedbackContainer.innerHTML = html;
    }

    generateRatingDistributionHTML(analytics) {
        if (!analytics || !analytics.totalFeedbacks) {
            return `
            <div class="text-center py-4">
                    <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No rating data available</h6>
            </div>
        `;
    }

        let html = '<div class="rating-distribution">';
        for (let i = 5; i >= 1; i--) {
            const count = analytics.ratingDistribution ? analytics.ratingDistribution[i] || 0 : 0;
            const percentage = analytics.totalFeedbacks > 0 ? (count / analytics.totalFeedbacks * 100).toFixed(1) : 0;
            html += `
                <div class="rating-bar mb-2">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${i} <i class="fas fa-star text-warning"></i></span>
                        <span class="text-muted">${count}</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-warning" style="width: ${percentage}%"></div>
                        </div>
                </div>
            `;
        }
        html += '</div>';
        return html;
    }

    generateSentimentHTML(sentiment) {
        if (!sentiment || sentiment.total === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-smile fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No sentiment data available</h6>
                </div>
            `;
        }
        
        return `
                <div class="row text-center">
                    <div class="col-4">
                    <div class="sentiment-item">
                        <i class="fas fa-smile text-success fa-2x mb-2"></i>
                        <h4 class="text-success">${sentiment.positive || 0}</h4>
                        <small class="text-muted">Positive</small>
                        </div>
                    </div>
                    <div class="col-4">
                    <div class="sentiment-item">
                        <i class="fas fa-meh text-warning fa-2x mb-2"></i>
                        <h4 class="text-warning">${sentiment.neutral || 0}</h4>
                        <small class="text-muted">Neutral</small>
                        </div>
                    </div>
                    <div class="col-4">
                    <div class="sentiment-item">
                        <i class="fas fa-frown text-danger fa-2x mb-2"></i>
                        <h4 class="text-danger">${sentiment.negative || 0}</h4>
                        <small class="text-muted">Negative</small>
                            </div>
                    </div>
                </div>
            `;
    }

    generateCoursePerformanceHTML(analytics) {
        if (!analytics || !analytics.courses || analytics.courses.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-trophy fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No course performance data</h6>
                </div>
            `;
        }
            
        let html = '<div class="table-responsive"><table class="table table-hover">';
            html += `
                <thead class="table-light">
                    <tr>
                        <th>Course</th>
                        <th>Average Rating</th>
                        <th>Feedback Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
        analytics.courses.forEach(course => {
                html += `
                    <tr>
                        <td>
                            <div>
                            <strong>${course.courseCode || course.code}</strong><br>
                            <small class="text-muted">${course.courseTitle || course.title}</small>
                            </div>
                        </td>
                        <td>
                            <div class="d-flex align-items-center">
                            <div class="me-2">${this.generateStarRating(course.averageRating || 0)}</div>
                            <span class="fw-bold">${(course.averageRating || 0).toFixed(1)}/5</span>
                            </div>
                        </td>
                        <td>
                        <span class="badge bg-primary">${course.feedbackCount || 0}</span>
                        </td>
                        <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewCourseFeedback('${course.courseCode || course.code}')">
                                <i class="fas fa-eye"></i> Details
                            </button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
        return html;
    }

    generateRecentFeedbackHTML(recentFeedbacks) {
        if (!recentFeedbacks || recentFeedbacks.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-history fa-3x text-muted mb-3"></i>
                    <h6 class="text-muted">No recent feedback</h6>
                </div>
            `;
        }
        
        let html = '';
            recentFeedbacks.forEach(feedback => {
                const date = new Date(feedback.submittedAt).toLocaleDateString();
                const time = new Date(feedback.submittedAt).toLocaleTimeString();
                html += `
                <div class="feedback-item border-bottom pb-3 mb-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${feedback.courseCode} - ${feedback.courseTitle}</h6>
                            ${feedback.comment ? `<p class="text-muted mb-2">"${feedback.comment}"</p>` : ''}
                                <div class="d-flex align-items-center">
                                <div class="me-3">
                                        ${this.generateStarRating(feedback.rating)}
                                    </div>
                                <small class="text-muted">
                                        <i class="fas fa-clock me-1"></i>${date} at ${time}
                                </small>
                                </div>
                            </div>
                            <div class="ms-3">
                            <span class="badge bg-secondary">
                                    <i class="fas fa-user-secret me-1"></i>Anonymous
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });
        
        return html;
    }

    showNoFeedbackMessage() {
        const feedbackContainer = document.getElementById('feedback');
        if (feedbackContainer) {
            feedbackContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No feedback received yet</h5>
                    <p class="text-muted">Student feedback will appear here once submitted.</p>
            </div>
        `;
    }
    }

    async loadCoursesPage() {
        console.log('Loading courses page...');
        try {
            if (window.apiClient) {
            const response = await window.apiClient.getLecturerCourses();
            if (response.success) {
                this.displayCourses(response.courses);
                } else {
                    this.showNoCoursesMessage();
                }
            } else {
                this.showNoCoursesMessage();
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showNoCoursesMessage();
        }
    }

    displayCourses(courses) {
        const coursesContainer = document.getElementById('courses');
        if (!coursesContainer) return;
        
        if (!courses || courses.length === 0) {
            coursesContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-book fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No courses assigned</h5>
                    <p class="text-muted">You haven't been assigned to any courses yet.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">My Courses</h5>
                <div>
                    <button class="btn btn-outline-primary me-2" onclick="refreshCourses()">
                        <i class="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                </div>
            </div>
            <div class="row g-4">
        `;

        courses.forEach(course => {
            const studentCount = course.studentCount || 0;
            const avgRating = course.averageRating || 0;
            
            html += `
                <div class="col-lg-6 col-xl-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 class="card-title mb-1">${course.code || course.courseCode}</h6>
                                    <p class="text-muted mb-0">${course.title || course.courseTitle}</p>
                                </div>
                                <span class="badge bg-primary">${course.unit || course.creditUnits || 3} Units</span>
                            </div>
                            <div class="row text-center mb-3">
                                <div class="col-6">
                                    <div class="border-end">
                                        <h6 class="mb-0">${studentCount}</h6>
                                        <small class="text-muted">Students</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div>
                                        <h6 class="mb-0">${avgRating.toFixed(1)}</h6>
                                        <small class="text-muted">Avg Rating</small>
                                    </div>
                                </div>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="viewCourseDetails('${course.code || course.courseCode}')">
                                    <i class="fas fa-eye me-2"></i>View Details
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="viewCourseFeedback('${course.code || course.courseCode}')">
                                    <i class="fas fa-comments me-2"></i>View Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        coursesContainer.innerHTML = html;
    }

    showNoCoursesMessage() {
        const coursesContainer = document.getElementById('courses');
        if (coursesContainer) {
        coursesContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-book fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No courses found</h5>
                <p class="text-muted">Unable to load your courses. Please try again later.</p>
                <button class="btn btn-primary" onclick="refreshCourses()">
                    <i class="fas fa-sync-alt me-2"></i>Retry
                </button>
            </div>
        `;
        }
    }

    async loadResultsPage() {
        const resultsPage = document.getElementById('results');
        if (resultsPage) {
            resultsPage.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5><i class="fas fa-chart-bar me-2"></i>Results Management</h5>
                    <button class="btn btn-primary" onclick="showModal('uploadResultsModal')">
                        <i class="fas fa-plus me-2"></i>Upload Results
                    </button>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <i class="fas fa-upload fa-3x text-primary mb-3"></i>
                                        <h6>Upload Individual Results</h6>
                                        <p class="text-muted">Add results for individual students</p>
                                        <button class="btn btn-primary" onclick="showModal('uploadResultsModal')">
                                            <i class="fas fa-plus me-2"></i>Add Result
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <i class="fas fa-file-upload fa-3x text-success mb-3"></i>
                                        <h6>Bulk Upload</h6>
                                        <p class="text-muted">Upload results for multiple students</p>
                                        <button class="btn btn-success" onclick="showModal('bulkUploadModal')">
                                            <i class="fas fa-upload me-2"></i>Bulk Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    async loadStudentsPage() {
        console.log('Loading students page...');
        try {
            if (window.apiClient) {
            const response = await window.apiClient.getLecturerStudents();
            if (response.success) {
                this.displayStudents(response.students);
                } else {
                    this.showNoStudentsMessage();
                }
            } else {
                this.showNoStudentsMessage();
            }
        } catch (error) {
            console.error('Error loading students:', error);
            this.showNoStudentsMessage();
        }
    }

    displayStudents(students) {
        const studentsContainer = document.getElementById('students');
        if (!studentsContainer) return;
        
        if (!students || students.length === 0) {
            studentsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-users fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No students found</h5>
                    <p class="text-muted">No students are currently enrolled in your courses.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">My Students</h5>
                <div>
                    <button class="btn btn-outline-primary me-2" onclick="refreshStudents()">
                        <i class="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                    <button class="btn btn-outline-success" onclick="exportStudentsList()">
                        <i class="fas fa-download me-2"></i>Export
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Courses</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        students.forEach(student => {
            const courseCount = student.courses ? student.courses.length : 0;
            html += `
                <tr>
                    <td><span class="badge bg-secondary">${student.id}</span></td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.department || 'N/A'}</td>
                    <td><span class="badge bg-info">${courseCount}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="viewStudentDetails('${student.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="viewStudentResults('${student.id}')">
                            <i class="fas fa-chart-bar"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        studentsContainer.innerHTML = html;
    }

    showNoStudentsMessage() {
        const studentsContainer = document.getElementById('students');
        if (studentsContainer) {
        studentsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No students found</h5>
                <p class="text-muted">Unable to load your students. Please try again later.</p>
                <button class="btn btn-primary" onclick="refreshStudents()">
                    <i class="fas fa-sync-alt me-2"></i>Retry
                </button>
            </div>
        `;
        }
    }

    async loadReportsPage() {
        console.log('Loading reports page...');
        try {
            if (window.apiClient) {
            const response = await window.apiClient.getLecturerReports();
            if (response.success) {
                this.displayReports(response.reports);
                } else {
                    this.showNoReportsMessage();
                }
            } else {
                this.showNoReportsMessage();
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            this.showNoReportsMessage();
        }
    }

    displayReports(reports) {
        const reportsContainer = document.getElementById('reports');
        if (!reportsContainer) return;
        
        if (!reports || reports.length === 0) {
            reportsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No reports available</h5>
                    <p class="text-muted">No reports have been generated yet.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="mb-0">Reports</h5>
                <div>
                    <button class="btn btn-primary" onclick="generateNewReport()">
                        <i class="fas fa-plus me-2"></i>Generate Report
                    </button>
                </div>
            </div>
            <div class="row g-4">
        `;

        reports.forEach(report => {
            const date = new Date(report.generatedAt).toLocaleDateString();
            html += `
                <div class="col-lg-6 col-xl-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h6 class="card-title mb-1">${report.title}</h6>
                                    <p class="text-muted mb-0">${report.description}</p>
                                </div>
                                <span class="badge bg-${report.type === 'feedback' ? 'success' : 'primary'}">${report.type}</span>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">Generated: ${date}</small>
                            </div>
                            <div class="d-grid gap-2">
                                <button class="btn btn-sm btn-outline-primary" onclick="viewReport('${report.id}')">
                                    <i class="fas fa-eye me-2"></i>View Report
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="downloadReport('${report.id}')">
                                    <i class="fas fa-download me-2"></i>Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        reportsContainer.innerHTML = html;
    }

    showNoReportsMessage() {
        const reportsContainer = document.getElementById('reports');
        if (reportsContainer) {
        reportsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No reports available</h5>
                <p class="text-muted">Unable to load reports. Please try again later.</p>
                <button class="btn btn-primary" onclick="generateNewReport()">
                    <i class="fas fa-plus me-2"></i>Generate Report
                </button>
            </div>
        `;
        }
    }

    loadProfilePage() {
        const profilePage = document.getElementById('profile');
        if (profilePage) {
            profilePage.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5><i class="fas fa-user me-2"></i>Lecturer Profile</h5>
                    <button class="btn btn-primary">
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
                                <h5>Dr. John Smith</h5>
                                <p class="text-muted">Lecturer ID: LEC001</p>
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
                                        <p><strong>Full Name:</strong> Dr. John Smith</p>
                                        <p><strong>Lecturer ID:</strong> LEC001</p>
                                        <p><strong>Email:</strong> john.smith@university.edu</p>
                                        <p><strong>Phone:</strong> +234 801 234 5678</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Department:</strong> Computer Science</p>
                                        <p><strong>Position:</strong> Senior Lecturer</p>
                                        <p><strong>Date of Birth:</strong> 15 March 1980</p>
                                        <p><strong>Gender:</strong> Male</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
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
}

// Global functions
function navigateToPage(page) {
    if (lecturerDashboard) {
    lecturerDashboard.navigateToPage(page);
    }
}

function refreshAnalytics() {
    if (lecturerDashboard) {
    lecturerDashboard.loadFeedbackAnalytics();
    Utils.showNotification('Analytics refreshed successfully!', 'success');
    }
}

function exportFeedbackAnalytics(format) {
    Utils.showNotification(`Exporting feedback analytics as ${format.toUpperCase()}...`, 'info');
    // Implementation for exporting feedback analytics
}

function viewCourseFeedback(courseCode) {
    Utils.showNotification(`Viewing feedback for ${courseCode}`, 'info');
}

function viewFeedbackDetail(feedbackId) {
    Utils.showNotification(`Viewing feedback details for ${feedbackId}`, 'info');
}

function viewCourseDetails(courseCode) {
    Utils.showNotification(`Viewing details for ${courseCode}`, 'info');
}

// Global functions for new pages
function refreshCourses() {
    if (lecturerDashboard) {
    lecturerDashboard.loadCoursesPage();
    Utils.showNotification('Courses refreshed successfully!', 'success');
    }
}

function refreshStudents() {
    if (lecturerDashboard) {
    lecturerDashboard.loadStudentsPage();
    Utils.showNotification('Students refreshed successfully!', 'success');
    }
}

function exportStudentsList() {
    Utils.showNotification('Exporting students list...', 'info');
    // Implementation for exporting students list
}

function viewStudentDetails(studentId) {
    Utils.showNotification(`Viewing details for student ${studentId}`, 'info');
    // Implementation for viewing student details
}

function viewStudentResults(studentId) {
    Utils.showNotification(`Viewing results for student ${studentId}`, 'info');
    // Implementation for viewing student results
}

function generateNewReport() {
    Utils.showNotification('Generating new report...', 'info');
    // Implementation for generating new report
}

function viewReport(reportId) {
    Utils.showNotification(`Viewing report ${reportId}`, 'info');
    // Implementation for viewing report
}

function downloadReport(reportId) {
    Utils.showNotification(`Downloading report ${reportId}`, 'info');
    // Implementation for downloading report
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
    }
}

// Additional utility functions for the dashboard
function downloadCSVTemplate() {
    Utils.showNotification('Downloading CSV template...', 'info');
    // Implementation for downloading CSV template
}

function processCSVUpload() {
    Utils.showNotification('Processing CSV upload...', 'info');
    // Implementation for processing CSV upload
}

function downloadBulkTemplate() {
    Utils.showNotification('Downloading bulk upload template...', 'info');
    // Implementation for downloading bulk template
}

function processBulkUpload() {
    Utils.showNotification('Processing bulk upload...', 'info');
    // Implementation for processing bulk upload
}

function bulkUpload() {
    Utils.showNotification('Processing bulk upload...', 'info');
    // Implementation for bulk upload
}

function downloadCurrentReport() {
    Utils.showNotification('Downloading current report...', 'info');
    // Implementation for downloading current report
}

// Test function for debugging navigation
function testNavigation() {
    console.log('Testing navigation...');
    console.log('lecturerDashboard:', window.lecturerDashboard);
    console.log('Current page:', window.lecturerDashboard ? window.lecturerDashboard.currentPage : 'undefined');
    console.log('Content pages:', document.querySelectorAll('.content-page'));
    console.log('Active content page:', document.querySelector('.content-page.active'));
    console.log('Nav links:', document.querySelectorAll('.nav-link[data-page]'));
    
    // Test manual navigation
    if (window.lecturerDashboard) {
        console.log('Testing navigation to courses page...');
        window.lecturerDashboard.navigateToPage('courses');
    } else {
        console.error('Lecturer dashboard not available!');
    }
}

// Function to manually test content loading
function testContentLoading() {
    console.log('Testing content loading...');
    
    // Test showing/hiding content pages manually
    const pages = ['overview', 'courses', 'results', 'feedback', 'students', 'reports', 'profile'];
    
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            const computedStyle = window.getComputedStyle(page);
            console.log(`${pageId}:`, {
                element: page,
                classes: page.className,
                display: page.style.display,
                computedDisplay: computedStyle.display,
                computedVisibility: computedStyle.visibility,
                computedOpacity: computedStyle.opacity,
                active: page.classList.contains('active')
            });
        } else {
            console.error(`Page ${pageId} not found!`);
        }
    });
    
    // Test manual show/hide
    console.log('Testing manual show/hide...');
    const overview = document.getElementById('overview');
    const courses = document.getElementById('courses');
    
    if (overview && courses) {
        overview.style.display = 'none';
        courses.style.display = 'block';
        console.log('Manually hidden overview, showed courses');
        
        // Restore after 2 seconds
        setTimeout(() => {
            overview.style.display = 'block';
            courses.style.display = 'none';
            console.log('Restored original state');
        }, 2000);
    }
}

// Function to check CSS computed styles
function checkCSSStyles() {
    console.log('=== CSS Styles Check ===');
    const pages = ['overview', 'courses', 'results', 'feedback', 'students', 'reports', 'profile'];
    
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            const computedStyle = window.getComputedStyle(page);
            console.log(`${pageId}:`, {
                id: page.id,
                className: page.className,
                inlineDisplay: page.style.display,
                computedDisplay: computedStyle.display,
                computedVisibility: computedStyle.visibility,
                computedOpacity: computedStyle.opacity,
                computedHeight: computedStyle.height,
                computedWidth: computedStyle.width,
                hasActiveClass: page.classList.contains('active'),
                parentElement: page.parentElement ? page.parentElement.id : 'none'
            });
        }
    });
}

// Manual navigation test function
function manualNavigationTest() {
    console.log('=== Manual Navigation Test ===');
    
    // Test navigation without the dashboard class
    const pages = ['overview', 'courses', 'results', 'feedback', 'students', 'reports', 'profile'];
    
    pages.forEach(pageId => {
        const page = document.getElementById(pageId);
        if (page) {
            console.log(`Testing ${pageId}...`);
            
            // Hide all pages first
            pages.forEach(hideId => {
                const hidePage = document.getElementById(hideId);
                if (hidePage) {
                    hidePage.style.display = 'none';
                    hidePage.classList.remove('active');
                }
            });
            
            // Show current page
            page.style.display = 'block';
            page.classList.add('active');
            
            console.log(`Showed ${pageId}, hidden others`);
            
            // Wait a bit then restore
            setTimeout(() => {
                // Restore overview
                pages.forEach(restoreId => {
                    const restorePage = document.getElementById(restoreId);
                    if (restorePage) {
                        restorePage.style.display = 'none';
                        restorePage.classList.remove('active');
                    }
                });
                
                const overview = document.getElementById('overview');
                if (overview) {
                    overview.style.display = 'block';
                    overview.classList.add('active');
                }
                
                console.log('Restored overview page');
            }, 1000);
            
            return; // Only test first page
        }
    });
}

// Function to check DOM structure
function checkDOMStructure() {
    console.log('=== DOM Structure Check ===');
    console.log('Content pages found:');
    ['overview', 'courses', 'results', 'feedback', 'students', 'reports', 'profile'].forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}:`, element ? 'Found' : 'NOT FOUND');
        if (element) {
            console.log(`  - Classes:`, element.className);
            console.log(`  - Display:`, window.getComputedStyle(element).display);
            console.log(`  - Active:`, element.classList.contains('active'));
        }
    });
    
    console.log('\nNavigation links found:');
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        console.log(`${link.dataset.page}:`, link.textContent.trim());
    });
    
    console.log('\nCurrent active page:', document.querySelector('.content-page.active')?.id || 'None');
}

// Make functions globally available
window.testNavigation = testNavigation;
window.checkDOMStructure = checkDOMStructure;
window.testContentLoading = testContentLoading;
window.checkCSSStyles = checkCSSStyles; // Add this line to make checkCSSStyles globally available
window.manualNavigationTest = manualNavigationTest; // Add this line to make manualNavigationTest globally available

// Simple test function that can be run from console
function simpleTest() {
    console.log('=== Simple Test ===');
    
    // Check if elements exist
    const overview = document.getElementById('overview');
    const courses = document.getElementById('courses');
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    
    console.log('Overview element:', overview);
    console.log('Courses element:', courses);
    console.log('Nav links:', navLinks);
    
    if (overview && courses) {
        console.log('Testing manual show/hide...');
        
        // Hide overview, show courses
        overview.style.display = 'none';
        courses.style.display = 'block';
        
        console.log('Overview display:', overview.style.display);
        console.log('Courses display:', courses.style.display);
        
        // Wait 2 seconds then restore
        setTimeout(() => {
            overview.style.display = 'block';
            courses.style.display = 'none';
            console.log('Restored original state');
        }, 2000);
    }
    
    // Test navigation click
    const coursesLink = document.querySelector('[data-page="courses"]');
    if (coursesLink) {
        console.log('Testing courses link click...');
        coursesLink.click();
    }
}

// Make simpleTest globally available
window.simpleTest = simpleTest;

// Global test function to check if dashboard is working
window.testDashboardWorking = function() {
    console.log('=== Dashboard Status Check ===');
    console.log('Auth object available:', typeof window.auth !== 'undefined');
    console.log('API Client available:', typeof window.apiClient !== 'undefined');
    console.log('Lecturer Dashboard available:', typeof window.lecturerDashboard !== 'undefined');
    
    if (window.lecturerDashboard) {
        console.log('Current page:', window.lecturerDashboard.currentPage);
        console.log('Content pages found:', document.querySelectorAll('.content-page').length);
        console.log('Active content page:', document.querySelector('.content-page.active')?.id);
    }
    
    // Test navigation
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    console.log('Navigation links found:', navLinks.length);
    
    // Test content visibility
    document.querySelectorAll('.content-page').forEach(page => {
        const isVisible = page.style.display !== 'none' && !page.classList.contains('d-none');
        console.log(`Page ${page.id}: visible=${isVisible}, display=${page.style.display}, classes=${page.className}`);
    });
    
    console.log('=== End Dashboard Status Check ===');
    return 'Dashboard status check completed. Check console for details.';
};

// Initialize lecturer dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Creating lecturer dashboard...');
    console.log('Auth object available:', typeof window.auth !== 'undefined');
    console.log('API Client available:', typeof window.apiClient !== 'undefined');
    
    // Small delay to ensure all elements are properly rendered
    setTimeout(() => {
        try {
            window.lecturerDashboard = new LecturerDashboard();
            console.log('Lecturer dashboard created and assigned to window.lecturerDashboard');
            
            // Check DOM structure after initialization
            if (window.checkDOMStructure) {
                window.checkDOMStructure();
            }
        } catch (error) {
            console.error('Error creating lecturer dashboard:', error);
        }
    }, 100);
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('DOM already loaded, initializing immediately...');
    setTimeout(() => {
        try {
            window.lecturerDashboard = new LecturerDashboard();
            console.log('Lecturer dashboard created immediately');
            
            if (window.checkDOMStructure) {
                window.checkDOMStructure();
            }
        } catch (error) {
            console.error('Error creating lecturer dashboard immediately:', error);
        }
    }, 100);
} 