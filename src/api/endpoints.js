// src/api/endpoints.js
/**
 * Configuration des endpoints API
 * ✅ Utilise le tenant depuis localStorage pour construire les URLs dynamiquement
 * ✅ Plus de dépendance à window.location.hostname (qui retourne localhost)
 */

import { config } from "./config";
import { normalizeHostname } from "../utils/hostname";

/**
 * Récupère le tenant depuis localStorage
 * @returns {Object|null} Objet tenant ou null
 */
const getTenantFromStorage = () => {
  try {
    const tenantStr = localStorage.getItem("tenant");
    console.log("✅ Tenant récupéré depuis localStorage:", tenantStr);
    return tenantStr ? JSON.parse(tenantStr) : null;
  } catch (error) {
    console.error("❌ Erreur parsing tenant depuis localStorage:", error);
    return null;
  }
};

/**
 * Construit le domaine tenant complet
 * Ex: commissariat_onzieme → commissariat-onzieme.kidjamo.app
 */
const getTenantDomain = () => {
  const tenant = getTenantFromStorage();
  if (!tenant?.schema_name) return null;

  const normalizedSchema = tenant.schema_name.replace(/_/g, "-");
  return `${normalizedSchema}.kidjamo.app`;
};

const getTenantDomain_old = () => {
  const tenant = getTenantFromStorage();

  if (!tenant || !tenant.schema_name) {
    console.warn("⚠️ Aucun tenant trouvé dans localStorage");
    return null;
  }

  // Normaliser le schema_name (underscore → tiret)
  const normalizedSchema = tenant.schema_name.replace(/_/g, "-");

  // Construire le domaine complet
  const baseDomain = "kidjamo.app:";
  console.log("✅ Base domain depuis config:", baseDomain);
  const tenantDomain = `${normalizedSchema}.${baseDomain}`;
  console.log("✅ Domaine tenant construit:", tenantDomain);

  return tenantDomain;
};

/**
 * Retourne l'URL complète du backend PUBLIC (pour login, création tenant, etc.)
 * Utilise TOUJOURS le domaine de base depuis .env
 */
export const getPublicBackendUrl = () => {
  return `${config.BACKEND_BASE_URL}/api`;
};

/**
 * Retourne l'URL complète du backend TENANT (pour toutes les requêtes tenant)
 * Construit dynamiquement basé sur le tenant dans localStorage
 */
export const getTenantBackendUrl = () => {
  const tenantDomain = getTenantDomain();
  if (!tenantDomain) return getPublicBackendUrl();

  return `http://${tenantDomain}:8000/api`;
};

export const getTenantBackendUrl_old = () => {
  const tenantDomain = getTenantDomain();

  if (!tenantDomain) {
    // Fallback : utiliser le domaine public
    console.warn("⚠️ Impossible de construire URL tenant, utilisation du domaine public");
    return getPublicBackendUrl();
  }

  const protocol = config.PROTOCOL;
  const port = 8000;

  return `${protocol}//${tenantDomain}${port}/api`;
};

/**
 * Retourne l'URL du backend en fonction du contexte
 * (Public ou Tenant selon ce qui est stocké)
 */
export const getBackendUrl = () => {
  const tenant = getTenantFromStorage();

  // Si on a un tenant, utiliser son URL
  if (tenant && tenant.schema_name) {
    return getTenantBackendUrl();
  }

  // Sinon, utiliser le domaine public
  return getPublicBackendUrl();
};

// =========================================================================
// URLs de base - Calculées dynamiquement
// =========================================================================

const PUBLIC_API_URL = getPublicBackendUrl();

// ⚠️ ATTENTION : TENANT_API_URL est calculé au chargement du module
// Il faut le recalculer après le login pour avoir le bon tenant
// Utilisez getTenantBackendUrl() dans vos composants si nécessaire

const TENANT_API_URL = getTenantBackendUrl();

// =========================================================================
// Fonction helper pour reconstruire les endpoints après login
// =========================================================================

/**
 * Reconstruit tous les endpoints après changement de tenant
 * À appeler après un login réussi
 */
export const refreshEndpoints = () => {
  const newTenantUrl = getTenantBackendUrl();

  console.log("🔄 Refresh des endpoints avec nouveau tenant");
  console.log("  Nouvelle URL tenant:", newTenantUrl);

  // Retourner les nouveaux endpoints
  return buildEndpoints(newTenantUrl);
};

/**
 * Construit l'objet ENDPOINTS avec une URL tenant spécifique
 */
const buildEndpoints = (tenantApiUrl = TENANT_API_URL) => ({
  // === ENDPOINTS PUBLICS (domaine principal) ===
  LOGIN: `http://16.16.202.86:8000/api/auth/login/`,
  REFRESH: `http://16.16.202.86:8000/api/auth/token/refresh/`,
  TENANT_CREATE: `http://16.16.202.86:8000/api/tenants/create/`,
  TENANTS: `http://16.16.202.86:8000/api/tenants/`,

  // === ENDPOINTS TENANT-SPÉCIFIQUES ===
  // Utilisent l'URL tenant dynamique
  TENANT_SPECIFIC: (id) => `${tenantApiUrl}/tenants/${id}/`,
  TENANT_ACTIVATE: (id) => `http://16.16.202.86:8000/api/tenants/${id}/toggle_active/`,
  TENANT_USERS: (tenantId) => `${tenantApiUrl}/tenants/${tenantId}/users/`,
  TENANT_STATS: (tenantId) => `${tenantApiUrl}/tenants/${tenantId}/stats/`,
  TENANT_ADD_DOMAIN: (tenantId) => `${tenantApiUrl}/tenants/${tenantId}/add_domain/`,
  TENANTS_GLOBAL_STATS: `http://16.16.202.86:8000/api/tenants/global-stats/`,

  // Auth
  LOGOUT: `${tenantApiUrl}/auth/logout/`,
  ME: `${tenantApiUrl}/auth/me/`,
  CHANGE_PASSWORD: `${tenantApiUrl}/auth/change-password/`,

  // Users
  USERS: `${tenantApiUrl}/users/`,
  USER_CREATE: `${tenantApiUrl}/users/create/`,
  USER_DETAIL: (id) => `${tenantApiUrl}/users/${id}/`,
  UPDATE_PROFILE: `${tenantApiUrl}/users/profile/`,
  UPLOAD_AVATAR: `${tenantApiUrl}/users/profile/avatar/`,
  CHANGE_PASSWORD_SELF: `${tenantApiUrl}/users/profile/password/`,
  PREFERENCES: `${tenantApiUrl}/users/preferences/`,
  UPDATE_PREFERENCES: `${tenantApiUrl}/users/preferences/`,

  // Notifications
  NOTIFICATIONS: `${tenantApiUrl}/notifications/`,
  NOTIFICATION_UNREAD: `${tenantApiUrl}/notifications/unread/`,
  NOTIFICATIONS_COUNT_UNREAD: `${tenantApiUrl}/notifications/count_unread/`,
  NOTIFICATIONS_MARK_READ: (id) => `${tenantApiUrl}/notifications/${id}/mark_read/`,
  NOTIFICATIONS_MARK_ALL_READ: `${tenantApiUrl}/notifications/mark_all_read/`,
  NOTIFICATIONS_DELETE: (id) => `${tenantApiUrl}/notifications/${id}/`,
  NOTIFICATIONS_DELETE_READ: `${tenantApiUrl}/notifications/delete_read/`,
  NOTIFICATIONS_STATS: `${tenantApiUrl}/notifications/stats/`,

  // Complaints
  COMPLAINTS: `${tenantApiUrl}/complaints/`,
  COMPLAINT_DETAIL: (id) => `${tenantApiUrl}/complaints/${id}/`,
  COMPLAINT_ASSIGN: (id) => `${tenantApiUrl}/complaints/${id}/assign/`,
  COMPLAINT_COMMENT: (id) => `${tenantApiUrl}/complaints/${id}/add_comment/`,
  COMPLAINT_ATTACHMENT: (id) => `${tenantApiUrl}/complaints/${id}/add_attachment/`,
  COMPLAINT_HISTORY: (id) => `${tenantApiUrl}/complaints/${id}/history/`,

  // Dashboard
  TENANT_DASHBOARD: `http://16.16.202.86:8000/api/dashboard/`,
  DASHBOARD: `${tenantApiUrl}/dashboard/`,

  // SLA Configs
  SLA_CONFIGS: `${tenantApiUrl}/sla-configs/`,
  SLA_CONFIG_DETAIL: (id) => `${tenantApiUrl}/sla-configs/${id}/`,

  // History
  HISTORY: `${tenantApiUrl}/history/`,
  HISTORY_DETAIL: (id) => `${tenantApiUrl}/history/${id}/`,

  // Categories
  CATEGORIES: `${tenantApiUrl}/categories/`,
  CATEGORY_DETAIL: (id) => `${tenantApiUrl}/categories/${id}/`,
  CATEGORY_STATS: (id) => `${tenantApiUrl}/categories/${id}/stats/`,
  SUBCATEGORIES: `${tenantApiUrl}/subcategories/`,
  SUBCATEGORY_DETAIL: (id) => `${tenantApiUrl}/subcategories/${id}/`,
});

// Construire les endpoints initiaux
export const ENDPOINTS = buildEndpoints();

// Log pour debug (seulement en dev)
if (config.IS_DEVELOPMENT) {
  const tenant = getTenantFromStorage();
  console.log("🔧 API Endpoints Configuration:");
  console.log("  Base Domain:", config.BASE_DOMAIN);
  console.log("  Backend Base URL:", config.BACKEND_BASE_URL);
  console.log("  Tenant actuel:", tenant?.name || "(aucun)");
  console.log("  Tenant schema:", tenant?.schema_name || "(aucun)");
  console.log("  Tenant domain:", getTenantDomain() || "(aucun)");
  console.log("  PUBLIC_API_URL:", PUBLIC_API_URL);
  console.log("  TENANT_API_URL:", getTenantBackendUrl());
  console.log("  ---");
  console.log("  Exemple LOGIN:", ENDPOINTS.LOGIN);
  console.log("  Exemple DASHBOARD:", ENDPOINTS.DASHBOARD);
  console.log("  Exemple ME:", ENDPOINTS.ME);
}

// Export des URLs pour usage direct
export { PUBLIC_API_URL, TENANT_API_URL };

export default TENANT_API_URL;
