// src/api/config.js

/**
 * Configuration centralisée pour l'application
 */
import { getBackendUrl } from "./endpoints";
// Détecter l'environnement
const isDevelopment =
  process.env.NODE_ENV === "development" ||
  window.location.hostname === "localhost" ||
  window.location.hostname.endsWith(".localhost");

export const config = {
  // Environnement
  IS_DEVELOPMENT: isDevelopment,

  // Ports
  FRONTEND_PORT: 3000,
  BACKEND_PORT: isDevelopment ? 8000 : null, // En prod, pas de port (https par défaut)

  // Protocole
  PROTOCOL: window.location.protocol, // 'http:' ou 'https:'
};

export const getFrontendPort = () => {
  // En dev, port 3000
  if (config.IS_DEVELOPMENT) {
    return ":3000";
  }
  // En prod, aucun port
  return "";
};

export default config;
