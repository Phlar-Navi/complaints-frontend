/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";

// Dashboard components
import RecentComplaints from "layouts/dashboard/components/RecentComplaints";
import AssignmentOverview from "layouts/dashboard/components/AssignmentOverview";

// Hook personnalisé
import { useDashboard } from "hooks/useDashboard";
import { useEffect } from "react";
import { useAuth } from "context/authContext";

function Dashboard() {
  // Utiliser le hook avec auto-refresh toutes les 30 secondes
  const { stats, todayComplaints, metrics, loading, error, lastUpdate, refresh } = useDashboard({
    autoRefresh: true,
    refreshInterval: 30000,
  });
  // Récupérer l'utilisateur depuis le contexte
  const { user } = useAuth();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      console.log("UTILISATEUR CONNECTE: ", userData);
    }
  }, []);

  // Loading state
  if (loading && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox textAlign="center">
            <Icon fontSize="large" sx={{ mb: 2 }}>
              hourglass_empty
            </Icon>
            <MDTypography variant="h6">Chargement du dashboard...</MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox textAlign="center">
            <Icon fontSize="large" color="error" sx={{ mb: 2 }}>
              error_outline
            </Icon>
            <MDTypography variant="h6" color="error">
              Erreur lors du chargement
            </MDTypography>
            <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
              {error}
            </MDTypography>
            <MDButton color="info" onClick={refresh} sx={{ mt: 2 }}>
              Réessayer
            </MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // No data state
  if (!stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox textAlign="center">
            <Icon fontSize="large" sx={{ mb: 2 }}>
              inbox
            </Icon>
            <MDTypography variant="h6">Aucune donnée disponible</MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const { overview, urgency_distribution, weekly_trend } = stats;

  // Calculer le taux de changement par rapport à hier
  const yesterdayCount = weekly_trend[weekly_trend.length - 2]?.count || 0;
  const todayCount = todayComplaints.length;
  const todayChange =
    yesterdayCount > 0 ? (((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(1) : 0;

  // Préparer les données pour le graphique
  const weeklyChartData = {
    labels: weekly_trend.map((day) => {
      const date = new Date(day.date);
      return date.toLocaleDateString("fr-FR", { weekday: "short" });
    }),
    datasets: {
      label: "Plaintes",
      data: weekly_trend.map((day) => day.count),
    },
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header avec dernière mise à jour */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDBox>
            <MDTypography variant="h4" fontWeight="medium">
              Tableau de bord
            </MDTypography>
            <MDTypography variant="button" color="text">
              {lastUpdate && (
                <>
                  Dernière mise à jour:{" "}
                  {lastUpdate.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </MDTypography>
          </MDBox>
          <MDButton variant="outlined" color="info" onClick={refresh} disabled={loading}>
            <Icon sx={{ mr: 1 }}>refresh</Icon>
            Actualiser
          </MDButton>
        </MDBox>

        {/* Statistiques principales */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="today"
                title="Reçues aujourd'hui"
                count={todayCount}
                percentage={{
                  color: todayChange >= 0 ? "success" : "error",
                  amount: `${todayChange >= 0 ? "+" : ""}${todayChange}%`,
                  label: "par rapport à hier",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="error"
                icon="priority_high"
                title="Urgentes non traitées"
                count={overview.urgent_unhandled}
                percentage={{
                  color: overview.urgent_unhandled > 0 ? "error" : "success",
                  amount: overview.urgent_unhandled > 0 ? "Attention requise" : "Aucune",
                  label: "plaintes urgentes",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon="assignment_late"
                title="Non assignées"
                count={overview.unassigned}
                percentage={{
                  color: metrics.assignmentRate >= 70 ? "success" : "error",
                  amount: `${metrics.assignmentRate}%`,
                  label: "sont assignées",
                }}
              />
            </MDBox>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="schedule"
                title="En retard (SLA)"
                count={overview.overdue}
                percentage={{
                  color: overview.overdue > 0 ? "error" : "success",
                  amount: overview.overdue > 0 ? "Action requise" : "Tout va bien",
                  label: "plaintes en retard",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Graphiques et tendances */}
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Tendance hebdomadaire"
                  description="Plaintes reçues cette semaine"
                  date={`${overview.this_week} cette semaine`}
                  chart={weeklyChartData}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ComplexStatisticsCard
                  icon="pie_chart"
                  title="Répartition par urgence"
                  count={`${urgency_distribution.HIGH?.percentage || 0}%`}
                  percentage={{
                    color: "error",
                    amount: `${urgency_distribution.HIGH?.count || 0} haute`,
                    label: `${urgency_distribution.MEDIUM?.count || 0} moyenne, ${
                      urgency_distribution.LOW?.count || 0
                    } basse`,
                  }}
                />
              </MDBox>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ComplexStatisticsCard
                  color="success"
                  icon="check_circle"
                  title="Total des plaintes"
                  count={overview.total_complaints}
                  percentage={{
                    color: overview.trend === "up" ? "error" : "success",
                    amount: `${overview.trend === "up" ? "+" : "-"}${overview.trend_percentage}%`,
                    label: "cette semaine",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>

        {/* Sections détaillées */}
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <RecentComplaints complaints={todayComplaints} onRefresh={refresh} />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <AssignmentOverview stats={stats} />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
