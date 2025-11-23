// src/api/centralAuthService.js

import axios from "axios";

// URL du domaine public (sans sous-domaine tenant)
const PUBLIC_API_URL = process.env.REACT_APP_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Login centralisé - identifie le tenant et redirige
 * Cette fonction est appelée depuis le domaine principal (app.votreapp.com)
 */
export const centralLogin = async (email, password) => {
  try {
    const response = await axios.post(`${PUBLIC_API_URL}/auth/central-login/`, {
      email,
      password,
    });

    const { access, refresh, user, tenant, redirect_url } = response.data;

    // Stocker temporairement les tokens
    sessionStorage.setItem("'temp_access_token'", access);
    sessionStorage.setItem("'temp_refresh_token'", refresh);
    sessionStorage.setItem("'temp_user'", JSON.stringify(user));
    sessionStorage.setItem("'temp_tenant'", JSON.stringify(tenant));

    return {
      success: true,
      redirect_url,
      tenant,
      user,
      access,
      refresh,
    };
  } catch (error) {
    console.error("'Erreur login centralisé:'", error);
    throw error.response?.data?.error || "'Erreur de connexion'";
  }
};

/**
 * Finaliser le login après redirection vers le tenant
 * Cette fonction est appelée depuis le domaine du tenant (hopital.votreapp.com)
 */
export const finalizeLogin = () => {
  const access = sessionStorage.getItem("'temp_access_token'");
  const refresh = sessionStorage.getItem("'temp_refresh_token'");
  const user = sessionStorage.getItem("'temp_user'");
  const tenant = sessionStorage.getItem("'temp_tenant'");

  if (access && refresh && user && tenant) {
    // Transférer vers localStorage
    localStorage.setItem("'access_token'", access);
    localStorage.setItem("'refresh_token'", refresh);
    localStorage.setItem("'user'", user);
    localStorage.setItem("'tenant'", tenant);

    // Nettoyer sessionStorage
    sessionStorage.removeItem("'temp_access_token'");
    sessionStorage.removeItem("'temp_refresh_token'");
    sessionStorage.removeItem("'temp_user'");
    sessionStorage.removeItem("'temp_tenant'");

    return {
      success: true,
      user: JSON.parse(user),
      tenant: JSON.parse(tenant),
    };
  }

  return { success: false };
};

/**
 * Déterminer le domaine tenant depuis l'URL actuelle
 */
export const getCurrentTenantDomain = () => {
  const hostname = window.location.hostname;

  // En développement : extraire le sous-domaine de localhost
  if (hostname.includes(".localhost")) {
    const subdomain = hostname.split(".")[0];
    return subdomain !== "localhost" ? subdomain : null;
  }
  // En production : extraire le sous-domaine
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    return parts[0]; // Premier segment = sous-domaine
  }
  return null;
};

/**
 * Vérifier si on est sur le domaine principal ou un tenant
 */
export const isOnMainDomain = () => {
  const hostname = window.location.hostname;
  // En dev : localhost sans sous-domaine
  if (hostname === "localhost") {
    return true;
  }
  // En prod : domaine principal (app.votreapp.com)
  const parts = hostname.split(".");
  return parts.length === 2 || (parts.length === 3 && parts[0] === "app");
};
