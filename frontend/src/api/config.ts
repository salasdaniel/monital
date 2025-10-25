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
    DEACTIVATE_USERS: (id: string) => `/api/users/${id}/deactivate/`,
    UPDATE_USERS: (id: string) => `/api/users/${id}/update/`,
    VENTAS: '/api/ventas/',
    VENTAS_DETALLE: '/api/ventas/detalle/',
    MATRICULAS: '/api/matriculas/',
    ADD_MATRICULAS: '/api/matriculas/add/',
    UPDATE_MATRICULAS: (id: number) => `/api/matriculas/update/${id}/`,
    IMPORT_MATRICULAS: '/api/matriculas/import/',
    DASHBOARD: '/api/dashboard/',
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
  DEACTIVATE_USERS: (id: string) => getApiUrl(API_CONFIG.ENDPOINTS.DEACTIVATE_USERS(id)),
  UPDATE_USERS: (id: string) => getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_USERS(id)),
  VENTAS: getApiUrl(API_CONFIG.ENDPOINTS.VENTAS),
  VENTAS_DETALLE: getApiUrl(API_CONFIG.ENDPOINTS.VENTAS_DETALLE),
  MATRICULAS: getApiUrl(API_CONFIG.ENDPOINTS.MATRICULAS),
  ADD_MATRICULAS: getApiUrl(API_CONFIG.ENDPOINTS.ADD_MATRICULAS),
  UPDATE_MATRICULAS: (id: number) => getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_MATRICULAS(id)),
  IMPORT_MATRICULAS: getApiUrl(API_CONFIG.ENDPOINTS.IMPORT_MATRICULAS),
  DASHBOARD: getApiUrl(API_CONFIG.ENDPOINTS.DASHBOARD),
};

export const APP_KEY = API_CONFIG.APP_KEY;
export default API_CONFIG