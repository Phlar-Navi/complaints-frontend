// Page de gestion des tenants pour SUPER_ADMIN

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Alert from "@mui/material/Alert";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getTenants, createTenant, toggleTenantActive, deleteTenant } from "api/tenantsService";

function TenantsManagement() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // État de la modale
  const [openModal, setOpenModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    schema_name: "",
    domain_subdomain: "", // Nouveau : juste le sous-domaine
    zone: "",
    contact_info: "",
    is_premium: false,
    admin_email: "",
    admin_password: "",
    admin_password_confirm: "",
    admin_first_name: "",
    admin_last_name: "",
  });

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

  const handleOpenModal = () => {
    setOpenModal(true);
    setError(null);
    setFormData({
      name: "",
      schema_name: "",
      domain_subdomain: "",
      zone: "",
      contact_info: "",
      is_premium: false,
      admin_email: "",
      admin_password: "",
      admin_password_confirm: "",
      admin_first_name: "",
      admin_last_name: "",
    });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-générer schema_name et domain_subdomain basés sur le nom
    if (name === "name" && value) {
      // Pour le schema_name : underscores (format PostgreSQL)
      const schemaName = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "");

      // Pour le sous-domaine : tirets (format URL)
      const subdomain = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Retirer les accents
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      setFormData((prev) => ({
        ...prev,
        schema_name: schemaName,
        domain_subdomain: subdomain,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation côté client
    if (formData.admin_password !== formData.admin_password_confirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.admin_password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!formData.domain_subdomain) {
      setError("Le sous-domaine est requis");
      return;
    }

    try {
      setCreating(true);

      // Construire le domaine complet
      const payload = {
        ...formData,
        domain_url: `${formData.domain_subdomain}.complaints.kidjamo.app`,
      };

      // Retirer le champ temporaire
      delete payload.domain_subdomain;

      await createTenant(payload);

      // Fermer la modale et rafraîchir la liste
      handleCloseModal();
      fetchTenants();

      alert(`Tenant créé avec succès !\nDomaine: ${payload.domain_url}`);
    } catch (err) {
      console.error("Erreur création tenant:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "Erreur lors de la création du tenant"
      );
    } finally {
      setCreating(false);
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
                    onClick={handleOpenModal}
                  >
                    <Icon sx={{ mr: 1 }}>add</Icon>
                    Nouveau Tenant
                  </MDButton>
                </MDBox>
              </MDBox>

              <MDBox p={3}>
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

      {/* Modale de création */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <MDBox display="flex" alignItems="center" gap={1}>
            <Icon color="info">apartment</Icon>
            <MDTypography variant="h5">Créer un nouveau tenant</MDTypography>
          </MDBox>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              {/* Section Tenant */}
              <Grid item xs={12}>
                <MDTypography variant="h6" color="info" mb={1}>
                  Informations du Tenant
                </MDTypography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom du tenant"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Commissariat Central"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Schema Name"
                  name="schema_name"
                  value={formData.schema_name}
                  onChange={handleInputChange}
                  placeholder="Ex: commissariat_central"
                  helperText="Lettres minuscules, chiffres et underscores uniquement"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  placeholder="Ex: Douala, Yaoundé"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Sous-domaine"
                  name="domain_subdomain"
                  value={formData.domain_subdomain}
                  onChange={handleInputChange}
                  placeholder="Ex: commissariat-central"
                  helperText="Sera accessible sur : [sous-domaine].complaints.kidjamo.app"
                  InputProps={{
                    endAdornment: (
                      <MDTypography variant="caption" color="text">
                        .complaints.kidjamo.app
                      </MDTypography>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Informations de contact"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  placeholder="Adresse, téléphone, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_premium}
                      onChange={handleInputChange}
                      name="is_premium"
                      color="warning"
                    />
                  }
                  label="Compte Premium"
                />
              </Grid>

              {/* Section Admin */}
              <Grid item xs={12} mt={2}>
                <MDTypography variant="h6" color="info" mb={1}>
                  Administrateur du Tenant
                </MDTypography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Prénom"
                  name="admin_first_name"
                  value={formData.admin_first_name}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom"
                  name="admin_last_name"
                  value={formData.admin_last_name}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email"
                  name="admin_email"
                  value={formData.admin_email}
                  onChange={handleInputChange}
                  placeholder="admin@example.com"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Mot de passe"
                  name="admin_password"
                  value={formData.admin_password}
                  onChange={handleInputChange}
                  helperText="Minimum 8 caractères"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  type="password"
                  label="Confirmer le mot de passe"
                  name="admin_password_confirm"
                  value={formData.admin_password_confirm}
                  onChange={handleInputChange}
                  error={
                    formData.admin_password_confirm &&
                    formData.admin_password !== formData.admin_password_confirm
                  }
                  helperText={
                    formData.admin_password_confirm &&
                    formData.admin_password !== formData.admin_password_confirm
                      ? "Les mots de passe ne correspondent pas"
                      : ""
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <MDButton onClick={handleCloseModal} color="secondary" disabled={creating}>
              Annuler
            </MDButton>
            <MDButton type="submit" color="info" disabled={creating}>
              {creating ? "Création..." : "Créer le tenant"}
            </MDButton>
          </DialogActions>
        </form>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default TenantsManagement;
