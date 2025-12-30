// src/api/authService.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { getFrontendPort, config } from "./config";

/**
 * Extrait le domaine de base sans sous-domaine
 */
const getBaseDomain = () => {
  const hostname = window.location.hostname;
  if (hostname.includes(".")) {
    const parts = hostname.split(".");
    if (parts[parts.length - 1] === "localhost") {
      return "localhost";
    }
    return parts.slice(-2).join(".");
  }
  return hostname;
};

/**
 * Construit l'URL avec sous-domaine tenant
 */
const buildTenantUrl = (subdomain, path = "/dashboard", params = {}) => {
  const baseDomain = getBaseDomain();
  const protocol = config.PROTOCOL;
  const port = getFrontendPort();

  let url;
  if (baseDomain === "localhost") {
    url = `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
  } else {
    url = `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
  }

  // Ajouter les paramètres d'URL
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  return url;
};

/**
 * Vérifie si on est sur le domaine public (localhost sans sous-domaine)
 */
const isOnPublicDomain = () => {
  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === getBaseDomain();
};

/**
 * Vérifie si on est déjà sur le bon sous-domaine
 */
const isOnTenantDomain = (tenantSchemaName) => {
  const currentHost = window.location.hostname;
  const normalizedSchema = tenantSchemaName.replace(/_/g, "-");
  return currentHost.startsWith(`${normalizedSchema}.`);
};

/**
 * Connexion utilisateur
 */
export const login = async (email, password) => {
  try {
    console.log("🔐 Login depuis:", window.location.hostname);
    console.log("   Email:", email);

    // Appel API (ne pas nettoyer localStorage avant, on peut en avoir besoin)
    const response = await axiosClient.post(ENDPOINTS.LOGIN, {
      email,
      password,
    });

    const { access, refresh, user, tenant } = response.data;
    console.log("Réponse recue: ", response.data);
    localStorage.setItem("login_response", JSON.stringify(response.data));

    console.log("✅ Login réussi:", {
      user: user.email,
      role: user.role,
      tenant: tenant?.name,
      tenantSchema: tenant?.schema_name,
    });

    // Si on est sur le domaine public ET que l'utilisateur a un tenant
    if (isOnPublicDomain() && tenant && tenant.schema_name) {
      const normalizedSchema = tenant.schema_name.replace(/_/g, "-");

      console.log("🔄 Redirection cross-domain détectée");
      console.log("   De: localhost");
      console.log("   Vers:", `${normalizedSchema}.localhost`);

      // 🔧 SOLUTION : Passer les tokens et user dans l'URL (temporairement)
      const redirectUrl = buildTenantUrl(
        normalizedSchema,
        "/auth-callback", // ← Page spéciale qui va récupérer les tokens
        {
          // Encoder les données en base64 pour sécurité
          token: btoa(access),
          refresh: btoa(refresh),
          user: btoa(JSON.stringify(user)),
          tenant: btoa(JSON.stringify(tenant)),
          redirect: "/dashboard", // Où aller après
        }
      );

      console.log("🔄 Redirection vers:", redirectUrl);

      // Redirection immédiate
      window.location.href = redirectUrl;
      return response.data;
    }

    // Sinon, on est déjà sur le bon domaine : stocker normalement
    console.log("✓ Même domaine, stockage local");

    // Nettoyer puis stocker
    localStorage.clear();
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    if (tenant) {
      localStorage.setItem("tenant", JSON.stringify(tenant));
    }

    console.log("💾 Tokens stockés localement");

    // 🔥 NOUVEAU : Dispatcher l'événement pour recalculer les routes
    console.log("🔔 Dispatch userChanged event");
    window.dispatchEvent(new Event("userChanged"));
    window.location.reload();
    return response.data;
  } catch (error) {
    console.error("❌ Erreur login:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gère la réception des tokens après redirection cross-domain
 * À appeler dans une page /auth-callback
 */
export const handleAuthCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const refresh = params.get("refresh");
  const userEncoded = params.get("user");
  const tenantEncoded = params.get("tenant");
  const redirectPath = params.get("redirect") || "/dashboard";

  if (!token || !refresh || !userEncoded) {
    console.error("❌ Tokens manquants dans l'URL");
    window.location.href = "/authentication/sign-in";
    return false;
  }

  try {
    // Décoder les données
    const accessToken = atob(token);
    const refreshToken = atob(refresh);
    const user = JSON.parse(atob(userEncoded));
    const tenant = tenantEncoded ? JSON.parse(atob(tenantEncoded)) : null;

    console.log("✅ Tokens reçus depuis URL");
    console.log("   User:", user.email);
    console.log("   Tenant:", tenant?.name);

    // Nettoyer et stocker dans le localStorage du nouveau domaine
    localStorage.clear();
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    if (tenant) {
      localStorage.setItem("tenant", JSON.stringify(tenant));
      console.log("   Tenant stocké:", tenant.name);
    }

    console.log("💾 Tokens stockés sur le nouveau domaine");

    // 🔥 NOUVEAU : Dispatcher l'événement pour recalculer les routes
    console.log("🔔 Dispatch userChanged event");
    window.dispatchEvent(new Event("userChanged"));

    // Nettoyer l'URL (enlever les tokens visibles)
    window.history.replaceState({}, document.title, redirectPath);

    // 🔄 Utiliser window.location.href pour forcer le rechargement avec les nouvelles routes
    // Ceci garantit que les routes sont recalculées avec les bonnes données utilisateur
    window.location.href = redirectPath;

    return true;
  } catch (error) {
    console.error("❌ Erreur décodage tokens:", error);
    window.location.href = "/authentication/sign-in";
    return false;
  }
};

/**
 * Déconnexion utilisateur
 */
// src/api/authService.js

export const logout = async () => {
  try {
    console.log("🚪 Déconnexion...");

    try {
      await axiosClient.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn("⚠️ Erreur lors du logout API:", error);
    }

    // Nettoyer le localStorage
    localStorage.clear();
    console.log("💾 LocalStorage nettoyé");

    // 🔥 IMPORTANT : Rediriger vers le domaine PUBLIC (sans sous-domaine)
    const protocol = window.location.protocol;
    const publicDomain = "frontend.complaints.kidjamo.app";
    const port = window.location.hostname === "localhost" ? ":3000" : "";

    // Rediriger vers le domaine public pour le login
    window.location.href = `${protocol}//${publicDomain}${port}/authentication/sign-in`;
  } catch (error) {
    console.error("❌ Erreur logout:", error);
    localStorage.clear();

    // Même en cas d'erreur, forcer la redirection
    const protocol = window.location.protocol;
    const publicDomain = "frontend.complaints.kidjamo.app";
    const port = window.location.hostname === "localhost" ? ":3000" : "";
    window.location.href = `${protocol}//${publicDomain}${port}/authentication/sign-in`;
  }
};

export const logout_not_redirecting = async () => {
  try {
    console.log("🚪 Déconnexion...");

    // Appeler l'API de logout si nécessaire
    try {
      await axiosClient.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn("⚠️ Erreur lors du logout API:", error);
      // Continue quand même la déconnexion locale
    }

    // Nettoyer le localStorage
    localStorage.clear();
    console.log("💾 LocalStorage nettoyé");

    // 🔥 NOUVEAU : Dispatcher l'événement pour recalculer les routes
    console.log("🔔 Dispatch userChanged event");
    window.dispatchEvent(new Event("userChanged"));

    // 🔥 FORCER un vrai rechargement pour reconstruire axiosClient
    setTimeout(() => {
      console.log("Rechargement FORCE!");
      window.location.reload();
    }, 100);

    // Rediriger vers la page de connexion
    window.location.href = "/authentication/sign-in";
  } catch (error) {
    console.error("❌ Erreur logout:", error);
    // Force la déconnexion même en cas d'erreur
    localStorage.clear();
    window.dispatchEvent(new Event("userChanged"));
    window.location.href = "/authentication/sign-in";
  }
};

/**
 * Connexion utilisateur
 */
export const login_old = async (email, password) => {
  try {
    console.log("🔐 Login depuis:", window.location.hostname);
    console.log("   Email:", email);

    // Appel API (ne pas nettoyer localStorage avant, on peut en avoir besoin)
    const response = await axiosClient.post(ENDPOINTS.LOGIN, {
      email,
      password,
    });

    const { access, refresh, user, tenant } = response.data;
    console.log("Réponse recue: ", response.data);
    localStorage.setItem("login_response", JSON.stringify(response.data));

    console.log("✅ Login réussi:", {
      user: user.email,
      role: user.role,
      tenant: tenant?.name,
      tenantSchema: tenant?.schema_name,
    });

    // Si on est sur le domaine public ET que l'utilisateur a un tenant
    if (isOnPublicDomain() && tenant && tenant.schema_name) {
      const normalizedSchema = tenant.schema_name.replace(/_/g, "-");

      console.log("🔄 Redirection cross-domain détectée");
      console.log("   De: localhost");
      console.log("   Vers:", `${normalizedSchema}.localhost`);

      // 🔧 SOLUTION : Passer les tokens et user dans l'URL (temporairement)
      const redirectUrl = buildTenantUrl(
        normalizedSchema,
        "/auth-callback", // ← Page spéciale qui va récupérer les tokens
        {
          // Encoder les données en base64 pour sécurité
          token: btoa(access),
          refresh: btoa(refresh),
          user: btoa(JSON.stringify(user)),
          tenant: btoa(JSON.stringify(tenant)),
          redirect: "/dashboard", // Où aller après
        }
      );

      console.log("🔄 Redirection vers:", redirectUrl);

      window.dispatchEvent(new Event("userChanged"));
      // Redirection immédiate
      window.location.href = redirectUrl;

      return response.data;
    }

    // Sinon, on est déjà sur le bon domaine : stocker normalement
    console.log("✓ Même domaine, stockage local");

    // Nettoyer puis stocker
    localStorage.clear();
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("user", JSON.stringify(user));

    if (tenant) {
      localStorage.setItem("tenant", JSON.stringify(tenant));
    }

    console.log("💾 Tokens stockés localement");

    return response.data;
  } catch (error) {
    console.error("❌ Erreur login:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Gère la réception des tokens après redirection cross-domain
 * À appeler dans une page /auth-callback
 */
export const handleAuthCallback_old = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const refresh = params.get("refresh");
  const userEncoded = params.get("user");
  const tenantEncoded = params.get("tenant");
  const redirectPath = params.get("redirect") || "/dashboard";

  if (!token || !refresh || !userEncoded) {
    console.error("❌ Tokens manquants dans l'URL");
    window.location.href = "/authentication/sign-in";
    return false;
  }

  try {
    // Décoder les données
    const accessToken = atob(token);
    const refreshToken = atob(refresh);
    const user = JSON.parse(atob(userEncoded));
    const tenant = tenantEncoded ? JSON.parse(atob(tenantEncoded)) : null;

    console.log("✅ Tokens reçus depuis URL");
    console.log("   User:", user.email);
    console.log("   Tenant:", tenant?.name);

    // Nettoyer et stocker dans le localStorage du nouveau domaine
    localStorage.clear();
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    if (tenant) {
      localStorage.setItem("tenant", JSON.stringify(tenant));
      console.log("   Tenant stocké:", tenant.name);
    }

    console.log("💾 Tokens stockés sur le nouveau domaine");

    // Nettoyer l'URL (enlever les tokens visibles)
    window.history.replaceState({}, document.title, redirectPath);

    // Rediriger vers la destination finale
    window.location.href = redirectPath;

    return true;
  } catch (error) {
    console.error("❌ Erreur décodage tokens:", error);
    window.location.href = "/authentication/sign-in";
    return false;
  }
};

/**
 * Déconnexion
 */
export const logout_old = () => {
  console.log("'👋 Logout...'");
  // Nettoyer complètement le localStorage
  localStorage.clear();
  const baseDomain = getBaseDomain();
  const protocol = config.PROTOCOL;
  const port = getFrontendPort(); // Ex: :3000 en dev, "" en prod

  // Important : garder exactement le chemin legacy
  window.location.href = `${protocol}//localhost:3000/authentication/sign-in`;
};

export const logout_buggy = async () => {
  try {
    console.log("👋 Logout...");
  } catch (e) {
    console.error("Erreur lors de la déconnexion:", e);
  } finally {
    localStorage.clear();

    // Rediriger vers la page de login publique
    const baseDomain = getBaseDomain();
    const protocol = config.PROTOCOL;
    const port = getFrontendPort();

    window.location.href = `${protocol}//${baseDomain}${port}/authentication/sign-in`;
  }
};

/**
 * Vérifier si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");

  return !!(token && userStr);
};

/**
 * Obtenir l'utilisateur depuis localStorage
 */
export const getCurrentUserFromStorage = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Obtenir le tenant depuis localStorage
 */
export const getCurrentTenant = () => {
  const tenantStr = localStorage.getItem("tenant");
  return tenantStr ? JSON.parse(tenantStr) : null;
};

/**
 * Récupérer l'utilisateur connecté depuis l'API
 */
export const getCurrentUser = async () => {
  const res = await axiosClient.get(ENDPOINTS.ME);
  return res.data;
};

/**
 * Changer le mot de passe
 */
export const changePassword = async (oldPass, newPass, confirmPass) => {
  const res = await axiosClient.post(ENDPOINTS.CHANGE_PASSWORD, {
    old_password: oldPass,
    new_password: newPass,
    new_password_confirm: confirmPass,
  });

  if (res.data.access && res.data.refresh) {
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
  }

  return res.data;
};
