// ==================== ComplaintStatusUpdate.js ====================
// layouts/complaints/detail/components/ComplaintStatusUpdate.js

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import { updateComplaint, STATUS_LABELS } from "api/complaintsService";

import PropTypes from "prop-types";

export function ComplaintStatusUpdate({ complaint, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const canChange = !["AUDITOR"].includes(role);

  const handleUpdate = async () => {
    if (newStatus === complaint.status) {
      setOpen(false);
      return;
    }

    try {
      setLoading(true);
      await updateComplaint(complaint.id, { status: newStatus });
      setOpen(false);
      onUpdate();
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MDButton variant="gradient" color="success" fullWidth onClick={() => setOpen(true)}>
        Changer le statut
      </MDButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mettre à jour le statut</DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <MDTypography variant="body2" color="text" mb={2}>
              Statut actuel: <strong>{STATUS_LABELS[complaint.status]}</strong>
            </MDTypography>
            <FormControl fullWidth>
              <InputLabel>Nouveau statut</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Nouveau statut"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setOpen(false)} color="secondary">
            Annuler
          </MDButton>
          <MDButton
            onClick={handleUpdate}
            color="success"
            disabled={newStatus === complaint.status || loading}
          >
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

ComplaintStatusUpdate.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};
