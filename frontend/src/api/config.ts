// Configuración base de la API
const API_CONFIG = {
  // En desarrollo usa localhost, en producción usa la URL del dominio
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  APP_KEY: process.env.REACT_APP_SECRET_KEY || 'default-secret-key',
  
  // Endpoints de la API
  ENDPOINTS: {
    LOGIN: '/api/login/',
    PROFILE: '/api/profile/',
    EMPRESAS: '/api/empresas/',
    ADD_EMPRESAS: '/api/empresas/add/',
    DEACTIVATE_EMPRESAS: (id: number) => `/api/empresas/${id}/deactivate/`,
    UPDATE_EMPRESAS: (id: number) => `/api/empresas/${id}/update/`,
    USERS: '/api/users/',
    ADD_USERS: '/api/users/add/',
    DEACTIVATE_USERS: (id: number) => `/api/users/${id}/deactivate/`,
    UPDATE_USERS: (id: number) => `/api/users/${id}/update/`,
    // Aquí puedes agregar más endpoints según sea necesario
  }
};



// Función helper para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Exportar endpoints individuales
export const API_URLS = {
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  PROFILE: getApiUrl(API_CONFIG.ENDPOINTS.PROFILE),
  EMPRESAS: getApiUrl(API_CONFIG.ENDPOINTS.EMPRESAS),
  ADD_EMPRESAS: getApiUrl(API_CONFIG.ENDPOINTS.ADD_EMPRESAS),
  DEACTIVATE_EMPRESAS: (id: number) => getApiUrl(API_CONFIG.ENDPOINTS.DEACTIVATE_EMPRESAS(id)),
  UPDATE_EMPRESAS: (id: number) => getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_EMPRESAS(id)),
  USERS: getApiUrl(API_CONFIG.ENDPOINTS.USERS),
  ADD_USERS: getApiUrl(API_CONFIG.ENDPOINTS.ADD_USERS),
  DEACTIVATE_USERS: (id: number) => getApiUrl(API_CONFIG.ENDPOINTS.DEACTIVATE_USERS(id)),
  UPDATE_USERS: (id: number) => getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_USERS(id)),
};

export const APP_KEY = API_CONFIG.APP_KEY;
export default API_CONFIG