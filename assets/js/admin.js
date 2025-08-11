// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.currentPage = 'feedback';
        this.filteredFeedback = [];
        this.init();
    }

    init() {
        // Wait for auth to be available and DOM to be ready
        if (typeof auth === 'undefined') {
            console.log('Auth not ready yet, waiting...');
            setTimeout(() => this.init(), 100);
            return;
        }
        
        if (!auth.requireAuth('admin')) {
            console.log('Auth check failed, not admin');
            return;
        }
        
        console.log('AdminDashboard initializing...');
        this.setupEventListeners();
        this.loadFeedbackManagement();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        console.log('Found nav links:', navLinks.length);
        
        navLinks.forEach(link => {
            console.log('Setting up listener for:', link.dataset.page);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                console.log('Nav link clicked:', page);
                this.navigateToPage(page);
            });
        });
    }

    navigateToPage(page) {
        console.log('Navigating to page:', page);
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        const targetLink = document.querySelector(`[data-page="${page}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        } else {
            console.error('Could not find nav link for page:', page);
        }
        this.currentPage = page;
        this.loadPageContent();
    }

    loadPageContent() {
        console.log('Loading page content for:', this.currentPage);
        const contentPages = document.querySelectorAll('.content-page');
        console.log('Found content pages:', contentPages.length);
        contentPages.forEach(page => {
            console.log('Content page:', page.id, 'removing active class');
            page.classList.remove('active');
        });
        
        const currentPageElement = document.getElementById(this.currentPage);
        console.log('Looking for content element with id:', this.currentPage);
        console.log('Found element:', currentPageElement);
        
        if (currentPageElement) {
            console.log('Adding active class to:', this.currentPage);
            currentPageElement.classList.add('active');
        } else {
            console.error('Could not find content element for page:', this.currentPage);
        }
        
        switch (this.currentPage) {
            case 'feedback': this.loadFeedbackManagement(); break;
            case 'departments': 
                console.log('Loading departments page...');
                this.loadDepartmentsPage(); 
                break;
            case 'users': this.loadUsersPage(); break;
            case 'courses': this.loadCoursesPage(); break;
            case 'reports': this.loadReportsPage(); break;
            case 'profile': this.loadProfilePage(); break;
            default:
                console.log('Unknown page:', this.currentPage);
        }
    }

    loadFeedbackManagement() {
        if (!window.feedbackManager) return;
        
        const analytics = window.feedbackManager.getOverallAnalytics();
        if (!analytics) {
            this.showNoFeedbackMessage();
            return;
        }
        
        this.updateStatistics(analytics);
        this.loadOverallRatingDistribution(analytics);
        this.loadTopLecturers();
        this.loadAllFeedback();
        this.populateFilters();
    }

    showNoFeedbackMessage() {
        document.getElementById('totalFeedback').textContent = '0';
        document.getElementById('avgRating').textContent = '0.0';
        document.getElementById('totalCourses').textContent = '0';
        document.getElementById('totalLecturers').textContent = '0';
        
        document.getElementById('overallRatingDistribution').innerHTML = 
            '<div class="text-center py-4"><i class="fas fa-chart-bar fa-3x text-muted mb-3"></i><h6 class="text-muted">No feedback data available</h6></div>';
        
        document.getElementById('topLecturers').innerHTML = 
            '<div class="text-center py-4"><i class="fas fa-trophy fa-3x text-muted mb-3"></i><h6 class="text-muted">No lecturer data available</h6></div>';
        
        document.getElementById('feedbackList').innerHTML = 
            '<div class="text-center py-4"><i class="fas fa-list fa-3x text-muted mb-3"></i><h6 class="text-muted">No feedback available</h6></div>';
    }

    updateStatistics(analytics) {
        document.getElementById('totalFeedback').textContent = analytics.totalFeedbacks;
        document.getElementById('avgRating').textContent = analytics.averageRating;
        document.getElementById('totalCourses').textContent = analytics.totalCourses;
        document.getElementById('totalLecturers').textContent = analytics.totalLecturers;
    }

    loadOverallRatingDistribution(analytics) {
        const allFeedback = window.feedbackManager.getAllFeedback();
        const ratingDistribution = {
            1: allFeedback.filter(f => f.rating === 1).length,
            2: allFeedback.filter(f => f.rating === 2).length,
            3: allFeedback.filter(f => f.rating === 3).length,
            4: allFeedback.filter(f => f.rating === 4).length,
            5: allFeedback.filter(f => f.rating === 5).length
        };

        let html = '<div class="rating-distribution">';
        for (let i = 5; i >= 1; i--) {
            const count = ratingDistribution[i];
            const percentage = analytics.totalFeedbacks > 0 ? (count / analytics.totalFeedbacks * 100).toFixed(1) : 0;
            html += `
                <div class="rating-bar">
                    <div class="rating-label">${i} <i class="fas fa-star text-warning"></i></div>
                    <div class="rating-progress">
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-warning" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                    <div class="rating-count">${count}</div>
                </div>
            `;
        }
        html += '</div>';
        document.getElementById('overallRatingDistribution').innerHTML = html;
    }

    loadTopLecturers() {
        const lecturers = window.feedbackManager.getLecturers();
        const lecturerAnalytics = lecturers.map(lecturer => {
            const analytics = window.feedbackManager.getLecturerAnalytics(lecturer.id);
            return {
                ...lecturer,
                analytics: analytics
            };
        }).filter(l => l.analytics !== null)
          .sort((a, b) => parseFloat(b.analytics.averageRating) - parseFloat(a.analytics.averageRating))
          .slice(0, 5);

        let html = '';
        if (lecturerAnalytics.length === 0) {
            html = '<div class="text-center py-4"><i class="fas fa-trophy fa-3x text-muted mb-3"></i><h6 class="text-muted">No lecturer data available</h6></div>';
        } else {
            lecturerAnalytics.forEach((lecturer, index) => {
                const ratingClass = lecturer.analytics.averageRating >= 4.0 ? 'text-success' : 
                                  lecturer.analytics.averageRating >= 3.0 ? 'text-primary' : 
                                  lecturer.analytics.averageRating >= 2.0 ? 'text-warning' : 'text-danger';
                
                html += `
                    <div class="feedback-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-2">
                                    <span class="badge bg-primary me-2">#${index + 1}</span>
                                    <h6 class="mb-0">${lecturer.name}</h6>
                                </div>
                                <p class="text-muted mb-1">${lecturer.department}</p>
                                <div class="d-flex align-items-center mb-2">
                                    <div class="feedback-rating me-3">${this.generateStarRating(parseFloat(lecturer.analytics.averageRating))}</div>
                                    <span class="fw-bold ${ratingClass}">${lecturer.analytics.averageRating}/5</span>
                                </div>
                                <p class="text-muted mb-0">
                                    <i class="fas fa-comments me-1"></i>${lecturer.analytics.totalFeedbacks} feedback${lecturer.analytics.totalFeedbacks !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        document.getElementById('topLecturers').innerHTML = html;
    }

    loadAllFeedback() {
        const allFeedback = window.feedbackManager.getAllFeedback();
        this.filteredFeedback = [...allFeedback];
        this.displayFeedbackList();
    }

    displayFeedbackList() {
        let html = '';
        if (this.filteredFeedback.length === 0) {
            html = '<div class="text-center py-4"><i class="fas fa-list fa-3x text-muted mb-3"></i><h6 class="text-muted">No feedback available</h6></div>';
        } else {
            this.filteredFeedback.forEach(feedback => {
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
                                    <div class="feedback-rating me-3">${this.generateStarRating(feedback.rating)}</div>
                                    <span class="feedback-timestamp"><i class="fas fa-clock me-1"></i>${date} at ${time}</span>
                                </div>
                            </div>
                            <div class="ms-3">
                                <span class="anonymous-badge"><i class="fas fa-user-secret me-1"></i>Anonymous</span>
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-info" onclick="viewFeedbackDetail('${feedback.id}')">
                                        <i class="fas fa-eye"></i> Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        document.getElementById('feedbackList').innerHTML = html;
    }

    populateFilters() {
        const courses = window.feedbackManager.getCourses();
        const lecturers = window.feedbackManager.getLecturers();
        
        const courseFilter = document.getElementById('courseFilter');
        const lecturerFilter = document.getElementById('lecturerFilter');
        
        if (courseFilter) {
            courseFilter.innerHTML = '<option value="">All Courses</option>';
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = `${course.code} - ${course.title}`;
                courseFilter.appendChild(option);
            });
        }
        
        if (lecturerFilter) {
            lecturerFilter.innerHTML = '<option value="">All Lecturers</option>';
            lecturers.forEach(lecturer => {
                const option = document.createElement('option');
                option.value = lecturer.id;
                option.textContent = lecturer.name;
                lecturerFilter.appendChild(option);
            });
        }
    }

    generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '<i class="fas fa-star text-warning"></i>' : '<i class="far fa-star text-muted"></i>';
        }
        return stars;
    }

    loadUsersPage() {
        document.getElementById('users').innerHTML = '<div class="card"><div class="card-body"><h5>User Management</h5><p>User management functionality will be implemented here.</p></div></div>';
    }

    loadCoursesPage() {
        document.getElementById('courses').innerHTML = '<div class="card"><div class="card-body"><h5>Course Management</h5><p>Course management functionality will be implemented here.</p></div></div>';
    }

    loadReportsPage() {
        document.getElementById('reports').innerHTML = '<div class="card"><div class="card-body"><h5>Reports</h5><p>Reports functionality will be implemented here.</p></div></div>';
    }

    loadProfilePage() {
        document.getElementById('profile').innerHTML = '<div class="card"><div class="card-body"><h5>Admin Profile</h5><p>Profile management functionality will be implemented here.</p></div></div>';
    }

    async loadDepartmentsPage() {
        console.log('AdminDashboard.loadDepartmentsPage() called');
        await loadDepartmentsPage();
    }
}

// Global functions
function navigateToPage(page) { 
    if (adminDashboard) {
        adminDashboard.navigateToPage(page); 
    } else {
        console.error('AdminDashboard not initialized yet');
    }
}

function refreshFeedbackData() { 
    if (adminDashboard) {
        adminDashboard.loadFeedbackManagement(); 
        Utils.showNotification('Feedback data refreshed successfully!', 'success'); 
    } else {
        console.error('AdminDashboard not initialized yet');
    }
}

function exportAllFeedback(format) {
    if (!window.feedbackManager) {
        Utils.showNotification('Feedback manager not available', 'error');
        return;
    }
    const csvContent = window.feedbackManager.exportFeedbackToCSV();
    if (!csvContent) {
        Utils.showNotification('No feedback data to export', 'warning');
        return;
    }
    const filename = `all_feedback_${new Date().toISOString().split('T')[0]}.${format}`;
    window.feedbackManager.downloadCSV(csvContent, filename);
    Utils.showNotification(`All feedback exported as ${format.toUpperCase()} successfully!`, 'success');
}

function filterFeedback() {
    if (!window.feedbackManager) return;
    
    const courseFilter = document.getElementById('courseFilter').value;
    const lecturerFilter = document.getElementById('lecturerFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    const searchFilter = document.getElementById('searchFeedback').value.toLowerCase();
    
    let allFeedback = window.feedbackManager.getAllFeedback();
    
    // Apply filters
    if (courseFilter) {
        allFeedback = allFeedback.filter(f => f.courseCode === courseFilter);
    }
    
    if (lecturerFilter) {
        allFeedback = allFeedback.filter(f => f.lecturerId === lecturerFilter);
    }
    
    if (ratingFilter) {
        const minRating = parseInt(ratingFilter);
        allFeedback = allFeedback.filter(f => f.rating >= minRating);
    }
    
    if (searchFilter) {
        allFeedback = allFeedback.filter(f => 
            f.comment && f.comment.toLowerCase().includes(searchFilter)
        );
    }
    
    if (adminDashboard) {
        adminDashboard.filteredFeedback = allFeedback;
        adminDashboard.displayFeedbackList();
    } else {
        console.error('AdminDashboard not initialized yet');
    }
}

function viewFeedbackDetail(feedbackId) {
    if (!window.feedbackManager) {
        Utils.showNotification('Feedback manager not available', 'error');
        return;
    }
    
    const allFeedback = window.feedbackManager.getAllFeedback();
    const feedback = allFeedback.find(f => f.id === feedbackId);
    
    if (!feedback) {
        Utils.showNotification('Feedback not found', 'error');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('feedbackDetailModal'));
    const content = document.getElementById('feedbackDetailContent');
    
    const date = new Date(feedback.submittedAt).toLocaleDateString();
    const time = new Date(feedback.submittedAt).toLocaleTimeString();
    
    content.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Course Information</h6>
                <p><strong>Course Code:</strong> ${feedback.courseCode}</p>
                <p><strong>Course Title:</strong> ${feedback.courseTitle}</p>
                <p><strong>Lecturer:</strong> ${feedback.lecturerName}</p>
                <p><strong>Semester:</strong> ${feedback.semester}</p>
            </div>
            <div class="col-md-6">
                <h6>Feedback Details</h6>
                <p><strong>Rating:</strong> ${feedback.rating}/5</p>
                <p><strong>Submitted:</strong> ${date} at ${time}</p>
                <p><strong>Status:</strong> <span class="badge bg-success">Anonymous</span></p>
            </div>
        </div>
        ${feedback.comment ? `
        <div class="mt-3">
            <h6>Student Comment</h6>
            <div class="feedback-comment">
                "${feedback.comment}"
            </div>
        </div>
        ` : ''}
        <div class="mt-3">
            <h6>Rating</h6>
            <div class="feedback-rating">
                ${adminDashboard ? adminDashboard.generateStarRating(feedback.rating) : 'Rating: ' + feedback.rating + '/5'}
                <span class="ms-2 fw-bold">${feedback.rating}/5</span>
            </div>
        </div>
    `;
    
    modal.show();
}

// Initialize admin dashboard when DOM is ready
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, initializing AdminDashboard...');
    adminDashboard = new AdminDashboard();
});

// Department management functions
async function loadDepartmentsPage() {
    console.log('Global loadDepartmentsPage() called');
    try {
        console.log('Calling API client getDepartments()...');
        const response = await window.apiClient.getDepartments();
        console.log('API response:', response);
        if (response.success) {
            console.log('Displaying departments:', response.departments);
            displayDepartments(response.departments);
        } else {
            console.error('API returned error:', response);
            showAlert('Failed to load departments', 'danger');
        }
    } catch (error) {
        console.error('Error loading departments:', error);
        showAlert('Error loading departments', 'danger');
    }
}

function displayDepartments(departments) {
    console.log('displayDepartments() called with:', departments);
    const departmentsContainer = document.getElementById('departments');
    console.log('Departments container:', departmentsContainer);
    
    if (!departments || departments.length === 0) {
        console.log('No departments found, showing empty state');
        departmentsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-building fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No departments found</h5>
                <p class="text-muted">Add your first department to get started.</p>
                <button class="btn btn-primary" onclick="showModal('addDepartmentModal')">
                    <i class="fas fa-plus me-2"></i>Add Department
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="mb-0">Departments Management</h5>
            <button class="btn btn-primary" onclick="showModal('addDepartmentModal')">
                <i class="fas fa-plus me-2"></i>Add Department
            </button>
        </div>
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Department Name</th>
                                <th>Code</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `;

    departments.forEach(dept => {
        const createdDate = new Date(dept.created_at).toLocaleDateString();
        html += `
            <tr>
                <td>${dept.name}</td>
                <td><span class="badge bg-secondary">${dept.code}</span></td>
                <td>${createdDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.code}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDepartment(${dept.id}, '${dept.name}')">
                        <i class="fas fa-trash"></i>
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

    departmentsContainer.innerHTML = html;
}

async function addDepartment() {
    const name = document.getElementById('deptName').value.trim();
    const code = document.getElementById('deptCode').value.trim();
    
    if (!name || !code) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    try {
        const response = await window.apiClient.addDepartment({ name, code });
        if (response.success) {
            showAlert('Department added successfully!', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addDepartmentModal')).hide();
            document.getElementById('addDepartmentForm').reset();
            loadDepartmentsPage();
        } else {
            showAlert(response.error || 'Failed to add department', 'danger');
        }
    } catch (error) {
        console.error('Error adding department:', error);
        showAlert('Error adding department', 'danger');
    }
}

function editDepartment(id, name, code) {
    // TODO: Implement edit department modal
    showAlert('Edit department functionality coming soon!', 'info');
}

async function deleteDepartment(id, name) {
    if (!confirm(`Are you sure you want to delete the department "${name}"?`)) {
        return;
    }
    
    try {
        const response = await window.apiClient.deleteDepartment(id);
        if (response.success) {
            showAlert('Department deleted successfully!', 'success');
            loadDepartmentsPage();
        } else {
            showAlert(response.error || 'Failed to delete department', 'danger');
        }
    } catch (error) {
        console.error('Error deleting department:', error);
        showAlert('Error deleting department', 'danger');
    }
}

function showAlert(message, type) {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert alert at the top of the content area
    const contentArea = document.getElementById('contentArea');
    if (contentArea) {
        contentArea.insertBefore(alertDiv, contentArea.firstChild);
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
} 