// Authentication and User Management using API
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Check if we're in development mode
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                // Only check existing auth if not in development mode
                if (!isDevelopment) {
                    this.checkExistingAuth();
                } else {
                    console.log('Development mode detected, skipping automatic auth check');
                }
            });
        } else {
            this.setupEventListeners();
            // Only check existing auth if not in development mode
            if (!isDevelopment) {
                this.checkExistingAuth();
            } else {
                console.log('Development mode detected, skipping automatic auth check');
            }
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        console.log('Setting up event listeners, loginForm:', loginForm);
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            console.log('Login form event listener added');
        } else {
            console.error('Login form not found!');
        }
    }

    async checkExistingAuth() {
        try {
            const response = await window.apiClient.checkAuth();
            if (response.authenticated) {
                this.currentUser = response.user;
                this.isAuthenticated = true;
                // Redirect to appropriate dashboard if on login page
                if (window.location.pathname.includes('login.html')) {
                    this.redirectToDashboard(response.user.role);
                }
            }
        } catch (error) {
            console.log('No existing authentication found');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        console.log('Login form submitted!');
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        console.log('Login attempt:', { username, password, rememberMe });

        if (!username || !password) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }

        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing in...';
        submitBtn.disabled = true;

        try {
            const response = await window.apiClient.login(username, password);
            console.log('API Response:', response);
            
            this.currentUser = response.user;
            this.isAuthenticated = true;
            
            // Store user data if remember me is checked
            if (rememberMe) {
                localStorage.setItem('intellgrade_user', JSON.stringify(response.user));
            }
            
            this.showAlert('Login successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                this.redirectToDashboard(response.user.role);
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert(error.message || 'Login failed. Please check your credentials.', 'danger');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async logout() {
        console.log('Logout function called');
        try {
            console.log('Calling API logout...');
            await window.apiClient.logout();
            console.log('API logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            console.log('Clearing user data and redirecting...');
            this.currentUser = null;
            this.isAuthenticated = false;
            localStorage.removeItem('intellgrade_user');
            sessionStorage.removeItem('intellgrade_user');
            console.log('Redirecting to landing page...');
            // Redirect to landing page instead of login page
            window.location.href = this.getLandingPagePath();
        }
    }

    redirectToDashboard(role) {
        console.log('Redirecting to dashboard for role:', role);
        let redirectUrl = '';
        
        switch (role) {
            case 'admin':
                redirectUrl = 'admin/dashboard.html';
                break;
            case 'lecturer':
                redirectUrl = 'lecturer/dashboard.html';
                break;
            case 'student':
                redirectUrl = 'student/dashboard.html';
                break;
            default:
                redirectUrl = 'login.html';
        }
        
        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
    }

    showAlert(message, type) {
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

        // Insert alert before the form
        const loginBody = document.querySelector('.login-body');
        if (loginBody) {
            loginBody.insertBefore(alertDiv, loginBody.firstChild);
        }

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    // Helper method to get the correct path to login page
    getLoginPath() {
        // Check if we're in a subdirectory
        const path = window.location.pathname;
        if (path.includes('/lecturer/') || path.includes('/admin/') || path.includes('/student/')) {
            return '../login.html';
        }
        return 'login.html';
    }

    // Helper method to get the correct path to landing page
    getLandingPagePath() {
        // Check if we're in a subdirectory
        const path = window.location.pathname;
        if (path.includes('/lecturer/') || path.includes('/admin/') || path.includes('/student/')) {
            return '../index.html';
        }
        return 'index.html';
    }

    // Check if user is authenticated and redirect if needed
    requireAuth(requiredRole = null) {
        // Allow access in development mode
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isDevelopment) {
            console.log('Development mode detected, allowing access without authentication');
            return true;
        }
        
        if (!this.isAuthenticated) {
            window.location.href = this.getLoginPath();
            return false;
        }

        if (requiredRole && this.currentUser.role !== requiredRole) {
            this.showAlert('Access denied. You do not have permission to view this page.', 'danger');
            setTimeout(() => {
                this.redirectToDashboard(this.currentUser.role);
            }, 2000);
            return false;
        }

        return true;
    }

    // Get current user info
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Load user from storage (fallback)
    loadUserFromStorage() {
        const user = localStorage.getItem('intellgrade_user') || sessionStorage.getItem('intellgrade_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.isAuthenticated = true;
        }
    }
}

// Initialize authentication manager
const authManager = new AuthManager();

// Create global auth object for backward compatibility
const auth = {
    logout: () => authManager.logout(),
    requireAuth: (role) => authManager.requireAuth(role),
    getCurrentUser: () => authManager.getCurrentUser(),
    hasRole: (role) => authManager.hasRole(role),
    isAuthenticated: () => authManager.isAuthenticated
};

// Export for use in other scripts
window.AuthManager = AuthManager;
window.authManager = authManager;
window.auth = auth; 