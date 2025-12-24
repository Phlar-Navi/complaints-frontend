// Page de gestion des tenants pour SUPER_ADMIN

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getTenants, toggleTenantActive, deleteTenant } from "api/tenantsService";

function TenantsManagement() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await toggleTenantActive(id);
      fetchTenants();
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le tenant "${name}" ? Cette action est irréversible !`
      )
    ) {
      try {
        await deleteTenant(id);
        fetchTenants();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const columns = [
    { Header: "Nom", accessor: "name", width: "25%", align: "left" },
    { Header: "Domaine", accessor: "domain", width: "20%", align: "left" },
    { Header: "Zone", accessor: "zone", width: "15%", align: "left" },
    { Header: "Utilisateurs", accessor: "users", width: "10%", align: "center" },
    { Header: "Plaintes", accessor: "complaints", width: "10%", align: "center" },
    { Header: "Statut", accessor: "status", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "10%", align: "center" },
  ];

  const rows = tenants.map((tenant) => ({
    name: (
      <MDBox>
        <MDTypography variant="button" fontWeight="medium">
          {tenant.name}
        </MDTypography>
        <MDTypography variant="caption" color="text" display="block">
          {tenant.schema_name}
        </MDTypography>
      </MDBox>
    ),
    domain: (
      <MDTypography variant="caption" color="text">
        {tenant.primary_domain || "-"}
      </MDTypography>
    ),
    zone: (
      <MDTypography variant="caption" color="text">
        {tenant.zone || "-"}
      </MDTypography>
    ),
    users: <Chip label={tenant.user_count || 0} color="info" size="small" />,
    complaints: <Chip label={tenant.complaint_count || 0} color="primary" size="small" />,
    status: (
      <Switch
        checked={tenant.is_active}
        onChange={() => handleToggleActive(tenant.id, tenant.is_active)}
        color="success"
      />
    ),
    actions: (
      <MDBox display="flex" gap={1}>
        <Tooltip title="Voir détails">
          <IconButton size="small" color="info" onClick={() => navigate(`/tenants/${tenant.id}`)}>
            <Icon>visibility</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Modifier">
          <IconButton
            size="small"
            color="warning"
            onClick={() => navigate(`/tenants/${tenant.id}/edit`)}
          >
            <Icon>edit</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(tenant.id, tenant.name)}
          >
            <Icon>delete</Icon>
          </IconButton>
        </Tooltip>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
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
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6" color="white">
                    Gestion des Tenants
                  </MDTypography>
                  <MDButton
                    variant="contained"
                    color="white"
                    size="small"
                    onClick={() => navigate("/tenants/create")}
                  >
                    <Icon sx={{ mr: 1 }}>add</Icon>
                    Nouveau Tenant
                  </MDButton>
                </MDBox>
              </MDBox>

              <MDBox p={3}>
                {/* Stats rapides */}
                <MDBox display="flex" gap={2} mb={3}>
                  <Chip label={`${tenants.length} tenants`} color="primary" />
                  <Chip
                    label={`${tenants.filter((t) => t.is_active).length} actifs`}
                    color="success"
                  />
                  <Chip
                    label={`${tenants.filter((t) => !t.is_active).length} inactifs`}
                    color="error"
                    variant="outlined"
                  />
                </MDBox>

                {loading ? (
                  <MDBox textAlign="center" py={3}>
                    <MDTypography variant="body2">Chargement...</MDTypography>
                  </MDBox>
                ) : tenants.length === 0 ? (
                  <MDBox textAlign="center" py={3}>
                    <Icon fontSize="large" color="disabled">
                      apartment
                    </Icon>
                    <MDTypography variant="body2" color="text" mt={1}>
                      Aucun tenant trouvé
                    </MDTypography>
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TenantsManagement;
