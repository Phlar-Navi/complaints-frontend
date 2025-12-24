// Dashboard pour SUPER_ADMIN

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { useState, useEffect } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable";

import { getGlobalStats } from "api/tenantsService";
import PropTypes from "prop-types";

SuperAdminDashboard.propTypes = {
  onRefresh: PropTypes.func,
};

function SuperAdminDashboard({ onRefresh }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <MDBox textAlign="center" py={3}>
        <MDTypography variant="h6">Chargement des statistiques...</MDTypography>
      </MDBox>
    );
  }

  const { tenants, users, complaints, top_tenants } = stats;

  // Colonnes pour le tableau des top tenants
  const columns = [
    { Header: "Tenant", accessor: "name", width: "50%", align: "left" },
    { Header: "Plaintes", accessor: "complaints", width: "25%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "25%", align: "center" },
  ];

  const rows = (top_tenants || []).map((tenant) => ({
    name: (
      <MDTypography variant="button" fontWeight="medium">
        {tenant.tenant_name}
      </MDTypography>
    ),
    complaints: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {tenant.complaint_count}
      </MDTypography>
    ),
    actions: (
      <MDTypography
        component="a"
        href={`/tenants/${tenant.tenant_id}`}
        variant="caption"
        color="info"
        fontWeight="medium"
        sx={{ cursor: "pointer" }}
      >
        Voir détails
      </MDTypography>
    ),
  }));

  return (
    <MDBox>
      {/* Statistiques principales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="dark"
              icon="apartment"
              title="Total Tenants"
              count={tenants.total}
              percentage={{
                color: tenants.new_this_month > 0 ? "success" : "secondary",
                amount: `+${tenants.new_this_month}`,
                label: "ce mois-ci",
              }}
            />
          </MDBox>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="success"
              icon="check_circle"
              title="Tenants Actifs"
              count={tenants.active}
              percentage={{
                color: tenants.active > tenants.inactive ? "success" : "error",
                amount: `${tenants.inactive} inactifs`,
                label: "",
              }}
            />
          </MDBox>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="primary"
              icon="people"
              title="Total Utilisateurs"
              count={users.total}
              percentage={{
                color: "info",
                amount: `${Math.round(users.total / tenants.total)} /tenant`,
                label: "moyenne",
              }}
            />
          </MDBox>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <MDBox mb={1.5}>
            <ComplexStatisticsCard
              color="warning"
              icon="assignment"
              title="Total Plaintes"
              count={complaints.total}
              percentage={{
                color: "success",
                amount: `${complaints.this_month}`,
                label: "ce mois-ci",
              }}
            />
          </MDBox>
        </Grid>
      </Grid>

      {/* Statistiques détaillées */}
      <Grid container spacing={3} mt={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                Répartition des Tenants
              </MDTypography>
              <MDBox mt={2}>
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="button" color="text">
                    Actifs
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium" color="success">
                    {tenants.active}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="button" color="text">
                    Inactifs
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium" color="error">
                    {tenants.inactive}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={1}>
                  <MDTypography variant="button" color="text">
                    Premium
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium" color="warning">
                    {tenants.premium}
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between">
                  <MDTypography variant="button" color="text">
                    Nouveaux ce mois
                  </MDTypography>
                  <MDTypography variant="button" fontWeight="medium" color="info">
                    {tenants.new_this_month}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                Activité Globale
              </MDTypography>
              <MDBox mt={2}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon color="primary" sx={{ mr: 2 }}>
                    assignment
                  </Icon>
                  <MDBox>
                    <MDTypography variant="button" color="text">
                      Plaintes totales
                    </MDTypography>
                    <MDTypography variant="h5" fontWeight="medium">
                      {complaints.total}
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon color="success" sx={{ mr: 2 }}>
                    trending_up
                  </Icon>
                  <MDBox>
                    <MDTypography variant="button" color="text">
                      Ce mois-ci
                    </MDTypography>
                    <MDTypography variant="h5" fontWeight="medium" color="success">
                      {complaints.this_month}
                    </MDTypography>
                  </MDBox>
                </MDBox>
                <MDBox display="flex" alignItems="center">
                  <Icon color="info" sx={{ mr: 2 }}>
                    bar_chart
                  </Icon>
                  <MDBox>
                    <MDTypography variant="button" color="text">
                      Moyenne par tenant
                    </MDTypography>
                    <MDTypography variant="h5" fontWeight="medium">
                      {Math.round(complaints.total / tenants.total)}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      {/* Top Tenants */}
      {top_tenants && top_tenants.length > 0 && (
        <Grid container spacing={3} mt={2}>
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
                  Top 5 Tenants - Plaintes
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <DataTable
                  table={{ columns, rows }}
                  showTotalEntries={false}
                  isSorted={false}
                  noEndBorder
                  entriesPerPage={false}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      )}
    </MDBox>
  );
}

export default SuperAdminDashboard;
