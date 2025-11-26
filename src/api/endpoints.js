// endpoints.js

/**
 * Retourne le port du backend selon l'environnement
 * En dev: frontend sur :3000, backend sur :8000
 * En prod: même port pour tout
 */
const getBackendPort = () => {
  // En développement, forcer le port 8000 pour le backend
  if (process.env.NODE_ENV === "development" || window.location.port === "3000") {
    return ":8000";
  }
  // En production, utiliser le port actuel
  return window.location.port ? `:${window.location.port}` : "";
};

/**
 * Retourne le domaine racine public (sans sous-domaine tenant)
 * Exemples:
 * - hopital-central.localhost:3000 → localhost:8000 (dev)
 * - tenant1.example.com → example.com (prod)
 * - localhost:3000 → localhost:8000 (dev)
 */
const getPublicDomain = () => {
  const hostname = window.location.hostname;
  const port = getBackendPort();
  const protocol = window.location.protocol;

  // Si le hostname contient un point (sous-domaine)
  if (hostname.includes(".")) {
    const parts = hostname.split(".");

    // Pour localhost avec sous-domaine: tenant.localhost → localhost
    if (parts[parts.length - 1] === "localhost" || parts.length === 2) {
      return `${protocol}//${parts[parts.length - 1]}${port}`;
    }

    // Pour domaines normaux: tenant.example.com → example.com
    const baseDomain = parts.slice(-2).join(".");
    return `${protocol}//${baseDomain}${port}`;
  }

  // Pas de sous-domaine, on est déjà sur le domaine public
  return `${protocol}//${hostname}${port}`;
};

// URL de l'API publique (pour login et création de tenant)
const PUBLIC_API_URL = `${getPublicDomain()}/api`;

// URL de l'API tenant-spécifique (pour toutes les autres requêtes)
const TENANT_API_URL = `${window.location.origin}/api`;

export const ENDPOINTS = {
  // === ENDPOINTS PUBLICS (pas de tenant requis) ===
  // Utilisent PUBLIC_API_URL pour pointer vers localhost:8000
  LOGIN: `${PUBLIC_API_URL}/auth/login/`,
  REFRESH: `${PUBLIC_API_URL}/auth/token/refresh/`,
  TENANT_CREATE: `${PUBLIC_API_URL}/tenants/create/`,

  // === ENDPOINTS TENANT-SPÉCIFIQUES ===
  // Utilisent TENANT_API_URL (domaine actuel avec sous-domaine)
  LOGOUT: `${TENANT_API_URL}/auth/logout/`,
  ME: `${TENANT_API_URL}/auth/me/`,
  CHANGE_PASSWORD: `${TENANT_API_URL}/auth/change-password/`,
  USERS: `${TENANT_API_URL}/users/`,
  USER_CREATE: `${TENANT_API_URL}/users/create/`,
  USER_DETAIL: (id) => `${TENANT_API_URL}/users/${id}/`,
};

export default PUBLIC_API_URL;
