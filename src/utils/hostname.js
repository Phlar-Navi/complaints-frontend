// src/utils/hostname.js

/**
 * Normalise un hostname en remplaçant les underscores par des tirets
 *
 * @param {string} hostname - Le hostname à normaliser
 * @returns {string} Hostname normalisé avec tirets
 *
 * @example
 * normalizeHostname('hopital_central.localhost') → 'hopital-central.localhost'
 * normalizeHostname('tenant_name') → 'tenant-name'
 */
export const normalizeHostname = (hostname) => {
  if (!hostname) return "";
  return hostname.replace(/_/g, "-");
};

/**
 * Obtient le hostname actuel normalisé (avec tirets au lieu d'underscores)
 *
 * @returns {string} Hostname actuel normalisé
 *
 * @example
 * // Si window.location.hostname = 'hopital_central.localhost'
 * getNormalizedHostname() → 'hopital-central.localhost'
 */
export const getNormalizedHostname = () => {
  return normalizeHostname(window.location.hostname);
};

/**
 * Obtient l'URL de base du backend avec hostname normalisé
 *
 * @param {number} [backendPort=8000] - Port du backend (optionnel, par défaut 8000)
 * @returns {string} URL de base du backend
 *
 * @example
 * // Si sur http://hopital_central.localhost:3000
 * getBackendBaseUrl() → 'http://hopital-central.localhost:8000'
 */
export const getBackendBaseUrl = (backendPort = 8000) => {
  const protocol = window.location.protocol;
  const normalizedHost = getNormalizedHostname();
  return `${protocol}//${normalizedHost}:${backendPort}`;
};

/**
 * Construit une URL complète vers l'API avec hostname normalisé
 *
 * @param {string} path - Chemin de l'API (doit commencer par /)
 * @param {number} [backendPort=8000] - Port du backend
 * @returns {string} URL complète
 *
 * @example
 * buildApiUrl('/api/dashboard/') → 'http://hopital-central.localhost:8000/api/dashboard/'
 */
export const buildApiUrl = (path, backendPort = 8000) => {
  const baseUrl = getBackendBaseUrl(backendPort);
  // S'assurer que path commence par /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
