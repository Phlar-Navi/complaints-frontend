// =================================================================
// UsersManagement.js - Gestion complète des utilisateurs
// =================================================================
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import CreateUserModal from "layouts/dashboard/components/CreateUserModal";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useSnackbar } from "notistack";
import axios from "axios";

function UsersManagement() {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Récupérer les utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur récupération utilisateurs:", error);
      enqueueSnackbar("Erreur lors du chargement des utilisateurs", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userToDelete.id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      enqueueSnackbar("Utilisateur supprimé avec succès", { variant: "success" });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error);
      enqueueSnackbar(error.response?.data?.detail || "Erreur lors de la suppression", {
        variant: "error",
      });
    }
  };

  const getRoleLabel = (role) => {
    const roleLabels = {
      SUPER_ADMIN: "Super Admin",
      TENANT_ADMIN: "Admin Tenant",
      RECEPTION: "Réception",
      AGENT: "Agent",
      AUDITOR: "Auditeur",
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role) => {
    const roleColors = {
      SUPER_ADMIN: "error",
      TENANT_ADMIN: "warning",
      RECEPTION: "info",
      AGENT: "primary",
      AUDITOR: "success",
    };
    return roleColors[role] || "default";
  };

  const columns = [
    { Header: "utilisateur", accessor: "user", width: "25%", align: "left" },
    { Header: "email", accessor: "email", width: "25%", align: "left" },
    { Header: "rôle", accessor: "role", width: "15%", align: "center" },
    { Header: "téléphone", accessor: "phone", width: "15%", align: "left" },
    { Header: "statut", accessor: "status", width: "10%", align: "center" },
    { Header: "actions", accessor: "actions", width: "10%", align: "center" },
  ];

  const rows = users.map((user) => ({
    user: (
      <MDBox display="flex" alignItems="center">
        <MDBox
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="50%"
          bgcolor={getRoleColor(user.role) + ".main"}
          width={40}
          height={40}
          mr={2}
        >
          <MDTypography variant="button" color="white" fontWeight="bold">
            {user.first_name?.charAt(0) || ""}
            {user.last_name?.charAt(0) || ""}
          </MDTypography>
        </MDBox>
        <MDBox>
          <MDTypography variant="button" fontWeight="medium">
            {user.first_name} {user.last_name}
          </MDTypography>
          <MDTypography variant="caption" color="text" display="block">
            @{user.username}
          </MDTypography>
        </MDBox>
      </MDBox>
    ),
    email: (
      <MDTypography variant="caption" color="text">
        {user.email}
      </MDTypography>
    ),
    role: <Chip label={getRoleLabel(user.role)} color={getRoleColor(user.role)} size="small" />,
    phone: (
      <MDTypography variant="caption" color="text">
        {user.phone || "—"}
      </MDTypography>
    ),
    status: (
      <Chip
        label={user.is_active ? "Actif" : "Inactif"}
        color={user.is_active ? "success" : "default"}
        size="small"
      />
    ),
    actions: (
      <MDBox display="flex" gap={1} justifyContent="center">
        <IconButton
          size="small"
          color="error"
          onClick={() => {
            setUserToDelete(user);
            setDeleteDialogOpen(true);
          }}
          disabled={user.id === currentUser?.id}
        >
          <Icon fontSize="small">delete</Icon>
        </IconButton>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <Card>
            <MDBox
              mx={2}
              mt={-3}
              py={3}
              px={2}
              variant="gradient"
              bgColor="info"
              borderRadius="lg"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography variant="h6" color="white">
                Gestion des utilisateurs
              </MDTypography>
              <MDButton variant="contained" color="white" onClick={() => setCreateModalOpen(true)}>
                <Icon sx={{ mr: 1 }}>person_add</Icon>
                Nouvel utilisateur
              </MDButton>
            </MDBox>
            <MDBox pt={3}>
              {loading ? (
                <MDBox textAlign="center" py={3}>
                  <MDTypography variant="h6" color="text">
                    Chargement...
                  </MDTypography>
                </MDBox>
              ) : (
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={{ defaultValue: 10, entries: [5, 10, 15, 20] }}
                  showTotalEntries
                  noEndBorder
                />
              )}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      {/* Modal création utilisateur */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
        }}
        tenantId={currentUser?.tenant?.id}
      />

      {/* Dialog confirmation suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer l&apos;utilisateur{" "}
            <strong>
              {userToDelete?.first_name} {userToDelete?.last_name}
            </strong>{" "}
            ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Annuler
          </MDButton>
          <MDButton onClick={handleDeleteUser} color="error">
            Supprimer
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default UsersManagement;
