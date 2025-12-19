// src/api/endpoints.js

import { config } from "./config";
import { normalizeHostname, getNormalizedHostname } from "../utils/hostname";

/**
 * Retourne l'URL complète du backend pour un domaine donné
 * NORMALISE automatiquement les underscores en tirets
 *
 * @param {string} hostname - Le hostname (avec ou sans sous-domaine)
 * @returns {string} URL complète du backend
 */
export const getBackendUrl = (hostname) => {
  const protocol = window.location.protocol; // http: ou https:
  const backendPort = config.IS_DEVELOPMENT ? ":8000" : ""; // Port 8000 en dev

  // 🔧 CORRECTION: Normaliser le hostname (remplacer _ par -)
  const normalizedHostname = normalizeHostname(hostname);

  return `${protocol}//${normalizedHostname}${backendPort}/api`;
};

/**
 * Retourne le domaine racine public (sans sous-domaine tenant)
 */
const getPublicBackendUrl = () => {
  const hostname = window.location.hostname;

  // Si le hostname contient un point (sous-domaine)
  if (hostname.includes(".")) {
    const parts = hostname.split(".");

    // Pour localhost avec sous-domaine: tenant.localhost → localhost
    if (parts[parts.length - 1] === "localhost") {
      return getBackendUrl("localhost");
    }

    // Pour domaines normaux: tenant.example.com → example.com
    const baseDomain = parts.slice(-2).join(".");
    return getBackendUrl(baseDomain);
  }

  // Pas de sous-domaine, on est déjà sur le domaine public
  return getBackendUrl(hostname);
};

/**
 * Retourne l'URL du backend pour le tenant actuel
 * 🔧 UTILISE le hostname normalisé
 */
const getTenantBackendUrl = () => {
  // Utiliser le hostname normalisé au lieu du hostname brut
  const normalizedHostname = getNormalizedHostname();
  return getBackendUrl(normalizedHostname);
};

// URLs de base
const PUBLIC_API_URL = getPublicBackendUrl();
const TENANT_API_URL = getTenantBackendUrl();

// Log pour debug (à retirer en production)
if (config.IS_DEVELOPMENT) {
  console.log("🔧 API Configuration:");
  console.log("  Frontend URL:", window.location.origin);
  console.log("  Hostname (brut):", window.location.hostname);
  console.log("  Hostname (normalisé):", getNormalizedHostname());
  console.log("  Public API URL:", PUBLIC_API_URL);
  console.log("  Tenant API URL:", TENANT_API_URL);
}

export const ENDPOINTS = {
  // === ENDPOINTS PUBLICS (pas de tenant requis) ===
  LOGIN: `${PUBLIC_API_URL}/auth/login/`,
  SMART_LOGIN: `${PUBLIC_API_URL}/auth/smart-login/`,
  REFRESH: `${PUBLIC_API_URL}/auth/token/refresh/`,
  TENANT_CREATE: `${PUBLIC_API_URL}/tenants/create/`,

  // === ENDPOINTS TENANT-SPÉCIFIQUES ===
  LOGOUT: `${TENANT_API_URL}/auth/logout/`,
  ME: `${TENANT_API_URL}/auth/me/`,
  CHANGE_PASSWORD: `${TENANT_API_URL}/auth/change-password/`,

  // Users
  USERS: `${TENANT_API_URL}/users/`,
  USER_CREATE: `${TENANT_API_URL}/users/create/`,
  USER_DETAIL: (id) => `${TENANT_API_URL}/users/${id}/`,

  // Complaints
  COMPLAINTS: `${TENANT_API_URL}/complaints/`,
  COMPLAINT_DETAIL: (id) => `${TENANT_API_URL}/complaints/${id}/`,
  COMPLAINT_ASSIGN: (id) => `${TENANT_API_URL}/complaints/${id}/assign/`,
  COMPLAINT_COMMENT: (id) => `${TENANT_API_URL}/complaints/${id}/add_comment/`,
  COMPLAINT_ATTACHMENT: (id) => `${TENANT_API_URL}/complaints/${id}/add_attachment/`,
  COMPLAINT_HISTORY: (id) => `${TENANT_API_URL}/complaints/${id}/history/`,

  // Dashboard
  DASHBOARD: `${TENANT_API_URL}/dashboard/`,

  // SLA Configs
  SLA_CONFIGS: `${TENANT_API_URL}/sla-configs/`,
  SLA_CONFIG_DETAIL: (id) => `${TENANT_API_URL}/sla-configs/${id}/`,

  // History
  HISTORY: `${TENANT_API_URL}/history/`,
  HISTORY_DETAIL: (id) => `${TENANT_API_URL}/history/${id}/`,
};

// Export des URLs pour usage direct
export { PUBLIC_API_URL, TENANT_API_URL };

export default TENANT_API_URL;
