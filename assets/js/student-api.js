// Student Dashboard JavaScript - API Version

class StudentDashboard {
    constructor() {
        this.currentPage = 'overview';
        this.init();
    }

    init() {
        // Check authentication
        if (!window.authManager.requireAuth('student')) {
            return;
        }

        this.setupEventListeners();
        this.loadUserInfo();
        this.loadPageContent();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage(e.target.closest('.nav-link').dataset.page);
            });
        });

        // Form submissions
        document.getElementById('feedbackForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        // Rating stars
        this.setupRatingStars();
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
        const user = window.authManager.getCurrentUser();
        if (user) {
            document.getElementById('studentName').textContent = user.name;
        }
    }

    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update content
        this.currentPage = page;
        this.loadPageContent();
        this.updatePageTitle();
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
        // Hide all pages
        document.querySelectorAll('.content-page').forEach(page => {
            page.style.display = 'none';
        });

        // Show current page
        const currentPageElement = document.getElementById(this.currentPage);
        if (currentPageElement) {
            currentPageElement.style.display = 'block';
        }

        // Load page-specific content
        switch (this.currentPage) {
            case 'overview':
                await this.loadOverviewPage();
                break;
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
        }
    }

    async loadOverviewPage() {
        try {
            const resultsResponse = await window.apiClient.getStudentResults();
            const feedbackResponse = await window.apiClient.getFeedbackCourses();
            
            if (resultsResponse.success) {
                this.displayOverviewStats(resultsResponse.results, feedbackResponse.courses);
            }
        } catch (error) {
            console.error('Error loading overview:', error);
            window.apiUtils.showError('Failed to load dashboard data');
        }
    }

    displayOverviewStats(results, courses) {
        const overviewContainer = document.getElementById('overview');
        if (!overviewContainer) return;

        // Calculate statistics
        const totalCourses = results.reduce((sum, semester) => sum + semester.courses.length, 0);
        const totalCredits = results.reduce((sum, semester) => 
            sum + semester.courses.reduce((semSum, course) => semSum + (course.unit || 3), 0), 0);
        const averageScore = results.reduce((sum, semester) => 
            sum + semester.courses.reduce((semSum, course) => semSum + course.score, 0), 0) / totalCourses;

        const html = `
            <div class="row">
                <div class="col-md-3 mb-4">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title">${totalCourses}</h4>
                                    <p class="card-text">Total Courses</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-book fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title">${totalCredits}</h4>
                                    <p class="card-text">Total Credits</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-graduation-cap fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title">${averageScore.toFixed(1)}%</h4>
                                    <p class="card-text">Average Score</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-chart-line fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-4">
                    <div class="card bg-warning text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h4 class="card-title">${courses.length}</h4>
                                    <p class="card-text">Available for Feedback</p>
                                </div>
                                <div class="align-self-center">
                                    <i class="fas fa-comments fa-2x"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Recent Results</h5>
                        </div>
                        <div class="card-body">
                            ${this.generateRecentResultsHTML(results)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        overviewContainer.innerHTML = html;
    }

    generateRecentResultsHTML(results) {
        if (!results || results.length === 0) {
            return '<p class="text-muted">No results available yet.</p>';
        }

        // Get the most recent semester's results
        const recentSemester = results[0];
        const recentCourses = recentSemester.courses.slice(0, 5); // Show only 5 most recent

        let html = '<div class="table-responsive"><table class="table table-hover">';
        html += '<thead><tr><th>Course</th><th>Score</th><th>Grade</th><th>Semester</th></tr></thead><tbody>';

        recentCourses.forEach(course => {
            const gradeClass = window.apiUtils.getGradeColor(course.grade);
            html += `
                <tr>
                    <td>
                        <strong>${course.course_code}</strong><br>
                        <small class="text-muted">${course.course_title}</small>
                    </td>
                    <td>${course.score}%</td>
                    <td><span class="badge bg-${gradeClass}">${course.grade}</span></td>
                    <td>${recentSemester.session} - ${recentSemester.semester}</td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    }

    async loadResultsPage() {
        try {
            window.apiUtils.showLoading(document.getElementById('results'));
            const response = await window.apiClient.getStudentResults();
            
            if (response.success) {
                this.displayResults(response.results);
            }
        } catch (error) {
            console.error('Error loading results:', error);
            window.apiUtils.showError('Failed to load results');
        }
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('results');
        if (!resultsContainer) return;

        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No results available</h5>
                    <p class="text-muted">Your academic results will appear here once they are published.</p>
                </div>
            `;
            return;
        }

        let html = '';
        results.forEach((semester, index) => {
            html += this.generateSemesterResultsHTML(semester, index);
        });

        resultsContainer.innerHTML = html;
    }

    generateSemesterResultsHTML(semester, index) {
        const semesterGPA = semester.courses.reduce((sum, course) => sum + course.score, 0) / semester.courses.length;
        const semesterCredits = semester.courses.reduce((sum, course) => sum + (course.unit || 3), 0);

        let html = `
            <div class="card mb-4">
                <div class="card-header" style="cursor: pointer;" onclick="toggleSemester(${index})">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-chevron-down me-2"></i>
                            ${semester.session} - Semester ${semester.semester}
                        </h5>
                        <div>
                            <span class="badge bg-primary me-2">GPA: ${semesterGPA.toFixed(2)}</span>
                            <span class="badge bg-info">Credits: ${semesterCredits}</span>
                        </div>
                    </div>
                </div>
                <div class="card-body" id="semester-${index}" style="display: none;">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Units</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        semester.courses.forEach(course => {
            const gradeClass = window.apiUtils.getGradeColor(course.grade);
            html += `
                <tr>
                    <td><strong>${course.course_code}</strong></td>
                    <td>${course.course_title}</td>
                    <td>${course.unit || 3}</td>
                    <td>${course.score}%</td>
                    <td><span class="badge bg-${gradeClass}">${course.grade}</span></td>
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

        return html;
    }

    async loadFeedbackPage() {
        try {
            const response = await window.apiClient.getFeedbackCourses();
            if (response.success) {
                this.populateFeedbackDropdowns(response.courses);
                this.initializeRatingStars();
            }
        } catch (error) {
            console.error('Error loading feedback courses:', error);
            window.apiUtils.showError('Failed to load courses for feedback');
        }
    }

    populateFeedbackDropdowns(courses) {
        const courseSelect = document.getElementById('feedbackCourse');
        const lecturerSelect = document.getElementById('feedbackLecturer');
        
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Select Course</option>';
            courses.forEach(course => {
                courseSelect.innerHTML += `
                    <option value="${course.id}" data-lecturer="${course.lecturer_id}" data-title="${course.title}">
                        ${course.code} - ${course.title}
                    </option>
                `;
            });
        }

        // Update lecturer dropdown when course is selected
        if (courseSelect && lecturerSelect) {
            courseSelect.addEventListener('change', (e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const lecturerId = selectedOption.dataset.lecturer;
                const lecturerName = courses.find(c => c.id == e.target.value)?.lecturer_name || '';
                
                lecturerSelect.innerHTML = '<option value="">Select Lecturer</option>';
                if (lecturerId) {
                    lecturerSelect.innerHTML += `<option value="${lecturerId}">${lecturerName}</option>`;
                }
            });
        }
    }

    initializeRatingStars() {
        const ratingContainer = document.getElementById('ratingContainer');
        if (!ratingContainer) return;

        ratingContainer.innerHTML = `
            <div class="rating-stars">
                <i class="far fa-star" data-rating="1"></i>
                <i class="far fa-star" data-rating="2"></i>
                <i class="far fa-star" data-rating="3"></i>
                <i class="far fa-star" data-rating="4"></i>
                <i class="far fa-star" data-rating="5"></i>
            </div>
            <div class="rating-text mt-2">Click to rate</div>
        `;
    }

    async submitFeedback() {
        const courseId = document.getElementById('feedbackCourse').value;
        const lecturerId = document.getElementById('feedbackLecturer').value;
        const rating = document.getElementById('ratingValue').value;
        const comment = document.getElementById('feedbackComment').value;
        const semester = document.getElementById('feedbackSemester').value;

        if (!courseId || !lecturerId || !rating || !semester) {
            window.apiUtils.showError('Please fill in all required fields');
            return;
        }

        try {
            const response = await window.apiClient.submitFeedback({
                course_id: courseId,
                lecturer_id: lecturerId,
                rating: parseInt(rating),
                comment: comment,
                semester: semester
            });

            if (response.success) {
                window.apiUtils.showSuccess(response.message);
                // Reset form
                document.getElementById('feedbackForm').reset();
                this.initializeRatingStars();
                // Close modal if it exists
                const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
                if (modal) modal.hide();
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            window.apiUtils.showError(error.message || 'Failed to submit feedback');
        }
    }

    async loadTranscriptPage() {
        try {
            window.apiUtils.showLoading(document.getElementById('transcript'));
            const response = await window.apiClient.getStudentTranscript();
            
            if (response.success) {
                this.displayTranscript(response);
            }
        } catch (error) {
            console.error('Error loading transcript:', error);
            window.apiUtils.showError('Failed to load transcript');
        }
    }

    displayTranscript(data) {
        const transcriptContainer = document.getElementById('transcript');
        if (!transcriptContainer) return;

        const html = `
            <div class="card">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Academic Transcript</h5>
                        <div>
                            <button class="btn btn-primary btn-sm" onclick="downloadTranscript()">
                                <i class="fas fa-download me-1"></i>Download PDF
                            </button>
                            <button class="btn btn-secondary btn-sm ms-2" onclick="printTranscript()">
                                <i class="fas fa-print me-1"></i>Print
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <h6>Student Information</h6>
                            <p><strong>Name:</strong> ${data.student.name}</p>
                            <p><strong>ID:</strong> ${data.student.id}</p>
                            <p><strong>Email:</strong> ${data.student.email}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Academic Summary</h6>
                            <p><strong>Total Credits:</strong> ${data.summary.total_credits}</p>
                            <p><strong>Completed Courses:</strong> ${data.summary.completed_courses}</p>
                            <p><strong>Overall GPA:</strong> ${data.summary.overall_gpa}</p>
                            <p><strong>Total Semesters:</strong> ${data.summary.total_semesters}</p>
                        </div>
                    </div>
                    <div class="transcript-content">
                        ${this.generateTranscriptContent(data.results)}
                    </div>
                </div>
            </div>
        `;

        transcriptContainer.innerHTML = html;
    }

    generateTranscriptContent(results) {
        if (!results || results.length === 0) {
            return '<p class="text-muted">No transcript data available.</p>';
        }

        let html = '';
        results.forEach((semester, index) => {
            html += this.generateSemesterHTML(semester, index);
        });

        return html;
    }

    generateSemesterHTML(semester, index) {
        const semesterGPA = semester.semester_gpa.toFixed(2);
        const semesterCredits = semester.semester_credits;

        let html = `
            <div class="semester-section mb-4">
                <div class="semester-header" onclick="toggleSemester(${index})">
                    <h6 class="mb-0">
                        <i class="fas fa-chevron-down me-2"></i>
                        ${semester.session} - Semester ${semester.semester}
                        <span class="badge bg-primary ms-2">GPA: ${semesterGPA}</span>
                        <span class="badge bg-info ms-1">Credits: ${semesterCredits}</span>
                    </h6>
                </div>
                <div class="semester-content" id="semester-${index}" style="display: none;">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead class="table-light">
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Units</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        semester.courses.forEach(course => {
            const gradeClass = window.apiUtils.getGradeColor(course.grade);
            html += `
                <tr>
                    <td><strong>${course.course_code}</strong></td>
                    <td>${course.course_title}</td>
                    <td>${course.unit}</td>
                    <td>${course.score}%</td>
                    <td><span class="badge bg-${gradeClass}">${course.grade}</span></td>
                </tr>
            `;
        });

        html += `
                            </tbody>
                            <tfoot class="table-light">
                                <tr>
                                    <td colspan="2"><strong>Semester Total</strong></td>
                                    <td><strong>${semesterCredits}</strong></td>
                                    <td colspan="2"><strong>GPA: ${semesterGPA}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    async loadProfilePage() {
        const user = window.authManager.getCurrentUser();
        const profileContainer = document.getElementById('profile');
        
        if (!profileContainer) return;

        const html = `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Student Profile</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Personal Information</h6>
                            <p><strong>Name:</strong> ${user.name}</p>
                            <p><strong>Student ID:</strong> ${user.id}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Role:</strong> ${user.role}</p>
                        </div>
                        <div class="col-md-6">
                            <h6>Account Actions</h6>
                            <button class="btn btn-primary mb-2 w-100" onclick="editProfile()">
                                <i class="fas fa-edit me-1"></i>Edit Profile
                            </button>
                            <button class="btn btn-secondary mb-2 w-100" onclick="changePassword()">
                                <i class="fas fa-key me-1"></i>Change Password
                            </button>
                            <button class="btn btn-danger w-100" onclick="logout()">
                                <i class="fas fa-sign-out-alt me-1"></i>Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        profileContainer.innerHTML = html;
    }
}

// Global functions for event handlers
function toggleSemester(index) {
    const content = document.getElementById(`semester-${index}`);
    const icon = content.previousElementSibling.querySelector('i');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        content.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

function submitFeedback() {
    if (window.studentDashboard) {
        window.studentDashboard.submitFeedback();
    }
}

function logout() {
    window.authManager.logout();
}

function editProfile() {
    alert('Profile editing feature will be implemented soon.');
}

function changePassword() {
    alert('Password change feature will be implemented soon.');
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentDashboard = new StudentDashboard();
}); 