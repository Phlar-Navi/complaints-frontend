// =================================================================
// TenantAdminDashboard.js - Vue complète du tenant
// =================================================================
import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import DataTable from "examples/Tables/DataTable";
import CreateUserModal from "./CreateUserModal";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types";

TenantAdminDashboard.propTypes = {
  stats: PropTypes.shape({
    stats: PropTypes.shape({
      overview: PropTypes.object,
      weekly_trend: PropTypes.array,
      urgency_distribution: PropTypes.object,
      workload: PropTypes.array,
      alerts: PropTypes.array,
      sla_performance: PropTypes.object,
    }),
    meta: PropTypes.object,
  }),
  user: PropTypes.shape({
    name: PropTypes.string,
    tenant: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  }),
  onRefresh: PropTypes.func,
};

export function TenantAdminDashboard({ stats, user, onRefresh }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);

  // Extraire les stats réelles
  const actualStats = stats?.stats || stats;

  if (!actualStats?.overview) {
    return (
      <MDBox textAlign="center" py={3}>
        <MDTypography variant="h6">Aucune donnée disponible</MDTypography>
      </MDBox>
    );
  }

  const { overview, weekly_trend, urgency_distribution, workload, alerts, sla_performance } =
    actualStats;

  // Graphique hebdomadaire
  const weeklyChartData = {
    labels: (weekly_trend || []).map((d) =>
      new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" })
    ),
    datasets: {
      label: "Plaintes",
      data: (weekly_trend || []).map((d) => d.count),
    },
  };

  // Tableau des agents
  const agentColumns = [
    { Header: "agent", accessor: "agent", width: "30%", align: "left" },
    { Header: "actives", accessor: "active", width: "15%", align: "center" },
    { Header: "retard", accessor: "overdue", width: "15%", align: "center" },
    { Header: "email", accessor: "email", width: "40%", align: "left" },
  ];

  const agentRows = (workload || []).map((agent) => ({
    agent: (
      <MDTypography variant="button" fontWeight="medium">
        {agent.agent_name}
      </MDTypography>
    ),
    active: agent.assigned_count ?? 0,
    overdue: (
      <MDTypography color={agent.overdue_count > 0 ? "error" : "text"}>
        {agent.overdue_count}
      </MDTypography>
    ),
    email: (
      <MDTypography variant="caption" color="text">
        {agent.agent_email}
      </MDTypography>
    ),
  }));

  const handleCreateUserSuccess = (newUser) => {
    enqueueSnackbar("Utilisateur créé avec succès", { variant: "success" });
    // Rafraîchir les données
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <MDBox>
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            Bonjour {user?.name || "Admin"} 👋
          </MDTypography>
          <MDTypography variant="button" color="text">
            Administration - {user?.tenant?.name || "Tenant"}
          </MDTypography>
        </MDBox>
        <MDBox display="flex" gap={1}>
          <MDButton variant="outlined" color="info" onClick={onRefresh}>
            <Icon sx={{ mr: 1 }}>refresh</Icon>
            Actualiser
          </MDButton>
          <MDButton variant="gradient" color="primary" onClick={() => setCreateUserModalOpen(true)}>
            <Icon sx={{ mr: 1 }}>person_add</Icon>
            Nouvel utilisateur
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            onClick={() => navigate("/complaints/create")}
          >
            <Icon sx={{ mr: 1 }}>add</Icon>
            Nouvelle plainte
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Alertes */}
      {alerts && alerts.length > 0 && (
        <MDBox mb={3}>
          {alerts.map((alert, idx) => (
            <Card key={idx} sx={{ mb: 1 }}>
              <MDBox
                p={2}
                display="flex"
                alignItems="center"
                bgcolor={alert.severity === "high" ? "error.main" : "warning.main"}
                borderRadius="lg"
              >
                <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                  {alert.severity === "high" ? "priority_high" : "warning"}
                </Icon>
                <MDTypography variant="h6" color="white">
                  {alert.message}
                </MDTypography>
              </MDBox>
            </Card>
          ))}
        </MDBox>
      )}

      {/* Alertes urgentes et non assignées */}
      {(overview.urgent_unhandled > 0 || overview.unassigned > 0 || overview.overdue > 0) && (
        <MDBox mb={3}>
          {overview.urgent_unhandled > 0 && (
            <Card sx={{ mb: 1 }}>
              <MDBox
                p={2}
                display="flex"
                alignItems="center"
                bgcolor="error.main"
                borderRadius="lg"
              >
                <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                  priority_high
                </Icon>
                <MDTypography variant="h6" color="white">
                  {overview.urgent_unhandled} plainte(s) urgente(s) non traitée(s)
                </MDTypography>
              </MDBox>
            </Card>
          )}

          {overview.unassigned > 0 && (
            <Card sx={{ mb: 1 }}>
              <MDBox
                p={2}
                display="flex"
                alignItems="center"
                bgcolor="warning.main"
                borderRadius="lg"
              >
                <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                  assignment_late
                </Icon>
                <MDTypography variant="h6" color="white">
                  {overview.unassigned} plainte(s) non assignée(s)
                </MDTypography>
              </MDBox>
            </Card>
          )}

          {overview.overdue > 0 && (
            <Card sx={{ mb: 1 }}>
              <MDBox
                p={2}
                display="flex"
                alignItems="center"
                bgcolor="error.main"
                borderRadius="lg"
              >
                <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                  schedule
                </Icon>
                <MDTypography variant="h6" color="white">
                  {overview.overdue} plainte(s) en retard
                </MDTypography>
              </MDBox>
            </Card>
          )}
        </MDBox>
      )}

      {/* Stats principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="primary"
            icon="receipt_long"
            title="Total plaintes"
            count={overview.total_complaints || 0}
            percentage={{
              color:
                overview.trend === "up" ? "success" : overview.trend === "down" ? "error" : "info",
              amount: `${overview.trend_percentage || 0}%`,
              label: "cette semaine",
            }}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="error"
            icon="priority_high"
            title="Urgentes non traitées"
            count={overview.urgent_unhandled || 0}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="warning"
            icon="assignment_late"
            title="Non assignées"
            count={overview.unassigned || 0}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="dark"
            icon="schedule"
            title="En retard SLA"
            count={overview.overdue || 0}
          />
        </Grid>
      </Grid>

      {/* Graphiques et tableaux */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={4}>
          <ReportsBarChart
            color="info"
            title="Tendance hebdomadaire"
            description="7 derniers jours"
            chart={weeklyChartData}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Performance SLA
              </MDTypography>
            </MDBox>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="h1" fontWeight="medium" color="success">
                {sla_performance?.sla_met_percentage || 0}%
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Taux de conformité
              </MDTypography>
              <MDBox mt={2}>
                <MDTypography variant="button" color="text">
                  {sla_performance?.sla_met || 0} respectés / {sla_performance?.sla_missed || 0}{" "}
                  manqués
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Répartition par urgence
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              {urgency_distribution &&
                Object.entries(urgency_distribution).map(([key, value]) => (
                  <MDBox
                    key={key}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <MDTypography variant="button" color="text">
                      {key === "HIGH" ? "Haute" : key === "MEDIUM" ? "Moyenne" : "Basse"}
                    </MDTypography>
                    <MDBox display="flex" alignItems="center" gap={1}>
                      <MDTypography variant="button" fontWeight="medium">
                        {value.count}
                      </MDTypography>
                      <MDTypography variant="caption" color="text">
                        ({value.percentage}%)
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                ))}
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau performance équipe */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg">
              <MDTypography variant="h6" color="white">
                Performance de l&apos;équipe
              </MDTypography>
            </MDBox>
            <MDBox pt={3}>
              <DataTable
                table={{ columns: agentColumns, rows: agentRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Modal création utilisateur */}
      <CreateUserModal
        open={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        onSuccess={handleCreateUserSuccess}
        tenantId={user?.tenant?.id}
      />
    </MDBox>
  );
}

export default TenantAdminDashboard;
