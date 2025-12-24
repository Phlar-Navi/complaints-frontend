// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// API
import {
  getComplaints,
  deleteComplaint,
  exportToCSV,
  assignComplaint,
  STATUS_LABELS,
  URGENCY_LABELS,
  calculateSLARemaining,
} from "api/complaintsService";
import { listUsers } from "api/userService";

// Auth context
import { useAuth } from "context/authContext";

function ComplaintsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userData, setUserData] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    urgency: "all",
    ordering: "-submitted_at",
  });
  const [menu, setMenu] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // États pour le dialogue d'assignation
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();

    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    setUserData(user);
  }, [filters]);

  useEffect(() => {
    if (assignDialogOpen) {
      fetchAgents();
    }
  }, [assignDialogOpen]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getComplaints(filters);
      setComplaints(data);
    } catch (error) {
      console.error("Erreur lors du chargement des plaintes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const users = await listUsers();
      const agentsList = users.filter((u) => ["AGENT", "TENANT_ADMIN"].includes(u.role));
      setAgents(agentsList);
    } catch (error) {
      console.error("Erreur lors du chargement des agents:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette plainte ?")) {
      try {
        await deleteComplaint(id);
        fetchComplaints();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleExport = () => {
    exportToCSV(complaints);
  };

  const openMenu = (event, complaint) => {
    setMenu(event.currentTarget);
    setSelectedComplaint(complaint);
  };

  const closeMenu = () => {
    setMenu(null);
    setSelectedComplaint(null);
  };

  // Ouvrir le dialogue d'assignation
  const openAssignDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedAgent(complaint.assigned_user || "");
    setAssignDialogOpen(true);
    closeMenu();
  };

  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setSelectedAgent("");
    setSelectedComplaint(null);
  };

  // Assigner la plainte
  const handleAssign = async () => {
    if (!selectedAgent || !selectedComplaint) return;

    try {
      setAssignLoading(true);
      await assignComplaint(selectedComplaint.id, selectedAgent);
      closeAssignDialog();
      fetchComplaints(); // Rafraîchir la liste
    } catch (error) {
      alert("Erreur lors de l'assignation");
      console.error(error);
    } finally {
      setAssignLoading(false);
    }
  };

  // Vérifier si l'utilisateur peut assigner
  const canAssign = () => {
    const allowedRoles = ["RECEPTION", "TENANT_ADMIN"];
    return allowedRoles.includes(userData?.role);
  };

  // Fonction pour obtenir la couleur du badge
  const getUrgencyColor = (urgency) => {
    const colors = { HIGH: "error", MEDIUM: "warning", LOW: "success" };
    return colors[urgency] || "default";
  };

  const getStatusColor = (status) => {
    const colors = {
      NEW: "info",
      RECEIVED: "primary",
      ASSIGNED: "secondary",
      IN_PROGRESS: "warning",
      RESOLVED: "success",
      CLOSED: "default",
    };
    return colors[status] || "default";
  };

  // Colonnes du tableau
  const columns = [
    { Header: "référence", accessor: "reference", width: "12%", align: "left" },
    { Header: "titre", accessor: "title", width: "25%", align: "left" },
    { Header: "urgence", accessor: "urgency", width: "10%", align: "center" },
    { Header: "statut", accessor: "status", width: "12%", align: "center" },
    { Header: "assigné à", accessor: "assigned", width: "15%", align: "left" },
    { Header: "SLA", accessor: "sla", width: "13%", align: "center" },
    { Header: "date", accessor: "date", width: "10%", align: "center" },
    { Header: "actions", accessor: "actions", width: "8%", align: "center" },
  ];

  // Transformer les données pour le tableau
  const rows = complaints.map((complaint) => {
    const slaInfo = calculateSLARemaining(complaint.sla_deadline);

    return {
      reference: (
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="medium"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/complaints/${complaint.id}`)}
        >
          {complaint.reference}
        </MDTypography>
      ),
      title: (
        <MDBox display="flex" alignItems="center">
          {complaint.is_urgent_unhandled && (
            <Tooltip title="Urgente non traitée">
              <Icon fontSize="small" color="error" sx={{ mr: 1 }}>
                priority_high
              </Icon>
            </Tooltip>
          )}
          <MDTypography
            variant="button"
            fontWeight="regular"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "250px",
            }}
          >
            {complaint.title}
          </MDTypography>
        </MDBox>
      ),
      urgency: (
        <Chip
          label={URGENCY_LABELS[complaint.urgency]}
          color={getUrgencyColor(complaint.urgency)}
          size="small"
        />
      ),
      status: (
        <Chip
          label={STATUS_LABELS[complaint.status]}
          color={getStatusColor(complaint.status)}
          size="small"
          variant="outlined"
        />
      ),
      assigned: (
        <MDTypography variant="caption" color="text" fontWeight="regular">
          {complaint.assigned_user_name || "Non assignée"}
        </MDTypography>
      ),
      sla: (
        <MDBox>
          <Chip
            label={slaInfo.label}
            color={slaInfo.isOverdue ? "error" : "success"}
            size="small"
            icon={<Icon>{slaInfo.isOverdue ? "schedule" : "check_circle"}</Icon>}
          />
        </MDBox>
      ),
      date: (
        <MDTypography variant="caption" color="text" fontWeight="regular">
          {new Date(complaint.submitted_at).toLocaleDateString("fr-FR")}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex" gap={0.5}>
          {/* Bouton Voir détails */}
          <Tooltip title="Voir détails">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/complaints/${complaint.id}`)}
            >
              <Icon>visibility</Icon>
            </IconButton>
          </Tooltip>

          {/* Bouton Assigner (seulement pour RECEPTION et TENANT_ADMIN) */}
          {canAssign() && (
            <Tooltip title={complaint.assigned_user_name ? "Réassigner" : "Assigner"}>
              <IconButton size="small" color="warning" onClick={() => openAssignDialog(complaint)}>
                <Icon>person_add</Icon>
              </IconButton>
            </Tooltip>
          )}

          {/* Menu contextuel (autres actions) */}
          {/* <Tooltip title="Plus d'actions">
            <IconButton size="small" onClick={(e) => openMenu(e, complaint)}>
              <Icon>more_vert</Icon>
            </IconButton>
          </Tooltip> */}
        </MDBox>
      ),
    };
  });

  // Menu contextuel simplifié
  const renderMenu = (
    <Menu
      anchorEl={menu}
      open={Boolean(menu)}
      onClose={closeMenu}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {/* Supprimer (seulement SUPER_ADMIN et TENANT_ADMIN) */}
      {(userData?.role === "SUPER_ADMIN" || userData?.role === "TENANT_ADMIN") && (
        <MenuItem
          onClick={() => {
            handleDelete(selectedComplaint?.id);
            closeMenu();
          }}
          sx={{ color: "error.main" }}
        >
          <Icon sx={{ mr: 1 }}>delete</Icon>
          Supprimer
        </MenuItem>
      )}

      {/* Si aucune action disponible */}
      {userData?.role !== "SUPER_ADMIN" && userData?.role !== "TENANT_ADMIN" && (
        <MenuItem disabled>
          <MDTypography variant="caption" color="text">
            Aucune action disponible
          </MDTypography>
        </MenuItem>
      )}
    </Menu>
  );

  // Dialogue d'assignation
  const renderAssignDialog = (
    <Dialog open={assignDialogOpen} onClose={closeAssignDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        {selectedComplaint?.assigned_user_name ? "Réassigner" : "Assigner"} la plainte
      </DialogTitle>
      <DialogContent>
        <MDBox mt={2}>
          {/* Info de la plainte */}
          <MDBox mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
            <MDTypography variant="button" fontWeight="medium">
              {selectedComplaint?.reference}
            </MDTypography>
            <MDTypography variant="caption" color="text" display="block">
              {selectedComplaint?.title}
            </MDTypography>
            {selectedComplaint?.assigned_user_name && (
              <MDTypography variant="caption" color="warning" display="block" mt={1}>
                Actuellement assignée à : {selectedComplaint.assigned_user_name}
              </MDTypography>
            )}
          </MDBox>

          {/* Sélection de l'agent */}
          <FormControl fullWidth>
            <InputLabel>Sélectionner un agent</InputLabel>
            <Select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              label="Sélectionner un agent"
            >
              {agents.length === 0 ? (
                <MenuItem disabled>Aucun agent disponible</MenuItem>
              ) : (
                agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    <MDBox>
                      <MDTypography variant="button">{agent.full_name}</MDTypography>
                      <MDTypography variant="caption" color="text" display="block">
                        {agent.email}
                      </MDTypography>
                    </MDBox>
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </MDBox>
      </DialogContent>
      <DialogActions>
        <MDButton onClick={closeAssignDialog} color="secondary">
          Annuler
        </MDButton>
        <MDButton onClick={handleAssign} color="info" disabled={!selectedAgent || assignLoading}>
          {assignLoading ? "Assignation..." : "Assigner"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              {/* Header */}
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
                    Gestion des plaintes
                  </MDTypography>
                  <MDBox display="flex" gap={1}>
                    <MDButton variant="contained" color="white" size="small" onClick={handleExport}>
                      <Icon sx={{ mr: 1 }}>download</Icon>
                      Exporter
                    </MDButton>
                    {(userData?.role === "RECEPTION" || userData?.role === "TENANT_ADMIN") && (
                      <MDButton
                        variant="contained"
                        color="white"
                        size="small"
                        onClick={() => navigate("/complaints/create")}
                      >
                        <Icon sx={{ mr: 1 }}>add</Icon>
                        Nouvelle plainte
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
              </MDBox>

              {/* Filtres */}
              <MDBox p={3}>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} md={4}>
                    <MDInput
                      fullWidth
                      label="Rechercher..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      InputProps={{
                        endAdornment: <Icon>search</Icon>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Statut</InputLabel>
                      <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        label="Statut"
                      >
                        <MenuItem value="all">Tous</MenuItem>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Urgence</InputLabel>
                      <Select
                        value={filters.urgency}
                        onChange={(e) => handleFilterChange("urgency", e.target.value)}
                        label="Urgence"
                      >
                        <MenuItem value="all">Toutes</MenuItem>
                        {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                          <MenuItem key={key} value={key}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Trier par</InputLabel>
                      <Select
                        value={filters.ordering}
                        onChange={(e) => handleFilterChange("ordering", e.target.value)}
                        label="Trier par"
                      >
                        <MenuItem value="-submitted_at">Plus récentes</MenuItem>
                        <MenuItem value="submitted_at">Plus anciennes</MenuItem>
                        <MenuItem value="-urgency">Urgence (décroissante)</MenuItem>
                        <MenuItem value="urgency">Urgence (croissante)</MenuItem>
                        <MenuItem value="sla_deadline">SLA (proche)</MenuItem>
                        <MenuItem value="-sla_deadline">SLA (lointain)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <MDButton
                      fullWidth
                      variant="outlined"
                      color="info"
                      onClick={fetchComplaints}
                      sx={{ height: "100%" }}
                    >
                      <Icon>refresh</Icon>
                    </MDButton>
                  </Grid>
                </Grid>

                {/* Stats rapides */}
                <MDBox display="flex" gap={2} mb={2} flexWrap="wrap">
                  <Chip label={`${complaints.length} plaintes`} color="primary" />
                  <Chip
                    label={`${complaints.filter((c) => c.is_urgent_unhandled).length} urgentes`}
                    color="error"
                  />
                  <Chip
                    label={`${
                      complaints.filter((c) => !c.assigned_user_name).length
                    } non assignées`}
                    color="warning"
                  />
                  <Chip
                    label={`${complaints.filter((c) => c.is_overdue).length} en retard`}
                    color="error"
                    variant="outlined"
                  />
                </MDBox>

                {/* Tableau */}
                {loading ? (
                  <MDBox textAlign="center" py={3}>
                    <MDTypography variant="body2" color="text">
                      Chargement...
                    </MDTypography>
                  </MDBox>
                ) : complaints.length === 0 ? (
                  <MDBox textAlign="center" py={3}>
                    <Icon fontSize="large" color="disabled">
                      inbox
                    </Icon>
                    <MDTypography variant="body2" color="text" mt={1}>
                      Aucune plainte trouvée
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
      {renderMenu}
      {renderAssignDialog}
    </DashboardLayout>
  );
}

export default ComplaintsList;
