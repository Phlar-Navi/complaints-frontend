//const API_URL = "https://localhost:8000/api";
//const API_URL = `${window.location.origin}/api`;
const API_URL = `http://hopital-central.localhost:8000/api`;

export const ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login/`,
  LOGOUT: `${API_URL}/auth/logout/`,
  ME: `${API_URL}/auth/me/`,
  CHANGE_PASSWORD: `${API_URL}/auth/change-password/`,
  REFRESH: `${API_URL}/auth/token/refresh/`,

  // Users
  USERS: `${API_URL}/users/`,
  USER_CREATE: `${API_URL}/users/create/`,
  USER_DETAIL: (id) => `${API_URL}/users/${id}/`,

  // Tenants
  TENANT_CREATE: `${API_URL}/tenants/create/`,
};

export default API_URL;
