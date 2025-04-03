// Authentication and role management system
const Auth = {
    // Initialize auth system
    init() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.bindEvents();
    },

    // Bind authentication events
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.checkAuth();
            this.setupRoleBasedUI();
        });
    },

    // Check authentication status
    checkAuth() {
        if (!this.currentUser) {
            window.location.href = 'login.html';
        }
    },

    // Setup UI based on user role
    setupRoleBasedUI() {
        const role = this.currentUser?.role;
        const roleElements = document.querySelectorAll('[data-role]');
        
        roleElements.forEach(el => {
            const allowedRoles = el.dataset.role.split(' ');
            if (!allowedRoles.includes(role)) {
                el.style.display = 'none';
            }
        });
    },

    // Login function
    login(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    },

    // Logout function
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    // Get current user
    getUser() {
        return this.currentUser;
    },

    // Check if user has permission
    hasPermission(permission) {
        const rolePermissions = {
            admin: ['manage_drivers', 'manage_fleet', 'manage_agents', 'view_reports'],
            agent: ['create_bookings', 'view_commissions'],
            driver: ['view_schedule', 'update_status']
        };
        
        return rolePermissions[this.currentUser?.role]?.includes(permission) || false;
    }
};

// Initialize auth system on load
Auth.init();