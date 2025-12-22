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
    compliance_indicators: PropTypes.shape({
      sla_compliance_rate: PropTypes.number,
      overdue_complaints: PropTypes.number,
      unassigned_complaints: PropTypes.number,
      complaints_without_activity: PropTypes.number,
    }),

    quality_analysis: PropTypes.shape({
      resolution_time_distribution: PropTypes.shape({
        min: PropTypes.number,
        average: PropTypes.number,
        max: PropTypes.number,
      }),
    }),

    audit_trail: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        complaint_reference: PropTypes.string,
        action: PropTypes.string,
        user: PropTypes.string,
        timestamp: PropTypes.string,
      })
    ),

    sla_performance: PropTypes.object,
    agent_performance: PropTypes.object,
  }),

  onRefresh: PropTypes.func,
};

export function AuditorDashboard({ stats, onRefresh }) {
  const navigate = useNavigate();

  if (!stats?.compliance_indicators) return null;

  const {
    compliance_indicators,
    quality_analysis,
    audit_trail,
    sla_performance,
    agent_performance,
  } = stats;

  return (
    <MDBox>
      {/* Header */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            Audit et Conformité
          </MDTypography>
          <MDTypography variant="button" color="text">
            Surveillance qualité et conformité
          </MDTypography>
        </MDBox>
        <MDButton variant="outlined" color="info" onClick={onRefresh}>
          <Icon sx={{ mr: 1 }}>refresh</Icon>
          Actualiser
        </MDButton>
      </MDBox>

      {/* Indicateurs de conformité */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="success"
            icon="verified"
            title="Conformité SLA"
            count={`${compliance_indicators.sla_compliance_rate}%`}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="error"
            icon="schedule"
            title="Hors délai"
            count={compliance_indicators.overdue_complaints}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="warning"
            icon="assignment_late"
            title="Non assignées"
            count={compliance_indicators.unassigned_complaints}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="info"
            icon="forum"
            title="Sans activité"
            count={compliance_indicators.complaints_without_activity}
          />
        </Grid>
      </Grid>

      {/* Analyse qualité et audit trail */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Distribution temps de résolution
              </MDTypography>
            </MDBox>
            <MDBox p={3}>
              <Grid container spacing={2}>
                <Grid item xs={4} textAlign="center">
                  <MDTypography variant="h4" color="success">
                    {quality_analysis.resolution_time_distribution.min || "N/A"}h
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Minimum
                  </MDTypography>
                </Grid>
                <Grid item xs={4} textAlign="center">
                  <MDTypography variant="h4" color="info">
                    {quality_analysis.resolution_time_distribution.average || "N/A"}h
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Moyenne
                  </MDTypography>
                </Grid>
                <Grid item xs={4} textAlign="center">
                  <MDTypography variant="h4" color="warning">
                    {quality_analysis.resolution_time_distribution.max || "N/A"}h
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Maximum
                  </MDTypography>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <MDBox pt={3} px={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Audit Trail (Récent)
              </MDTypography>
            </MDBox>
            <MDBox p={2} sx={{ maxHeight: 300, overflowY: "auto" }}>
              {audit_trail && audit_trail.length > 0 ? (
                audit_trail.map((entry) => (
                  <MDBox
                    key={entry.id}
                    p={1}
                    mb={1}
                    sx={{ borderLeft: "3px solid", borderColor: "info.main" }}
                  >
                    <MDTypography variant="caption" fontWeight="medium">
                      {entry.complaint_reference} - {entry.action}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      {entry.user} - {new Date(entry.timestamp).toLocaleString("fr-FR")}
                    </MDTypography>
                  </MDBox>
                ))
              ) : (
                <MDTypography variant="caption" color="text" textAlign="center">
                  Aucune activité récente
                </MDTypography>
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default AuditorDashboard;
