// =================================================================
// CreateUserModal.js - Modal pour créer un utilisateur
// =================================================================
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import InputAdornment from "@mui/material/InputAdornment";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import PropTypes from "prop-types";
import axios from "axios";
import { ENDPOINTS } from "api/endpoints";

CreateUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  tenantId: PropTypes.string,
};

function CreateUserModal({ open, onClose, onSuccess, tenantId }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    role: "AGENT",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const roles = [
    { value: "RECEPTION", label: "Réception" },
    { value: "AGENT", label: "Agent" },
    { value: "AUDITOR", label: "Auditeur" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Le nom d'utilisateur est requis";
    }

    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email invalide";
    }

    if (!formData.password) {
      errors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    if (!formData.first_name.trim()) {
      errors.first_name = "Le prénom est requis";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Le nom est requis";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        //username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        phone_number: formData.phone || null,
      };

      // Si tenantId est fourni, l'ajouter au payload
      //if (tenantId) {
      //payload.tenant = tenantId;
      //}

      const response = await axios.post(ENDPOINTS.USER_CREATE, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Succès
      onSuccess(response.data);
      handleClose();
    } catch (err) {
      console.error("Erreur création utilisateur:", err);

      if (err.response?.data) {
        // Gérer les erreurs de validation du backend
        const backendErrors = err.response.data;

        if (typeof backendErrors === "object") {
          setValidationErrors(backendErrors);
          setError("Veuillez corriger les erreurs dans le formulaire");
        } else {
          setError(
            backendErrors.detail ||
              backendErrors.message ||
              "Erreur lors de la création de l'utilisateur"
          );
        }
      } else {
        setError("Erreur de connexion au serveur");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      first_name: "",
      last_name: "",
      role: "AGENT",
      phone: "",
    });
    setValidationErrors({});
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" alignItems="center" gap={1}>
          <Icon color="primary">person_add</Icon>
          <MDTypography variant="h5">Créer un nouvel utilisateur</MDTypography>
        </MDBox>
      </DialogTitle>

      <DialogContent>
        <MDBox mt={2}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <MDBox mb={2}>
            <TextField
              fullWidth
              label="Nom d'utilisateur *"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!validationErrors.username}
              helperText={validationErrors.username}
              disabled={loading}
            />
          </MDBox>

          <MDBox mb={2}>
            <TextField
              fullWidth
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              disabled={loading}
            />
          </MDBox>

          <MDBox mb={2} display="flex" gap={2}>
            <TextField
              fullWidth
              label="Prénom *"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              error={!!validationErrors.first_name}
              helperText={validationErrors.first_name}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Nom *"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              error={!!validationErrors.last_name}
              helperText={validationErrors.last_name}
              disabled={loading}
            />
          </MDBox>

          <MDBox mb={2}>
            <TextField
              fullWidth
              label="Téléphone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
              disabled={loading}
            />
          </MDBox>

          <MDBox mb={2}>
            <TextField
              fullWidth
              select
              label="Rôle *"
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={!!validationErrors.role}
              helperText={validationErrors.role}
              disabled={loading}
            >
              {roles.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </MDBox>

          <MDBox mb={2}>
            <TextField
              fullWidth
              label="Mot de passe *"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password || "Minimum 8 caractères"}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      <Icon>{showPassword ? "visibility_off" : "visibility"}</Icon>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </MDBox>

          <MDBox mb={2}>
            <TextField
              fullWidth
              label="Confirmer le mot de passe *"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      <Icon>{showConfirmPassword ? "visibility_off" : "visibility"}</Icon>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </MDBox>
        </MDBox>
      </DialogContent>

      <DialogActions>
        <MDButton onClick={handleClose} color="secondary" disabled={loading}>
          Annuler
        </MDButton>
        <MDButton onClick={handleSubmit} color="success" disabled={loading}>
          {loading ? "Création..." : "Créer l'utilisateur"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}

export default CreateUserModal;
