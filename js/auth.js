// Authentication JavaScript for ACIKY Yoga Website
// Connects to the backend API at http://127.0.0.1:3000

const API_URL = window.location.hostname === 'camachoeng.github.io'
    ? 'https://aciky-backend-298cb7d6b0a8.herokuapp.com/api/auth'
    : 'http://127.0.0.1:3000/api/auth';

// Helper function to show error messages
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    if (successDiv) {
        successDiv.style.display = 'none';
    }
}

// Helper function to show success messages
function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

// Helper function to hide all messages
function hideMessages() {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', async function() {

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();
        
        // Get form elements with null checks
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitBtn = document.getElementById('submitBtn');
        
        // Verify all elements exist
        if (!emailInput || !passwordInput) {
            showError('Error: Formulario no válido. Por favor recarga la página.');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate email field
        if (!email) {
            showError('Por favor ingresa tu correo electrónico');
            document.getElementById('email').focus();
            return;
        }
        
        // Validate password field
        if (!password) {
            showError('Por favor ingresa tu contraseña');
            document.getElementById('password').focus();
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Por favor ingresa un correo electrónico válido');
            document.getElementById('email').focus();
            return;
        }
        
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';
        
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for sessions
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('¡Inicio de sesión exitoso! Redirigiendo a tu panel...');
                
                // Store user info in localStorage (fallback for Safari mobile)
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('authToken', 'session-' + Date.now()); // Simple token for auth check
                localStorage.setItem('loginTime', Date.now().toString());
                
                // Redirect to dashboard after 1.5 seconds to ensure session cookie is set
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showError(data.message || 'Correo o contraseña incorrectos');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Sesión';
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Error de conexión. Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        }
    });
}

// Handle Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessages();
        
        // Get form elements with null checks
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const submitBtn = document.getElementById('submitBtn');
        
        // Verify all elements exist
        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) {            showError('Error: Formulario no válido. Por favor recarga la página.');
            return;
        }
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate all fields are filled
        if (!username) {
            showError('Por favor ingresa tu nombre de usuario');
            document.getElementById('username').focus();
            return;
        }
        
        if (!email) {
            showError('Por favor ingresa tu correo electrónico');
            document.getElementById('email').focus();
            return;
        }
        
        if (!password) {
            showError('Por favor ingresa una contraseña');
            document.getElementById('password').focus();
            return;
        }
        
        if (!confirmPassword) {
            showError('Por favor confirma tu contraseña');
            document.getElementById('confirmPassword').focus();
            return;
        }
        
        // Validate username length
        if (username.length < 3) {
            showError('El nombre de usuario debe tener al menos 3 caracteres');
            document.getElementById('username').focus();
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Por favor ingresa un correo electrónico válido');
            document.getElementById('email').focus();
            return;
        }
        
        // Validate password length
        if (password.length < 6) {
            showError('La contraseña debe tener al menos 6 caracteres');
            document.getElementById('password').focus();
            return;
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
            showError('Las contraseñas no coinciden');
            document.getElementById('confirmPassword').focus();
            return;
        }
        
        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
        
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showSuccess('¡Registro exitoso! Redirigiendo al inicio de sesión...');
                
                // Clear form
                registerForm.reset();
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showError(data.message || 'Error al registrarse');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrarse';
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('Error de conexión. Asegúrate de que el servidor esté ejecutándose.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrarse';
        }
    });
}

// Check if user is logged in (for other pages)
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/check`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.isAuthenticated) {
            // Store user info
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } else {
            localStorage.removeItem('user');
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        return null;
    }
}

// Logout function - works from any page
async function logout() {
    try {
        await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        localStorage.removeItem('user');
        
        // Determine correct path to login.html based on current location
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = 'login.html'; // Already in pages directory
        } else {
            window.location.href = 'pages/login.html'; // In root
        }
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.removeItem('user');
        // Still redirect even if backend fails
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            window.location.href = 'login.html';
        } else {
            window.location.href = 'pages/login.html';
        }
    }
}

// Check authentication status and display user info
const user = await checkAuth();

// You can add user menu to the header here if authenticated

}); // End DOMContentLoaded
