// =================================================================
// Agent Dashboard - Mes tâches (AVEC DÉBOGAGE)
// =================================================================
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

AgentDashboard.propTypes = {
  stats: PropTypes.shape({
    stats: PropTypes.shape({
      overview: PropTypes.shape({
        total_complaints: PropTypes.number,
        this_week: PropTypes.number,
        prev_week: PropTypes.number,
        trend: PropTypes.string,
        trend_percentage: PropTypes.number,
        urgent_unhandled: PropTypes.number,
        unassigned: PropTypes.number,
        assigned: PropTypes.number,
        overdue: PropTypes.number,
      }),

      weekly_trend: PropTypes.arrayOf(
        PropTypes.shape({
          date: PropTypes.string,
          day: PropTypes.string,
          count: PropTypes.number,
        })
      ),

      urgency_distribution: PropTypes.objectOf(
        PropTypes.shape({
          count: PropTypes.number,
          percentage: PropTypes.number,
        })
      ),

      sla_performance: PropTypes.shape({
        total_resolved: PropTypes.number,
        sla_met: PropTypes.number,
        sla_missed: PropTypes.number,
        sla_met_percentage: PropTypes.number,
        sla_missed_percentage: PropTypes.number,
      }),

      personal_stats: PropTypes.shape({
        active_complaints: PropTypes.number,
        resolved_complaints: PropTypes.number,
        overdue_complaints: PropTypes.number,
        avg_resolution_time_hours: PropTypes.number,
      }),
    }),

    meta: PropTypes.shape({
      role: PropTypes.string,
      tenant: PropTypes.string,
      schema: PropTypes.string,
    }),
  }),

  user: PropTypes.shape({
    name: PropTypes.string,
  }),

  onRefresh: PropTypes.func,
};

function AgentDashboard({ stats, user, onRefresh }) {
  const navigate = useNavigate();

  // ===== DÉBOGAGE DÉTAILLÉ =====
  console.log("=== DÉBOGAGE AgentDashboard ===");
  console.log("1. stats reçu:", stats);
  console.log("2. Type de stats:", typeof stats);
  console.log("3. stats est null?", stats === null);
  console.log("4. stats est undefined?", stats === undefined);
  console.log("5. stats?.stats:", stats?.stats);
  console.log("6. stats?.stats?.overview:", stats?.stats?.overview);

  // Extraire les stats réelles de l'objet parent
  const actualStats = stats?.stats || stats;
  const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  console.log("7. actualStats:", actualStats);
  console.log("8. actualStats?.overview:", actualStats?.overview);
  console.log("================================");

  // Si stats est complètement absent
  if (!stats) {
    return (
      <MDBox textAlign="center" py={3}>
        <MDTypography variant="h6" color="error">
          ❌ Erreur: Aucune donnée reçue (stats est null/undefined)
        </MDTypography>
      </MDBox>
    );
  }

  // Si overview n'existe pas
  if (!actualStats?.overview) {
    return (
      <MDBox textAlign="center" py={3}>
        <MDTypography variant="h6" color="warning">
          ⚠️ Structure incorrecte: overview introuvable
        </MDTypography>
        <MDTypography variant="caption" color="text" component="pre" mt={2}>
          {JSON.stringify(stats, null, 2)}
        </MDTypography>
      </MDBox>
    );
  }

  const {
    overview = {},
    weekly_trend = [],
    urgency_distribution = {},
    sla_performance = {},
    personal_stats = {},
  } = actualStats;

  // Graphique hebdomadaire
  const weeklyChartData = {
    labels: weekly_trend.map((d) =>
      new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" })
    ),
    datasets: {
      label: "Mes plaintes",
      data: weekly_trend.map((d) => d.count),
    },
  };

  const urgentCount = urgency_distribution?.HIGH?.count ?? 0;

  return (
    <MDBox>
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            Bonjour {userData?.first_name || "Agent"}
          </MDTypography>
          <MDTypography variant="button" color="text">
            Catégorie : Agent
          </MDTypography>
        </MDBox>
        <MDButton variant="outlined" color="info" onClick={onRefresh}>
          <Icon sx={{ mr: 1 }}>refresh</Icon>
          Actualiser
        </MDButton>
      </MDBox>

      {/* Alerte urgente */}
      {urgentCount > 0 && (
        <MDBox mb={3}>
          <Card>
            <MDBox p={2} display="flex" alignItems="center" bgcolor="error.main" borderRadius="lg">
              <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                priority_high
              </Icon>
              <MDTypography variant="h6" color="black">
                {urgentCount} plainte(s) urgente(s) en cours
              </MDTypography>
            </MDBox>
          </Card>
        </MDBox>
      )}

      {/* Stats principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="primary"
            icon="assignment"
            title="Plaintes actives"
            count={overview.assigned ?? 0}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="error"
            icon="schedule"
            title="En retard"
            count={overview.overdue ?? 0}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="success"
            icon="check_circle"
            title="Résolues"
            count={personal_stats.resolved_complaints ?? 0}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="info"
            icon="timer"
            title="Temps moyen"
            count={
              personal_stats.avg_resolution_time_hours
                ? `${personal_stats.avg_resolution_time_hours}h`
                : "N/A"
            }
          />
        </Grid>
      </Grid>

      {/* Graphique */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <ReportsBarChart
            color="info"
            title="Ma tendance hebdomadaire"
            description="7 derniers jours"
            chart={weeklyChartData}
          />
        </Grid>

        {/* Performance SLA */}
        <Grid item xs={12} md={6} lg={4}>
          <Card>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Performance SLA
              </MDTypography>
            </MDBox>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="h2" fontWeight="medium" color="success">
                {sla_performance.sla_met_percentage ?? 0}%
              </MDTypography>
              <MDTypography variant="caption" color="text">
                SLA respectés
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default AgentDashboard;
