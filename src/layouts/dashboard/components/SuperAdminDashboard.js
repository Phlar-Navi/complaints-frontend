// SuperAdmin Dashboard - Vue plateforme globale
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

SuperAdminDashboard.propTypes = {
  stats: PropTypes.shape({
    platform_overview: PropTypes.shape({
      total_tenants: PropTypes.number,
      total_complaints: PropTypes.number,
      total_active_complaints: PropTypes.number,
      global_sla_compliance: PropTypes.number,
    }),

    tenant_stats: PropTypes.arrayOf(
      PropTypes.shape({
        tenant_name: PropTypes.string,
        total_complaints: PropTypes.number,
        active_complaints: PropTypes.number,
        sla_compliance_rate: PropTypes.number,
        overdue: PropTypes.number,
        is_premium: PropTypes.bool,
      })
    ),

    monthly_volume: PropTypes.array, // (pas utilisé ici mais présent)

    alerts: PropTypes.arrayOf(
      PropTypes.shape({
        message: PropTypes.string,
      })
    ),
  }),

  onRefresh: PropTypes.func,
};

function SuperAdminDashboard({ stats, onRefresh }) {
  const navigate = useNavigate();

  if (!stats?.platform_overview) {
    return (
      <MDBox textAlign="center" py={3}>
        <MDTypography variant="h6">Aucune donnée disponible</MDTypography>
      </MDBox>
    );
  }

  const { platform_overview, tenant_stats, monthly_volume, alerts } = stats;

  // Colonnes pour le tableau des tenants
  const tenantColumns = [
    { Header: "tenant", accessor: "tenant", width: "30%", align: "left" },
    { Header: "plaintes", accessor: "complaints", width: "15%", align: "center" },
    { Header: "actives", accessor: "active", width: "15%", align: "center" },
    { Header: "sla (%)", accessor: "sla", width: "15%", align: "center" },
    { Header: "retard", accessor: "overdue", width: "15%", align: "center" },
    { Header: "type", accessor: "type", width: "10%", align: "center" },
  ];

  const tenantRows = tenant_stats.map((tenant) => ({
    tenant: (
      <MDTypography variant="button" fontWeight="medium">
        {tenant.tenant_name}
      </MDTypography>
    ),
    complaints: (
      <MDTypography variant="caption" color="text">
        {tenant.total_complaints}
      </MDTypography>
    ),
    active: (
      <MDTypography variant="caption" color="text">
        {tenant.active_complaints}
      </MDTypography>
    ),
    sla: (
      <MDTypography
        variant="caption"
        color={tenant.sla_compliance_rate >= 70 ? "success" : "error"}
        fontWeight="medium"
      >
        {tenant.sla_compliance_rate}%
      </MDTypography>
    ),
    overdue: (
      <MDTypography
        variant="caption"
        color={tenant.overdue > 0 ? "error" : "text"}
        fontWeight={tenant.overdue > 0 ? "medium" : "regular"}
      >
        {tenant.overdue}
      </MDTypography>
    ),
    type: (
      <Icon color={tenant.is_premium ? "warning" : "secondary"}>
        {tenant.is_premium ? "workspace_premium" : "business"}
      </Icon>
    ),
  }));

  return (
    <MDBox>
      {/* Header avec actions */}
      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <MDBox>
          <MDTypography variant="h4" fontWeight="medium">
            Vue Plateforme Globale
          </MDTypography>
          <MDTypography variant="button" color="text">
            Supervision multi-tenants
          </MDTypography>
        </MDBox>
        <MDBox display="flex" gap={1}>
          <MDButton variant="outlined" color="info" onClick={onRefresh}>
            <Icon sx={{ mr: 1 }}>refresh</Icon>
            Actualiser
          </MDButton>
          <MDButton variant="gradient" color="success" onClick={() => navigate("/tenants/create")}>
            <Icon sx={{ mr: 1 }}>add</Icon>
            Nouveau tenant
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Alertes critiques */}
      {alerts && alerts.length > 0 && (
        <MDBox mb={3}>
          <Card>
            <MDBox p={2} display="flex" alignItems="center" bgcolor="error.main" borderRadius="lg">
              <Icon fontSize="large" sx={{ color: "white", mr: 2 }}>
                warning
              </Icon>
              <MDBox>
                <MDTypography variant="h6" color="white">
                  {alerts.length} alerte(s) nécessitant attention
                </MDTypography>
                <MDTypography variant="caption" color="white">
                  {alerts[0]?.message}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      )}

      {/* Statistiques principales */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="primary"
            icon="business"
            title="Tenants actifs"
            count={platform_overview.total_tenants}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="info"
            icon="receipt_long"
            title="Total plaintes"
            count={platform_overview.total_complaints}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="warning"
            icon="pending_actions"
            title="Plaintes actives"
            count={platform_overview.total_active_complaints}
          />
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ComplexStatisticsCard
            color="success"
            icon="verified"
            title="SLA Global"
            count={`${platform_overview.global_sla_compliance}%`}
            percentage={{
              color: platform_overview.global_sla_compliance >= 70 ? "success" : "error",
              amount:
                platform_overview.global_sla_compliance >= 70 ? "Excellent" : "Attention requise",
              label: "conformité",
            }}
          />
        </Grid>
      </Grid>

      {/* Tableau des tenants */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              coloredShadow="info"
            >
              <MDTypography variant="h6" color="white">
                Performance par Tenant
              </MDTypography>
            </MDBox>
            <MDBox pt={3}>
              <DataTable
                table={{ columns: tenantColumns, rows: tenantRows }}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </MDBox>
  );
}

export default SuperAdminDashboard;
