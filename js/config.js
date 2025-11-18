// API Configuration
const API_CONFIG = {
    // Automatically detect environment
    BASE_URL: window.location.hostname === 'camachoeng.github.io' 
        ? 'https://aciky-backend.herokuapp.com/api'  // Production
        : 'http://127.0.0.1:3000/api'  // Development
};