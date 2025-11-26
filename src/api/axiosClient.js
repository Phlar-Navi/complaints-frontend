// src/api/axiosClient.js

import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";

const axiosClient = axios.create({
  withCredentials: false,
});

// Intercepteur de requête pour ajouter le token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    // Endpoints publics qui ne nécessitent PAS d'authentification
    const publicEndpoints = ["/auth/login/", "/auth/token/refresh/", "/tenants/create/"];

    // Vérifier si l'URL correspond à un endpoint public
    const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url.includes(endpoint));

    // Si ce n'est pas un endpoint public ET qu'on a un token, l'ajouter
    if (!isPublicEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer le refresh token
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = getRefreshToken();

        if (!refresh) {
          // Pas de refresh token, déconnexion
          clearTokens();
          // Rediriger vers login
          const baseDomain = window.location.hostname.includes(".")
            ? window.location.hostname.split(".").slice(-1)[0]
            : window.location.hostname;
          const protocol = window.location.protocol;
          const port = window.location.port ? `:${window.location.port}` : "";
          window.location.href = `${protocol}//${baseDomain}${port}/login`;
          return Promise.reject(error);
        }

        // Tenter de rafraîchir le token
        const res = await axios.post(ENDPOINTS.REFRESH, {
          refresh: refresh,
        });

        const newAccess = res.data.access;
        const newRefresh = res.data.refresh ?? refresh;

        // Sauvegarder les nouveaux tokens
        setTokens(newAccess, newRefresh);

        // Réessayer la requête originale avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Le refresh a échoué, déconnexion
        console.error("Erreur lors du refresh du token:", refreshError);
        clearTokens();
        // Rediriger vers login sur le domaine public
        const hostname = window.location.hostname;
        const baseDomain = hostname.includes(".")
          ? hostname.split(".").slice(-1)[0] === "localhost"
            ? "localhost"
            : hostname.split(".").slice(-2).join(".")
          : hostname;
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : "";
        window.location.href = `${protocol}//${baseDomain}${port}/login`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
