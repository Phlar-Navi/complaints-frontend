// CategoryManagementModal.js
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
} from "api/categoriesService";

function CategoryManagementModal({ open, onClose, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // État pour le formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // État pour les stats
  const [statsOpen, setStatsOpen] = useState(false);
  const [selectedStats, setSelectedStats] = useState(null);

  const tenantStr = localStorage.getItem("tenant");
  const getTenantFromStorage = () => {
    try {
      const tenantStr = localStorage.getItem("tenant");
      return tenantStr ? JSON.parse(tenantStr) : null;
    } catch {
      return null;
    }
  };

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError("Erreur lors du chargement des catégories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "" });
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!formData.name.trim()) {
      setError("Le nom de la catégorie est requis");
      return;
    }

    try {
      const user = getUserFromStorage();
      const tenant = getTenantFromStorage();

      let payload = { ...formData };

      // 🔐 Si ce n’est PAS un super admin → injecter tenant
      if (user?.role !== "SUPER_ADMIN") {
        if (!tenant?.id) {
          throw new Error("Tenant introuvable pour cet utilisateur");
        }
        payload.tenant = tenant.id;
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setSuccess("Catégorie mise à jour avec succès");
      } else {
        await createCategory(payload);
        setSuccess("Catégorie créée avec succès");
      }

      handleCloseForm();
      fetchCategories();
      if (onRefresh) onRefresh();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(
        err.response?.data?.tenant?.[0] ||
          err.response?.data?.detail ||
          err.message ||
          "Erreur lors de l'enregistrement"
      );
      console.error(err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      setSuccess("Catégorie supprimée avec succès");
      fetchCategories();
      if (onRefresh) onRefresh();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de la suppression");
      console.error(err);
    }
  };

  const handleShowStats = async (category) => {
    try {
      const stats = await getCategoryStats(category.id);
      setSelectedStats({ ...category, stats });
      setStatsOpen(true);
    } catch (err) {
      setError("Erreur lors du chargement des statistiques");
      console.error(err);
    }
  };

  return (
    <>
      {/* Modale principale */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h5">Gestion des Catégories</MDTypography>
            <IconButton onClick={onClose} size="small">
              <Icon>close</Icon>
            </IconButton>
          </MDBox>
        </DialogTitle>

        <DialogContent dividers>
          {/* Messages de feedback */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Bouton d'ajout */}
          <MDBox mb={2}>
            <MDButton variant="gradient" color="success" onClick={() => handleOpenForm()}>
              <Icon sx={{ mr: 1 }}>add</Icon>
              Nouvelle Catégorie
            </MDButton>
          </MDBox>

          {/* Tableau des catégories */}
          {loading ? (
            <MDBox textAlign="center" py={3}>
              <CircularProgress />
            </MDBox>
          ) : categories.length === 0 ? (
            <MDBox textAlign="center" py={3}>
              <MDTypography variant="body2" color="text">
                Aucune catégorie trouvée
              </MDTypography>
            </MDBox>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Nom</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Description</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Sous-catégories</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Plaintes</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <MDTypography variant="button" fontWeight="medium">
                          {category.name}
                        </MDTypography>
                      </TableCell>
                      <TableCell>
                        <MDTypography variant="caption" color="text">
                          {category.description || "-"}
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={category.subcategory_count || 0} size="small" color="info" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={category.complaint_count || 0} size="small" color="warning" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Statistiques">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleShowStats(category)}
                          >
                            <Icon fontSize="small">bar_chart</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenForm(category)}
                          >
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions>
          <MDButton onClick={onClose} color="secondary">
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Modale de formulaire (Créer/Modifier) */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </DialogTitle>
        <DialogContent dividers>
          <MDBox component="form" p={2}>
            <TextField
              fullWidth
              label="Nom de la catégorie *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseForm} color="secondary">
            Annuler
          </MDButton>
          <MDButton onClick={handleSubmit} color="success" variant="gradient">
            {editingCategory ? "Mettre à jour" : "Créer"}
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Modale des statistiques */}
      <Dialog open={statsOpen} onClose={() => setStatsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Statistiques - {selectedStats?.name}</DialogTitle>
        <DialogContent dividers>
          {selectedStats?.stats && (
            <MDBox p={2}>
              <MDTypography variant="h6" gutterBottom>
                Total des plaintes: {selectedStats.stats.total_complaints}
              </MDTypography>

              {selectedStats.stats.by_status &&
                Object.keys(selectedStats.stats.by_status).length > 0 && (
                  <MDBox mt={2}>
                    <MDTypography variant="subtitle2" gutterBottom>
                      Par statut:
                    </MDTypography>
                    {Object.entries(selectedStats.stats.by_status).map(([status, count]) => (
                      <MDBox key={status} display="flex" justifyContent="space-between" mb={1}>
                        <MDTypography variant="button">{status}</MDTypography>
                        <Chip label={count} size="small" />
                      </MDBox>
                    ))}
                  </MDBox>
                )}

              {selectedStats.stats.by_urgency &&
                Object.keys(selectedStats.stats.by_urgency).length > 0 && (
                  <MDBox mt={2}>
                    <MDTypography variant="subtitle2" gutterBottom>
                      Par urgence:
                    </MDTypography>
                    {Object.entries(selectedStats.stats.by_urgency).map(([urgency, count]) => (
                      <MDBox key={urgency} display="flex" justifyContent="space-between" mb={1}>
                        <MDTypography variant="button">{urgency}</MDTypography>
                        <Chip label={count} size="small" color="warning" />
                      </MDBox>
                    ))}
                  </MDBox>
                )}
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setStatsOpen(false)} color="secondary">
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

CategoryManagementModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
};

export default CategoryManagementModal;
