// src/api/authService.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { setTokens, clearTokens } from "./token";

export const login = async (email, password) => {
  console.log("Login URL:", ENDPOINTS.LOGIN);

  const res = await axiosClient.post(ENDPOINTS.LOGIN, {
    email,
    password,
  });

  const userData = res.data;

  setTokens(userData.access, userData.refresh);

  // APRÈS la connexion réussie, on sait maintenant à quel tenant l'utilisateur appartient
  // On peut rediriger vers le sous-domaine correct si nécessaire
  if (userData.tenant && userData.tenant.schema_name) {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    const currentPort = window.location.port ? `:${window.location.port}` : "";

    // Si on n'est pas déjà sur le bon sous-domaine, on redirige
    if (!currentHost.startsWith(userData.tenant.schema_name + ".")) {
      const newUrl = `${currentProtocol}//${
        userData.tenant.schema_name
      }.${getBaseDomain()}${currentPort}/dashboard`;
      console.log("Redirection vers:", newUrl);
      window.location.href = newUrl;
      return userData; // La redirection va interrompre l'exécution
    }
  }
  return userData;
};

// Fonction utilitaire pour extraire le domaine de base
const getBaseDomain = () => {
  const hostname = window.location.hostname;
  if (hostname.includes(".")) {
    const parts = hostname.split(".");
    return parts.slice(-2).join("."); // Ex: "localhost" ou "example.com"
  }
  return hostname;
};

export const login_legacy = async (email, password) => {
  console.log("authService login called: ", ENDPOINTS.LOGIN);
  const res = await axiosClient.post(ENDPOINTS.LOGIN, {
    email,
    password,
  });

  setTokens(res.data.access, res.data.refresh);
  return res.data;
};

export const logout = async () => {
  try {
    await axiosClient.post(ENDPOINTS.LOGOUT);
  } catch (e) {}

  clearTokens();
};

export const getCurrentUser = async () => {
  const res = await axiosClient.get(ENDPOINTS.ME);
  return res.data;
};

export const changePassword = async (oldPass, newPass) => {
  const res = await axiosClient.post(ENDPOINTS.CHANGE_PASSWORD, {
    old_password: oldPass,
    new_password: newPass,
  });

  setTokens(res.data.access, res.data.refresh);
  return res.data;
};
