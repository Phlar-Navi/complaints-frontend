// src/api/smartAuthService.js

import axios from "axios";

// URL du backend principal (sans sous-domaine)
const MAIN_API_URL = process.env.REACT_APP_MAIN_API_URL || "http://localhost:8000/api";

/**
 * Login intelligent qui cherche automatiquement le tenant de l'utilisateur
 *
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise} Données de connexion avec tenant et URL de redirection
 */
export const smartLogin = async (email, password) => {
  try {
    // DEV ONLY console.log("'🔐 Smart login - Envoi vers:'", `${MAIN_API_URL}/auth/smart-login/`);

    const response = await axios.post(`${MAIN_API_URL}/auth/smart-login/`, {
      email,
      password,
    });

    // DEV ONLY console.log("'✅ Réponse reçue:'", response.data);

    const { access, refresh, user, tenant, redirect_url, message } = response.data;

    // Stocker les données d'authentification
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("tenant", JSON.stringify(tenant));

    return {
      success: true,
      access,
      refresh,
      user,
      tenant,
      redirect_url,
      message,
    };
  } catch (error) {
    console.error("'❌ Erreur smart login:'", error);

    // Extraire le message d'erreur
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Erreur de connexion";

    throw new Error(errorMessage);
  }
};

/**
 * Vérifier si une redirection est nécessaire
 * Compare le domaine actuel avec le domaine du tenant
 *
 * @param {string} tenantDomain - Domaine du tenant (ex: hopital-central.localhost)
 * @returns {boolean} True si une redirection est nécessaire
 */
export const needsRedirection = (tenantDomain) => {
  if (!tenantDomain) return false;

  const currentHostname = window.location.hostname;

  // Extraire le sous-domaine du tenant domain
  const tenantSubdomain = tenantDomain.split(".")[0];
  const currentSubdomain = currentHostname.split(".")[0];

  // Comparer les sous-domaines
  return tenantSubdomain !== currentSubdomain;
};

/**
 * Obtenir le domaine actuel
 *
 * @returns {string} Domaine actuel (ex: hopital-central.localhost)
 */
export const getCurrentDomain = () => {
  return window.location.hostname;
};

/**
 * Obtenir le sous-domaine actuel
 *
 * @returns {string|null} Sous-domaine ou null si sur le domaine principal
 */
export const getCurrentSubdomain = () => {
  const hostname = window.location.hostname;

  // En développement : localhost
  if (hostname === "localhost") {
    return null;
  }

  // En développement : xxx.localhost
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.split(".")[0];
    return subdomain !== "localhost" ? subdomain : null;
  }

  // En production : xxx.votreapp.com
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
};

/**
 * Vérifier si l'utilisateur est déjà connecté
 *
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  const user = localStorage.getItem("user");
  return !!(token && user);
};

/**
 * Récupérer l'utilisateur stocké
 *
 * @returns {Object|null}
 */
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Récupérer le tenant stocké
 *
 * @returns {Object|null}
 */
export const getStoredTenant = () => {
  const tenant = localStorage.getItem("tenant");
  return tenant ? JSON.parse(tenant) : null;
};

/**
 * Déconnexion
 */
export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  localStorage.removeItem("tenant");
};
