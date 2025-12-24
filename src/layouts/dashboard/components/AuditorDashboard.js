// =================================================================
// AuditorDashboard.js - Vue contrôle et audit
// =================================================================
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

AuditorDashboard.propTypes = {
  stats: PropTypes.shape({
    overview: PropTypes.shape({
      overdue: PropTypes.number,
      unassigned: PropTypes.number,
    }),
    personal_stats: PropTypes.shape({
      active_complaints: PropTypes.number,
      avg_resolution_time_hours: PropTypes.number,
    }),
    sla_performance: PropTypes.object,
    agent_performance: PropTypes.object,
  }),

  onRefresh: PropTypes.func,
};

export function AuditorDashboard({ stats, onRefresh }) {
  const navigate = useNavigate();

  if (!stats?.overview || !stats?.sla_performance) return null;

  const { overview, sla_performance, personal_stats } = stats;

  const userData = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  return (
    <MDBox>
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            Bonjour {userData?.first_name || "Auditeur"}
          </MDTypography>
          <MDTypography variant="button" color="text">
            Catégorie : Auditeur
          </MDTypography>
        </MDBox>
        <MDButton variant="outlined" color="info" onClick={onRefresh}>
          <Icon sx={{ mr: 1 }}>refresh</Icon>
          Actualiser
        </MDButton>
      </MDBox>

      {/* Indicateurs */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="success"
            icon="verified"
            title="Conformité SLA"
            count={`${sla_performance.sla_met_percentage ?? 0}%`}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="error"
            icon="schedule"
            title="Hors délai"
            count={overview.overdue}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="warning"
            icon="assignment_late"
            title="Non assignées"
            count={overview.unassigned}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="info"
            icon="forum"
            title="Plaintes actives"
            count={personal_stats?.active_complaints ?? 0}
          />
        </Grid>
      </Grid>

      {/* Analyse qualité */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Temps moyen de résolution
              </MDTypography>
            </MDBox>
            <MDBox p={3} textAlign="center">
              <MDTypography variant="h2" color="info">
                {personal_stats?.avg_resolution_time_hours
                  ? `${personal_stats.avg_resolution_time_hours}h`
                  : "N/A"}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default AuditorDashboard;
