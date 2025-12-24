// ==================== ComplaintAssignment.js ====================
// layouts/complaints/detail/components/ComplaintAssignment.js

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDBox from "components/MDBox";

import { assignComplaint } from "api/complaintsService";
import { listUsers } from "api/userService";

import PropTypes from "prop-types";

export function ComplaintAssignment({ complaint, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [loading, setLoading] = useState(false);

  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const forbiddenRoles = ["AUDITOR", "AGENT", "SUPER_ADMIN"];
  const canAssign = !forbiddenRoles.includes(currentUser?.role);

  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [open]);

  const fetchAgents = async () => {
    try {
      const users = await listUsers();
      // Filtrer pour ne garder que les agents et admins
      const agentsList = users.filter((u) => ["AGENT", "TENANT_ADMIN"].includes(u.role));
      setAgents(agentsList);
    } catch (error) {
      console.error("Erreur lors du chargement des agents:", error);
    }
  };

  const handleAssign = async () => {
    if (!selectedAgent) return;

    try {
      setLoading(true);
      await assignComplaint(complaint.id, selectedAgent);
      setOpen(false);
      onUpdate();
    } catch (error) {
      alert("Erreur lors de l'assignation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {canAssign && (
        <MDButton variant="gradient" color="info" fullWidth onClick={() => setOpen(true)}>
          {complaint.assigned_user_name ? "Réassigner" : "Assigner"}
        </MDButton>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assigner la plainte</DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <FormControl fullWidth>
              <InputLabel>Sélectionner un agent</InputLabel>
              <Select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                label="Sélectionner un agent"
              >
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.full_name} ({agent.email})
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
          <MDButton onClick={handleAssign} color="info" disabled={!selectedAgent || loading}>
            {loading ? "Assignation..." : "Assigner"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
ComplaintAssignment.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.string.isRequired,
    assigned_user_name: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};
