// Configuración base de la API
const API_CONFIG = {
  // En desarrollo usa localhost, en producción usa la URL del dominio
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  APP_KEY: process.env.REACT_APP_SECRET_KEY || 'default-secret-key',
  
  // Endpoints de la API
  ENDPOINTS: {
    LOGIN: '/api/login/',
    PROFILE: '/api/profile/',
    // Aquí puedes agregar más endpoints según sea necesario
  }
};

// console.log('Variables de entorno:', {
//   REACT_APP_API_URL: process.env.REACT_APP_API_URL,
//   REACT_APP_SECRET_KEY: process.env.REACT_APP_SECRET_KEY,
//   APP_KEY: API_CONFIG.APP_KEY
// });


// Función helper para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Exportar endpoints individuales
export const API_URLS = {
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  PROFILE: getApiUrl(API_CONFIG.ENDPOINTS.PROFILE),
};

export const APP_KEY = API_CONFIG.APP_KEY;
export default API_CONFIG