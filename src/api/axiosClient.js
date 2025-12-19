// src/api/axiosClient.js

import axios from "axios";
import { TENANT_API_URL } from "./endpoints";

// Créer l'instance axios
const axiosClient = axios.create({
  //baseURL: TENANT_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important pour les cookies de session
});

// 🚫 Endpoints qui ne doivent PAS recevoir de token
const PUBLIC_ENDPOINTS = [
  "/login",
  "/register",
  "/auth/login",
  "/auth/register",
  "/refresh",
  "/password/reset",
  "/password/forgot",
  "/tenant/auth/login", // si multi-tenant
];

// Vérifie si l’URL matche un endpoint public
function isPublicRoute(url) {
  return PUBLIC_ENDPOINTS.some((route) => url.includes(route));
}

// Intercepteur de requête : ajouter le token JWT
axiosClient.interceptors.request.use(
  (config) => {
    // ⛔ NE PAS ajouter de token sur les routes publiques
    if (isPublicRoute(config.url)) {
      console.log("🟦 Route publique sans token:", config.url);
      return config;
    }
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("'🔑 Token ajouté à la requête:'", config.url);
    } else {
      console.warn("'⚠️ Aucun token trouvé pour la requête:'", config.url);
    }

    // Log de debug
    console.log("'📤 Requête:'", {
      method: config.method,
      url: config.url,
      //headers: config.headers,
      hasToken: !!token,
    });

    return config;
  },
  (error) => {
    console.error("'❌ Erreur intercepteur requête:'", error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : gérer les erreurs 401
axiosClient.interceptors.response.use(
  (response) => {
    console.log("'✅ Réponse reçue:'", response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si 401 et pas déjà en train de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("'🔄 Token expiré, tentative de refresh...'");

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("'No refresh token'");
        }

        // Import dynamique pour éviter la circularité
        const { ENDPOINTS } = await import("./endpoints");

        // Tenter de refresh le token
        const response = await axios.post(ENDPOINTS.REFRESH, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);
        console.log("'✅ Token refreshed'");
        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        console.error("'❌ Impossible de refresh le token:'", refreshError);

        // Rediriger vers login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        // Éviter les boucles de redirection
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        //window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }
    // Log détaillé des erreurs
    console.error("'❌ Erreur API:'", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export default axiosClient;
