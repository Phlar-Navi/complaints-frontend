import { useState, useEffect, useCallback } from "react";
import { getDashboardStats } from "api/complaintsService";
import { useAuth } from "context/authContext";

/**
 * Hook personnalisé pour récupérer les stats dashboard selon le rôle
 * @param {Object} options - Options de configuration
 * @param {boolean} options.autoRefresh - Active le rafraîchissement automatique
 * @param {number} options.refreshInterval - Intervalle de rafraîchissement (ms)
 * @returns {Object} État du dashboard avec données adaptées au rôle
 */
export const useRoleDashboard = (options = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  const { user } = useAuth();

  const [state, setState] = useState({
    role: null,
    stats: null,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await getDashboardStats();

      setState((prev) => ({
        ...prev,
        stats: response.stats,
        loading: false,
        error: null,
        lastUpdate: new Date(),
      }));
      console.log("STATE DANS LE HOOK: ", state);
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || error.message || "Erreur de chargement",
      }));
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;

    console.log("UTILISATEUR CONNECTE RAW: ", raw);
    console.log("UTILISATEUR CONNECTE OBJET: ", user);
    console.log("UTILISATEUR CONNECTE ROLE: ", user?.role);

    setState((prev) => ({
      ...prev,
      role: user?.role,
    }));
    console.log("ROLE DANS LE HOOK: ", user?.role);
    console.log("STATE DANS LE HOOK: ", state);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchDashboardData]);

  return {
    ...state,
    user,
    refresh: fetchDashboardData,
  };
};
