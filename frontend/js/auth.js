// ============================================
// AUTHENTICATION MODULE - Login & Registration
// ============================================

// User Database (Simulated - In real app, this would be in backend)
const usersDatabase = {
    'user@demo.com': {
        id: 1,
        email: 'user@demo.com',
        password: 'demo123',
        name: 'Demo User',
        phone: '+1 234 567 8900',
        address: '123 Main St, City, Country',
        createdAt: '2024-01-15',
        isAdmin: false,
        orders: []
    },
    'admin@shop.com': {
        id: 2,
        email: 'admin@shop.com',
        password: 'admin123',
        name: 'Administrator',
        phone: '+1 987 654 3210',
        address: '456 Admin Ave, City, Country',
        createdAt: '2024-01-01',
        isAdmin: true,
        orders: []
    }
};

// Current user session
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Authentication module loaded');
    
    // Check if we're on login page
    if (document.getElementById('loginForm')) {
        initLoginForm();
    }
    
    // Check if we're on register page
    if (document.getElementById('registerForm')) {
        initRegisterForm();
    }
    
    // Update UI based on login status
    updateAuthUI();
});

// ============================================
// LOGIN FUNCTIONALITY
// ============================================
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordBtn = document.getElementById('forgotPassword');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', handleForgotPassword);
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('passwordError', 'Password must be at least 6 characters');
        return;
    }
    
    // Show loading
    showLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            // Check credentials
            const user = authenticateUser(email, password);
            
            if (user) {
                // Login successful
                loginUser(user, rememberMe);
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect after delay
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            } else {
                // Login failed
                showError('passwordError', 'Invalid email or password');
                showNotification('Login failed. Please check your credentials.', 'warning');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('An error occurred during login', 'error');
        } finally {
            // Always hide loading - even if there's an error
            showLoading(false);
        }
    }, 1000);
}

function authenticateUser(email, password) {
    const user = usersDatabase[email];
    
    if (user && user.password === password) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            phone: user.phone,
            address: user.address
        };
    }
    
    return null;
}

// ============================================
// REGISTRATION FUNCTIONALITY
// ============================================
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        // Real-time validation
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (passwordInput && confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                validatePasswordMatch();
            });
        }
    }
}

function handleRegistration(event) {
    event.preventDefault(); // Make sure this is the first line
    event.stopPropagation();
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    let isValid = true;
    
    if (!name || name.length < 2) {
        showError('nameError', 'Please enter your full name');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (usersDatabase[email]) {
        showError('emailError', 'Email already registered');
        isValid = false;
    }
    
    if (!validatePhone(phone)) {
        showError('phoneError', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (!validatePassword(password)) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    if (!terms) {
        showError('termsError', 'You must accept the terms and conditions');
        isValid = false;
    }
    
    if (!isValid) {
        showNotification('Please fix the errors in the form', 'warning');
        return;
    }
    
    // Simulate API call
    showLoading(true);
    
    setTimeout(() => {
        try {
            // Create new user
            const newUser = createUser(name, email, phone, password);
            
            // Add to database
            usersDatabase[email] = newUser;
            console.log('New user registered:', newUser);
            
            // Show success message
            showNotification('Registration successful! Redirecting to login...', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/login?registered=true';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            showNotification('An error occurred during registration', 'error');
        } finally {
            showLoading(false);
        }
    }, 1500);
}

function createUser(name, email, phone, password) {
    const userId = Object.keys(usersDatabase).length + 1;
    
    return {
        id: userId,
        email: email,
        password: password,
        name: name,
        phone: phone,
        address: '',
        createdAt: new Date().toISOString().split('T')[0],
        isAdmin: false,
        orders: []
    };
}

function validatePasswordMatch() {
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (!password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
        if (errorElement) {
            errorElement.textContent = 'Passwords do not match';
            errorElement.style.display = 'flex';
        }
    } else {
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// ============================================
// USER SESSION MANAGEMENT
// ============================================
function loginUser(user, rememberMe = false) {
    currentUser = user;
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Store session expiration
    if (rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days
        localStorage.setItem('sessionExpiry', expiryDate.toISOString());
    } else {
        // Session expires when browser closes
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
    
    // Update UI
    updateAuthUI();
    
    // Dispatch login event
    window.dispatchEvent(new Event('userLogin'));
}

function logoutUser() {
    // Clear user data
    currentUser = null;
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
    
    // Update UI
    updateAuthUI();
    
    // Redirect to homepage
    window.location.href = '../index.html';
    
    // Dispatch logout event
    window.dispatchEvent(new Event('userLogout'));
}

function isLoggedIn() {
    // Check session expiry
    const expiry = localStorage.getItem('sessionExpiry');
    if (expiry && new Date(expiry) < new Date()) {
        logoutUser();
        return false;
    }
    
    return currentUser !== null;
}

function isAdmin() {
    return currentUser && currentUser.isAdmin === true;
}

function getUserInfo() {
    return currentUser;
}

// ============================================
// UI UPDATES
// ============================================
function updateAuthUI() {
    // Update navbar based on login status
    updateNavbarAuth();
    
    // Update account pages if user is logged in
    if (isLoggedIn() && window.location.pathname.includes('login.html')) {
        // If already logged in and on login page, redirect
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}

function updateNavbarAuth() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Find account link
    const accountLink = Array.from(navLinks.children).find(link => 
        link.querySelector('a[href*="login"], a[href*="dashboard"]')
    );
    
    if (accountLink) {
        if (isLoggedIn()) {
            const user = getUserInfo();
            accountLink.innerHTML = `
                <a href="pages/dashboard.html" class="nav-link">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.name.split(' ')[0]}</span>
                </a>
            `;
            
            // Add logout link if not already present
            if (!document.querySelector('.logout-link')) {
                const logoutLink = document.createElement('div');
                logoutLink.className = 'logout-link';
                logoutLink.innerHTML = `
                    <a href="#" class="nav-link" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                `;
                navLinks.appendChild(logoutLink);
                
                document.getElementById('logoutBtn').addEventListener('click', function(e) {
                    e.preventDefault();
                    logoutUser();
                });
            }
        } else {
            accountLink.innerHTML = `
                <a href="pages/login.html" class="nav-link">
                    <i class="fas fa-user"></i>
                    <span>Account</span>
                </a>
            `;
            
            // Remove logout link if present
            const logoutLink = document.querySelector('.logout-link');
            if (logoutLink) {
                logoutLink.remove();
            }
        }
    }
}

// ============================================
// PASSWORD RESET
// ============================================
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = prompt('Enter your email address to reset password:');
    
    if (email && validateEmail(email)) {
        if (usersDatabase[email]) {
            // In a real app, this would send an email
            showNotification(`Password reset instructions sent to ${email}`, 'info');
        } else {
            showNotification('Email not found in our system', 'warning');
        }
    } else {
        showNotification('Please enter a valid email address', 'warning');
    }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validatePhone(phone) {
    // Simple phone validation - at least 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        element.style.display = 'flex';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

function showLoading(show) {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    
    submitButtons.forEach(button => {
        if (show) {
            // Store original HTML before changing
            button.dataset.originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            button.disabled = true;
        } else {
            // Restore original HTML if stored
            if (button.dataset.originalHTML) {
                button.innerHTML = button.dataset.originalHTML;
            } else {
                // Fallback based on form
                if (button.closest('#loginForm')) {
                    button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                } else if (button.closest('#registerForm')) {
                    button.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
                }
            }
            button.disabled = false;
        }
    });
}

// SIMPLE NOTIFICATION SYSTEM
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.simple-notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'simple-notification';
    
    // Set colors based on type
    const colors = {
        'success': '#4CAF50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196F3'
    };
    
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 300px;
    `;
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for animations
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ============================================
// EXPORT FUNCTIONS (for use in other files)
// ============================================
window.authModule = {
    loginUser,
    logoutUser,
    isLoggedIn,
    isAdmin,
    getUserInfo,
    updateAuthUI
};

// Initialize on load
console.log('✅ Authentication module ready');