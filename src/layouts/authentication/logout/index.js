// src/layouts/authentication/logout/index.js

import { useEffect } from "react";
import { logout } from "api/authService";

export default function Logout() {
  useEffect(() => {
    console.log("Déconnexion en cours...");
    logout(); // exécute immédiatement
  }, []);

  return null; // Rien à afficher
}
