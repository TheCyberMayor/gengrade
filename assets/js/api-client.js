/**
 * IntellGrade API Client
 * Handles all API calls to the Flask backend
 */

class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:5000/api';
        this.credentials = 'include'; // Include cookies for session management
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            credentials: this.credentials,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication methods
    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    }

    async checkAuth() {
        return this.request('/auth/check');
    }

    // Student methods
    async getStudentResults() {
        return this.request('/student/results');
    }

    async getStudentTranscript() {
        return this.request('/student/transcript');
    }

    // Feedback methods
    async submitFeedback(feedbackData) {
        return this.request('/feedback/submit', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    }

    async getFeedbackCourses() {
        return this.request('/feedback/courses');
    }

    // Lecturer methods
    async getLecturerFeedback() {
        return this.request('/lecturer/feedback');
    }

    async getLecturerCourses() {
        return this.request('/lecturer/courses');
    }

    async getLecturerStudents() {
        return this.request('/lecturer/students');
    }

    async getLecturerReports() {
        return this.request('/lecturer/reports');
    }

    // Admin methods
    async getAdminOverview() {
        return this.request('/admin/overview');
    }

    async getAllFeedback() {
        return this.request('/admin/feedback');
    }

    // Results management
    async addResult(resultData) {
        return this.request('/results/add', {
            method: 'POST',
            body: JSON.stringify(resultData)
        });
    }

    async updateResult(resultData) {
        return this.request('/results/update', {
            method: 'PUT',
            body: JSON.stringify(resultData)
        });
    }

    // Utility methods
    async getStudents() {
        return this.request('/users/students');
    }

    async getCourses() {
        return this.request('/courses');
    }

    // Department methods
    async getDepartments() {
        return this.request('/departments');
    }

    async addDepartment(departmentData) {
        return this.request('/departments', {
            method: 'POST',
            body: JSON.stringify(departmentData)
        });
    }

    async updateDepartment(deptId, departmentData) {
        return this.request(`/departments/${deptId}`, {
            method: 'PUT',
            body: JSON.stringify(departmentData)
        });
    }

    async deleteDepartment(deptId) {
        return this.request(`/departments/${deptId}`, {
            method: 'DELETE'
        });
    }
}

// Global API client instance
window.apiClient = new APIClient();

// Global auth manager instance (defined in auth.js)
// window.authManager will be set by auth.js

// Utility functions for API responses
class APIUtils {
    static showSuccess(message) {
        // You can implement your preferred notification system
        alert(message);
    }

    static showError(message) {
        // You can implement your preferred notification system
        alert('Error: ' + message);
    }

    static showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        }
    }

    static hideLoading(element, originalContent) {
        if (element && originalContent) {
            element.innerHTML = originalContent;
        }
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 45) return 'D+';
        if (score >= 40) return 'D';
        return 'F';
    }

    static getGradeColor(grade) {
        const gradeColors = {
            'A+': 'success', 'A': 'success', 'A-': 'success',
            'B+': 'primary', 'B': 'primary', 'B-': 'primary',
            'C+': 'warning', 'C': 'warning', 'C-': 'warning',
            'D+': 'danger', 'D': 'danger',
            'F': 'danger'
        };
        return gradeColors[grade] || 'secondary';
    }

    static generateStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star text-warning"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt text-warning"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star text-warning"></i>';
        }
        return stars;
    }
}

// Global API utils instance
window.apiUtils = APIUtils; 