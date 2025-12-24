// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// React
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// API
import {
  getComplaint,
  getComplaintHistory,
  STATUS_LABELS,
  URGENCY_LABELS,
  formatDate,
  calculateSLARemaining,
} from "api/complaintsService";

// Composants
import ComplaintComments from "./components/ComplaintComments";
import { ComplaintAssignment } from "./components";
import { ComplaintAttachments } from "./components/ComplaintAttachments";
import { ComplaintStatusUpdate } from "./components/ComplaintStatusUpdate";

import PropTypes from "prop-types";

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchComplaintData();
  }, [id]);

  const fetchComplaintData = async () => {
    try {
      setLoading(true);
      const [complaintData, historyData] = await Promise.all([
        getComplaint(id),
        getComplaintHistory(id),
      ]);
      setComplaint(complaintData);
      setHistory(historyData);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      alert("Erreur lors du chargement de la plainte");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDBox textAlign="center">
            <MDTypography variant="h6">Chargement...</MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDBox textAlign="center">
            <Icon fontSize="large" color="error">
              error_outline
            </Icon>
            <MDTypography variant="h6" mt={2}>
              Plainte introuvable
            </MDTypography>
            <MDButton color="info" onClick={() => navigate("/complaints")} sx={{ mt: 2 }}>
              Retour à la liste
            </MDButton>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  const slaInfo = calculateSLARemaining(complaint.sla_deadline);

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

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const canAttach = !["AUDITOR", "SUPER_ADMIN", "AGENT"].includes(role);
  const canChange = !["AUDITOR"].includes(role);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {/* Header */}
        <MDBox mb={3}>
          <MDButton
            variant="text"
            color="info"
            onClick={() => navigate("/complaints")}
            startIcon={<Icon>arrow_back</Icon>}
          >
            Retour à la liste
          </MDButton>
        </MDBox>

        <Grid container spacing={3}>
          {/* Informations principales */}
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox p={3}>
                {/* Titre et badges */}
                <MDBox display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <MDBox>
                    <MDTypography variant="h4" fontWeight="medium" gutterBottom>
                      {complaint.title}
                    </MDTypography>
                    <MDTypography variant="button" color="text" fontWeight="regular">
                      Référence: {complaint.reference}
                    </MDTypography>
                  </MDBox>
                  <MDBox display="flex" gap={1} flexDirection="column" alignItems="flex-end">
                    <Chip
                      label={URGENCY_LABELS[complaint.urgency]}
                      color={getUrgencyColor(complaint.urgency)}
                      size="small"
                    />
                    <Chip
                      label={STATUS_LABELS[complaint.status]}
                      color={getStatusColor(complaint.status)}
                      size="small"
                    />
                  </MDBox>
                </MDBox>

                <Divider />

                {/* Description */}
                <MDBox my={3}>
                  <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                    Description
                  </MDTypography>
                  <MDTypography variant="body2" color="text">
                    {complaint.description}
                  </MDTypography>
                </MDBox>

                <Divider />

                {/* Informations détaillées */}
                <Grid container spacing={2} my={2}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      📅 Date de soumission
                    </MDTypography>
                    <MDTypography variant="body2">
                      {formatDate(complaint.submitted_at)}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      ⏰ Deadline SLA
                    </MDTypography>
                    <MDTypography variant="body2">
                      {formatDate(complaint.sla_deadline)}
                    </MDTypography>
                    <Chip
                      label={slaInfo.label}
                      color={slaInfo.isOverdue ? "error" : "success"}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      👤 Soumis par
                    </MDTypography>
                    <MDTypography variant="body2">
                      {complaint.submitted_by_name || "Inconnu"}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text" fontWeight="bold">
                      🎯 Assigné à
                    </MDTypography>
                    <MDTypography variant="body2">
                      {complaint.assigned_user_name || "Non assignée"}
                    </MDTypography>
                  </Grid>
                  {complaint.location && (
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        📍 Lieu
                      </MDTypography>
                      <MDTypography variant="body2">{complaint.location}</MDTypography>
                    </Grid>
                  )}
                  {complaint.phone_number && (
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        📞 Téléphone
                      </MDTypography>
                      <MDTypography variant="body2">{complaint.phone_number}</MDTypography>
                    </Grid>
                  )}
                  {complaint.category_name && (
                    <Grid item xs={12} md={6}>
                      <MDTypography variant="caption" color="text" fontWeight="bold">
                        🏷️ Catégorie
                      </MDTypography>
                      <MDTypography variant="body2">{complaint.category_name}</MDTypography>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Tabs pour commentaires, pièces jointes, historique */}
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={activeTab} onChange={handleTabChange}>
                    <Tab label={`Commentaires (${complaint.comments?.length || 0})`} />
                    <Tab label={`Pièces jointes (${complaint.attachments?.length || 0})`} />
                    <Tab label="Historique" />
                  </Tabs>
                </Box>

                {/* Tab Panels */}
                <MDBox mt={3}>
                  {activeTab === 0 && (
                    <ComplaintComments
                      complaintId={id}
                      comments={complaint.comments}
                      onRefresh={fetchComplaintData}
                    />
                  )}
                  {activeTab === 1 && (
                    <ComplaintAttachments
                      complaintId={id}
                      attachments={complaint.attachments}
                      onRefresh={fetchComplaintData}
                    />
                  )}
                  {activeTab === 2 && (
                    <MDBox>
                      <List>
                        {history.map((item, index) => (
                          <ListItem key={item.id} alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar>
                                <Icon>{getHistoryIcon(item.action)}</Icon>
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <MDTypography variant="body2" fontWeight="medium">
                                  {item.description}
                                </MDTypography>
                              }
                              secondary={
                                <>
                                  <MDTypography component="span" variant="caption" color="text">
                                    {item.user_name} • {formatDate(item.created_at)}
                                  </MDTypography>
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </MDBox>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Actions et sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Actions rapides */}
            {canChange && (
              <Card sx={{ mb: 3 }}>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                    Actions rapides
                  </MDTypography>
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    <ComplaintStatusUpdate complaint={complaint} onUpdate={fetchComplaintData} />
                    <ComplaintAssignment complaint={complaint} onUpdate={fetchComplaintData} />
                  </MDBox>
                </MDBox>
              </Card>
            )}

            {/* Statistiques */}
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" gutterBottom>
                  Statistiques
                </MDTypography>
                <MDBox>
                  <StatItem
                    icon="schedule"
                    label="Temps écoulé"
                    value={getElapsedTime(complaint.submitted_at)}
                  />
                  {complaint.resolution_time && (
                    <StatItem
                      icon="check_circle"
                      label="Temps de résolution"
                      value={`${complaint.resolution_time.toFixed(1)}h`}
                    />
                  )}
                  <StatItem
                    icon="comment"
                    label="Commentaires"
                    value={complaint.comments?.length || 0}
                  />
                  <StatItem
                    icon="attach_file"
                    label="Pièces jointes"
                    value={complaint.attachments?.length || 0}
                  />
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

// Composant helper pour les stats
function StatItem({ icon, label, value }) {
  return (
    <MDBox display="flex" justifyContent="space-between" alignItems="center" py={1}>
      <MDBox display="flex" alignItems="center">
        <Icon fontSize="small" sx={{ mr: 1 }}>
          {icon}
        </Icon>
        <MDTypography variant="button" fontWeight="regular" color="text">
          {label}
        </MDTypography>
      </MDBox>
      <MDTypography variant="button" fontWeight="medium">
        {value}
      </MDTypography>
    </MDBox>
  );
}

// Helper functions
function getHistoryIcon(action) {
  const icons = {
    CREATED: "add_circle",
    STATUS_CHANGED: "swap_horiz",
    ASSIGNED: "person_add",
    REASSIGNED: "swap_horizontal_circle",
    COMMENT_ADDED: "comment",
    ATTACHMENT_ADDED: "attach_file",
    UPDATED: "edit",
    DELETED: "delete",
  };
  return icons[action] || "info";
}

function getElapsedTime(startDate) {
  const now = new Date();
  const start = new Date(startDate);
  const diff = now - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}j ${hours % 24}h`;
  }
  return `${hours}h`;
}

StatItem.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default ComplaintDetail;
