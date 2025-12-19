// hooks/useDashboard.js
import { useState, useEffect, useCallback } from "react";
import { getDashboardStats, getComplaints } from "api/complaintsService";
import { getUser } from "api/userService";

/**
 * Hook personnalisé pour gérer les données du dashboard
 * @param {Object} options - Options de configuration
 * @param {boolean} options.autoRefresh - Actualisation automatique
 * @param {number} options.refreshInterval - Intervalle d'actualisation en ms (défaut: 30000)
 * @returns {Object} Données et méthodes du dashboard
 */
export const useDashboard = (options = {}) => {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [stats, setStats] = useState(null);
  const [todayComplaints, setTodayComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fonction pour récupérer les données
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);

      // Récupérer les plaintes d'aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const complaints = await getComplaints({
        ordering: "-submitted_at",
      });

      // Filtrer pour avoir seulement celles d'aujourd'hui
      const todayOnly = complaints.filter((c) => {
        const submitDate = new Date(c.submitted_at);
        submitDate.setHours(0, 0, 0, 0);
        return submitDate.getTime() === today.getTime();
      });

      setTodayComplaints(todayOnly);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erreur lors du chargement du dashboard:", err);
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage
  useEffect(() => {
    fetchData();
    const userData = localStorage.getItem("userData");
    console.log("User Data: ", userData);
  }, [fetchData]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Fonction pour forcer le rafraîchissement
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Calculer des métriques dérivées
  const metrics = stats
    ? {
        // Taux d'assignation
        assignmentRate:
          stats.overview.assigned + stats.overview.unassigned > 0
            ? (
                (stats.overview.assigned / (stats.overview.assigned + stats.overview.unassigned)) *
                100
              ).toFixed(1)
            : 0,

        // Taux de respect du SLA
        slaComplianceRate: stats.sla_performance?.sla_met_percentage || 0,

        // Nombre de plaintes actives (non résolues)
        activeComplaints:
          stats.overview.total_complaints -
          (stats.status_distribution?.closed?.count || 0) -
          (stats.status_distribution?.archived?.count || 0),

        // Urgence dominante
        dominantUrgency: Object.entries(stats.urgency_distribution || {}).reduce(
          (max, [key, value]) => (value.count > (max.value?.count || 0) ? { key, value } : max),
          {}
        ).key,
      }
    : null;

  return {
    // Données
    stats,
    todayComplaints,
    metrics,

    // État
    loading,
    error,
    lastUpdate,

    // Méthodes
    refresh,
  };
};

export default useDashboard;
