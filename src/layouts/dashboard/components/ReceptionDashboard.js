// Reception Dashboard - Triage et assignation (ALIGNÉ BACKEND)
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

ReceptionDashboard.propTypes = {
  stats: PropTypes.shape({
    stats: PropTypes.shape({
      overview: PropTypes.object,
      weekly_trend: PropTypes.array,
      urgency_distribution: PropTypes.object,
      status_distribution: PropTypes.object,
      workload: PropTypes.array,
      sla_performance: PropTypes.object,
      personal_stats: PropTypes.object,
    }),
    meta: PropTypes.object,
  }),
  user: PropTypes.shape({
    name: PropTypes.string,
  }),
  onRefresh: PropTypes.func,
};

function ReceptionDashboard({ stats, user, onRefresh }) {
  const navigate = useNavigate();

  // Extraire les stats réelles
  const actualStats = stats?.stats || stats;

  if (!actualStats?.overview) {
    return (
      <MDBox textAlign="center" py={3}>
        <MDTypography variant="h6">Aucune donnée disponible</MDTypography>
      </MDBox>
    );
  }

  const {
    overview = {},
    weekly_trend = [],
    urgency_distribution = {},
    status_distribution = {},
    workload = [],
    sla_performance = {},
    personal_stats = {},
  } = actualStats;

  // Graphique hebdomadaire
  const weeklyChartData = {
    labels: weekly_trend.map((d) =>
      new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" })
    ),
    datasets: {
      label: "Plaintes",
      data: weekly_trend.map((d) => d.count),
    },
  };

  // Fonction pour obtenir la couleur de disponibilité basée sur la charge
  const getAvailabilityColor = (assignedCount) => {
    if (assignedCount === 0) return "success";
    if (assignedCount <= 2) return "info";
    if (assignedCount <= 4) return "warning";
    return "error";
  };

  const getAvailabilityLabel = (assignedCount) => {
    if (assignedCount === 0) return "Disponible";
    if (assignedCount <= 2) return "Charge légère";
    if (assignedCount <= 4) return "Charge modérée";
    return "Surchargé";
  };

  return (
    <MDBox>
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            Bonjour {user?.name || "Réception"} 👋
          </MDTypography>
          <MDTypography variant="button" color="text">
            Centre de réception - Triage et assignation
          </MDTypography>
        </MDBox>
        <MDBox display="flex" gap={1}>
          <MDButton variant="outlined" color="info" onClick={onRefresh}>
            <Icon sx={{ mr: 1 }}>refresh</Icon>
            Actualiser
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

      {/* Alerte plaintes non assignées */}
      {overview.unassigned > 0 && (
        <MDBox mb={3}>
          <Card>
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
              <MDBox flex={1}>
                <MDTypography variant="h6" color="white">
                  {overview.unassigned} plainte(s) en attente d&apos;assignation
                </MDTypography>
                <MDTypography variant="caption" color="white">
                  {urgency_distribution?.HIGH?.count || 0} urgentes nécessitent attention immédiate
                </MDTypography>
              </MDBox>
              <MDButton
                variant="contained"
                color="white"
                size="small"
                onClick={() => navigate("/complaints?status=NEW")}
              >
                Assigner
              </MDButton>
            </MDBox>
          </Card>
        </MDBox>
      )}

      {/* Alerte plaintes en retard */}
      {overview.overdue > 0 && (
        <MDBox mb={3}>
          <Card>
            <MDBox p={2} display="flex" alignItems="center" bgcolor="error.main" borderRadius="lg">
              <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                schedule
              </Icon>
              <MDTypography variant="h6" color="white">
                {overview.overdue} plainte(s) en retard
              </MDTypography>
            </MDBox>
          </Card>
        </MDBox>
      )}

      {/* Statistiques principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="primary"
            icon="inbox"
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
            color="warning"
            icon="assignment_late"
            title="Non assignées"
            count={overview.unassigned || 0}
            percentage={{
              color: urgency_distribution?.HIGH?.count > 0 ? "error" : "success",
              amount: `${urgency_distribution?.HIGH?.count || 0} urgentes`,
              label: "en attente",
            }}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="info"
            icon="assignment"
            title="Assignées"
            count={overview.assigned || 0}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="error"
            icon="schedule"
            title="En retard"
            count={overview.overdue || 0}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={3}>
        {/* Graphique hebdomadaire */}
        <Grid item xs={12} md={6} lg={4}>
          <ReportsBarChart
            color="info"
            title="Tendance hebdomadaire"
            description="7 derniers jours"
            chart={weeklyChartData}
          />
        </Grid>

        {/* Distribution par urgence */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Par urgence
              </MDTypography>
            </MDBox>
            <MDBox p={2}>
              <MDBox mb={2}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="error">
                    Haute urgence
                  </MDTypography>
                  <Chip label={urgency_distribution?.HIGH?.count || 0} color="error" size="small" />
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="warning">
                    Moyenne
                  </MDTypography>
                  <Chip
                    label={urgency_distribution?.MEDIUM?.count || 0}
                    color="warning"
                    size="small"
                  />
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="button" color="success">
                    Basse
                  </MDTypography>
                  <Chip
                    label={urgency_distribution?.LOW?.count || 0}
                    color="success"
                    size="small"
                  />
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Distribution par statut */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Par statut
              </MDTypography>
            </MDBox>
            <MDBox p={2}>
              <MDBox mb={2}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="warning">
                    À traiter
                  </MDTypography>
                  <Chip
                    label={status_distribution?.to_handle?.count || 0}
                    color="warning"
                    size="small"
                  />
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="info">
                    En cours
                  </MDTypography>
                  <Chip
                    label={status_distribution?.in_progress?.count || 0}
                    color="info"
                    size="small"
                  />
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="success">
                    Clôturées
                  </MDTypography>
                  <Chip
                    label={status_distribution?.closed?.count || 0}
                    color="success"
                    size="small"
                  />
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="button" color="text">
                    Archivées
                  </MDTypography>
                  <Chip
                    label={status_distribution?.archived?.count || 0}
                    color="default"
                    size="small"
                  />
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Charge de travail des agents */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Charge de travail des agents
              </MDTypography>
            </MDBox>
            <MDBox p={2}>
              {workload && workload.length > 0 ? (
                <List>
                  {workload.map((agent) => (
                    <ListItem
                      key={agent.agent_id}
                      sx={{
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: getAvailabilityColor(agent.assigned_count) + ".main",
                          }}
                        >
                          {agent.agent_name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={agent.agent_name} secondary={agent.agent_email} />
                      <MDBox display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={`${agent.assigned_count} assignées`}
                          color={getAvailabilityColor(agent.assigned_count)}
                          size="small"
                        />
                        {agent.overdue_count > 0 && (
                          <Chip
                            label={`${agent.overdue_count} en retard`}
                            color="error"
                            size="small"
                          />
                        )}
                        <Chip
                          label={getAvailabilityLabel(agent.assigned_count)}
                          variant="outlined"
                          size="small"
                        />
                      </MDBox>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <MDBox textAlign="center" py={3}>
                  <Icon color="disabled" fontSize="large">
                    people_outline
                  </Icon>
                  <MDTypography variant="caption" color="text" display="block" mt={1}>
                    Aucun agent disponible
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </Grid>

        {/* Performance SLA */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Performance SLA
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <MDBox textAlign="center" mb={3}>
                <MDTypography variant="h2" fontWeight="medium" color="success">
                  {sla_performance?.sla_met_percentage || 0}%
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  SLA respectés
                </MDTypography>
              </MDBox>

              <MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="text">
                    Total résolues
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium">
                    {sla_performance?.total_resolved || 0}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <MDTypography variant="button" color="success">
                    SLA respecté
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium" color="success">
                    {sla_performance?.sla_met || 0}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="button" color="error">
                    SLA manqué
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium" color="error">
                    {sla_performance?.sla_missed || 0}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default ReceptionDashboard;
