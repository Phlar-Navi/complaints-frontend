// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

// API & Utils
import { STATUS_LABELS, URGENCY_LABELS } from "api/complaintsService";
import PropTypes from "prop-types";

RecentComplaints.propTypes = {
  complaints: PropTypes.arrayOf(PropTypes.object),
  onRefresh: PropTypes.func,
};

function RecentComplaints({ complaints = [], onRefresh }) {
  // Fonction pour obtenir la couleur du badge d'urgence
  const getUrgencyColor = (urgency) => {
    const colors = {
      HIGH: "error",
      MEDIUM: "warning",
      LOW: "success",
    };
    return colors[urgency] || "default";
  };

  // Fonction pour obtenir la couleur du badge de statut
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
    { Header: "référence", accessor: "reference", width: "15%", align: "left" },
    { Header: "titre", accessor: "title", width: "35%", align: "left" },
    { Header: "urgence", accessor: "urgency", width: "10%", align: "center" },
    { Header: "statut", accessor: "status", width: "15%", align: "center" },
    { Header: "heure", accessor: "time", width: "15%", align: "center" },
    { Header: "action", accessor: "action", width: "10%", align: "center" },
  ];

  // Composant pour le titre avec ellipsis
  const ComplaintTitle = ({ title, isOverdue, isUrgent }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      {isOverdue && (
        <Tooltip title="En retard (SLA dépassé)">
          <Icon fontSize="small" color="error" sx={{ mr: 1 }}>
            schedule
          </Icon>
        </Tooltip>
      )}
      {isUrgent && (
        <Tooltip title="Urgente non traitée">
          <Icon fontSize="small" color="error" sx={{ mr: 1 }}>
            priority_high
          </Icon>
        </Tooltip>
      )}
      <MDTypography
        variant="button"
        fontWeight="medium"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "300px",
        }}
      >
        {title}
      </MDTypography>
    </MDBox>
  );

  ComplaintTitle.propTypes = {
    title: PropTypes.string.isRequired,
    isOverdue: PropTypes.bool,
    isUrgent: PropTypes.bool,
  };

  // Transformer les données pour le tableau
  const rows = complaints.slice(0, 10).map((complaint) => ({
    reference: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {complaint.reference}
      </MDTypography>
    ),
    title: (
      <ComplaintTitle
        title={complaint.title}
        isOverdue={complaint.is_overdue}
        isUrgent={complaint.is_urgent_unhandled}
      />
    ),
    urgency: (
      <Chip
        label={URGENCY_LABELS[complaint.urgency]}
        color={getUrgencyColor(complaint.urgency)}
        size="small"
        sx={{ fontWeight: "bold" }}
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
    time: (
      <MDTypography variant="caption" color="text" fontWeight="regular">
        {new Date(complaint.submitted_at).toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </MDTypography>
    ),
    action: (
      <Tooltip title="Voir les détails">
        <IconButton
          size="small"
          color="info"
          onClick={() => {
            // TODO: Naviguer vers les détails de la plainte
            window.location.href = `/complaints/${complaint.id}`;
          }}
        >
          <Icon>visibility</Icon>
        </IconButton>
      </Tooltip>
    ),
  }));

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Plaintes reçues aujourd&apos;hui
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              notifications_active
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{complaints.length} nouvelles</strong> plaintes aujourd&apos;hui
            </MDTypography>
          </MDBox>
        </MDBox>
        <MDBox color="text" px={2}>
          <Tooltip title="Actualiser">
            <Icon
              sx={{ cursor: "pointer", fontWeight: "bold" }}
              fontSize="small"
              onClick={onRefresh}
            >
              refresh
            </Icon>
          </Tooltip>
        </MDBox>
      </MDBox>

      {complaints.length === 0 ? (
        <MDBox p={3} textAlign="center">
          <Icon fontSize="large" color="disabled">
            inbox
          </Icon>
          <MDTypography variant="button" color="text" display="block" mt={1}>
            Aucune plainte reçue aujourd&apos;hui
          </MDTypography>
        </MDBox>
      ) : (
        <MDBox>
          <DataTable
            table={{ columns, rows }}
            showTotalEntries={false}
            isSorted={false}
            noEndBorder
            entriesPerPage={false}
          />
        </MDBox>
      )}
    </Card>
  );
}

export default RecentComplaints;
