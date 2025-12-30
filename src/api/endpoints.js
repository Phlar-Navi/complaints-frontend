// src/api/endpoints.js
/**
 * Configuration des endpoints API avec recalcul dynamique
 * ✅ Support recalcul après login/logout
 * ✅ Support SUPER_ADMIN
 * ✅ Évite les URLs undefined
 */

import { config } from "./config";

/**
 * Récupère l'utilisateur depuis localStorage
 */
const getUserFromStorage = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    console.error("❌ Erreur parsing user:", error);
    return null;
  }
};

/**
 * Récupère le tenant depuis localStorage
 */
const getTenantFromStorage = () => {
  try {
    const tenantStr = localStorage.getItem("tenant");
    return tenantStr ? JSON.parse(tenantStr) : null;
  } catch (error) {
    console.error("❌ Erreur parsing tenant:", error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur est un SUPER_ADMIN
 */
const isSuperAdmin = () => {
  const user = getUserFromStorage();
  return user?.role === "SUPER_ADMIN";
};

/**
 * Construit le domaine tenant complet
 * Ex: commissariat_huitieme → commissariat-huitieme.complaints.kidjamo.app
 */
const getTenantDomain = () => {
  const tenant = getTenantFromStorage();
  if (!tenant?.schema_name) {
    console.warn("⚠️ Aucun tenant trouvé");
    return null;
  }

  const normalizedSchema = tenant.schema_name.replace(/_/g, "-");
  const domain = `${normalizedSchema}.complaints.kidjamo.app`;
  console.log("✅ Domaine tenant construit:", domain);
  return domain;
};

/**
 * URL publique (sans tenant)
 */
export const getPublicBackendUrl = () => {
  return "https://complaints.kidjamo.app:8000/api";
};

/**
 * URL tenant (avec sous-domaine)
 */
export const getTenantBackendUrl = () => {
  const tenantDomain = getTenantDomain();
  if (!tenantDomain) {
    console.warn("⚠️ Pas de domaine tenant, utilisation URL publique");
    return getPublicBackendUrl();
  }

  return `https://${tenantDomain}:8000/api`;
};

/**
 * Retourne l'URL appropriée selon le rôle
 * SUPER_ADMIN → URL publique
 * Autres → URL tenant
 */
export const getApiUrl = () => {
  if (isSuperAdmin()) {
    console.log("🔑 SUPER_ADMIN → URL publique");
    return getPublicBackendUrl();
  }

  const tenant = getTenantFromStorage();
  if (tenant?.schema_name) {
    console.log("👤 Utilisateur tenant → URL tenant");
    return getTenantBackendUrl();
  }

  console.log("⚠️ Aucun contexte → URL publique");
  return getPublicBackendUrl();
};

// =========================================================================
// Construction des endpoints
// =========================================================================

/**
 * Construit l'objet ENDPOINTS
 * 🔥 IMPORTANT: Appelé dynamiquement, ne pas mettre en cache
 */
const buildEndpoints = () => {
  const apiUrl = getApiUrl();
  const publicUrl = getPublicBackendUrl();

  console.log("🏗️ Construction endpoints avec:", apiUrl);

  return {
    // === ENDPOINTS PUBLICS (toujours domaine principal) ===
    LOGIN: `${publicUrl}/auth/login/`,
    REFRESH: `${publicUrl}/auth/token/refresh/`,
    TENANT_CREATE: `${publicUrl}/tenants/create/`,
    TENANTS: `${publicUrl}/tenants/`,
    TENANTS_GLOBAL_STATS: `${publicUrl}/tenants/global-stats/`,
    TENANT_ACTIVATE: (id) => `${publicUrl}/tenants/${id}/toggle_active/`,

    // === ENDPOINTS DYNAMIQUES (dépendent du contexte) ===
    TENANT_SPECIFIC: (id) => `${apiUrl}/tenants/${id}/`,
    TENANT_USERS: (tenantId) => `${apiUrl}/tenants/${tenantId}/users/`,
    TENANT_STATS: (tenantId) => `${apiUrl}/tenants/${tenantId}/stats/`,
    TENANT_ADD_DOMAIN: (tenantId) => `${apiUrl}/tenants/${tenantId}/add_domain/`,

    // Auth
    LOGOUT: `${apiUrl}/auth/logout/`,
    ME: `${apiUrl}/auth/me/`,
    CHANGE_PASSWORD: `${apiUrl}/auth/change-password/`,

    // Users
    USERS: `${apiUrl}/users/`,
    USER_CREATE: `${apiUrl}/users/create/`,
    USER_DETAIL: (id) => `${apiUrl}/users/${id}/`,
    UPDATE_PROFILE: `${apiUrl}/users/profile/`,
    UPLOAD_AVATAR: `${apiUrl}/users/profile/avatar/`,
    CHANGE_PASSWORD_SELF: `${apiUrl}/users/profile/password/`,
    PREFERENCES: `${apiUrl}/users/preferences/`,
    UPDATE_PREFERENCES: `${apiUrl}/users/preferences/`,

    // Notifications
    NOTIFICATIONS: `${apiUrl}/notifications/`,
    NOTIFICATION_UNREAD: `${apiUrl}/notifications/unread/`,
    NOTIFICATIONS_COUNT_UNREAD: `${apiUrl}/notifications/count_unread/`,
    NOTIFICATIONS_MARK_READ: (id) => `${apiUrl}/notifications/${id}/mark_read/`,
    NOTIFICATIONS_MARK_ALL_READ: `${apiUrl}/notifications/mark_all_read/`,
    NOTIFICATIONS_DELETE: (id) => `${apiUrl}/notifications/${id}/`,
    NOTIFICATIONS_DELETE_READ: `${apiUrl}/notifications/delete_read/`,
    NOTIFICATIONS_STATS: `${apiUrl}/notifications/stats/`,

    // Complaints
    COMPLAINTS: `${apiUrl}/complaints/`,
    COMPLAINT_DETAIL: (id) => `${apiUrl}/complaints/${id}/`,
    COMPLAINT_ASSIGN: (id) => `${apiUrl}/complaints/${id}/assign/`,
    COMPLAINT_COMMENT: (id) => `${apiUrl}/complaints/${id}/add_comment/`,
    COMPLAINT_ATTACHMENT: (id) => `${apiUrl}/complaints/${id}/add_attachment/`,
    COMPLAINT_HISTORY: (id) => `${apiUrl}/complaints/${id}/history/`,

    // Dashboard
    DASHBOARD: `${apiUrl}/dashboard/`,

    // SLA Configs
    SLA_CONFIGS: `${apiUrl}/sla-configs/`,
    SLA_CONFIG_DETAIL: (id) => `${apiUrl}/sla-configs/${id}/`,

    // History
    HISTORY: `${apiUrl}/history/`,
    HISTORY_DETAIL: (id) => `${apiUrl}/history/${id}/`,

    // Categories
    CATEGORIES: `${apiUrl}/categories/`,
    CATEGORY_DETAIL: (id) => `${apiUrl}/categories/${id}/`,
    CATEGORY_STATS: (id) => `${apiUrl}/categories/${id}/stats/`,
    SUBCATEGORIES: `${apiUrl}/subcategories/`,
    SUBCATEGORY_DETAIL: (id) => `${apiUrl}/subcategories/${id}/`,
  };
};

// 🔥 IMPORTANT: Utiliser un getter pour recalculer à chaque accès
let cachedEndpoints = buildEndpoints();

/**
 * Proxy pour recalculer les endpoints à chaque accès
 * Garantit que les URLs sont toujours à jour
 */
export const ENDPOINTS = new Proxy(
  {},
  {
    get(target, prop) {
      // Reconstruire à chaque accès pour avoir les URLs à jour
      const endpoints = buildEndpoints();
      return endpoints[prop];
    },
  }
);

/**
 * Force le recalcul des endpoints
 * À appeler après login/logout
 */
export const refreshEndpoints = () => {
  console.log("🔄 Refresh endpoints");
  cachedEndpoints = buildEndpoints();

  // Log pour debug
  const user = getUserFromStorage();
  const tenant = getTenantFromStorage();
  console.log("  User:", user?.email, "Role:", user?.role);
  console.log("  Tenant:", tenant?.name, "Schema:", tenant?.schema_name);
  console.log("  DASHBOARD:", cachedEndpoints.DASHBOARD);
  console.log("  ME:", cachedEndpoints.ME);

  return cachedEndpoints;
};

// Log initial
if (config.IS_DEVELOPMENT) {
  const user = getUserFromStorage();
  const tenant = getTenantFromStorage();

  console.log("🔧 API Endpoints - Configuration Initiale:");
  console.log("  User:", user?.email || "(non connecté)");
  console.log("  Role:", user?.role || "(aucun)");
  console.log("  Tenant:", tenant?.name || "(aucun)");
  console.log("  API URL:", getApiUrl());
  console.log("  ---");
  console.log("  LOGIN:", cachedEndpoints.LOGIN);
  console.log("  DASHBOARD:", cachedEndpoints.DASHBOARD);
  console.log("  ME:", cachedEndpoints.ME);
}

// Exports
export const PUBLIC_API_URL = getPublicBackendUrl();
export { getTenantBackendUrl as TENANT_API_URL };
export default getApiUrl;
