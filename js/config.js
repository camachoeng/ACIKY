// API Configuration
const API_CONFIG = {
    // Automatically detect environment
    BASE_URL: window.location.hostname === 'camachoeng.github.io' 
        ? 'https://aciky-backend-298cb7d6b0a8.herokuapp.com/api'  // Production
        : 'http://127.0.0.1:3000/api'  // Development
};