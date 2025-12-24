/**
 * Page de profil utilisateur complète
 */
import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { useAuth } from "context/authContext";
import {
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserPreferences,
  updateUserPreferences,
} from "api/userService";

function Profile() {
  const { user: authUser } = useAuth();

  // États pour le profil
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    role: "",
  });

  // États pour le mot de passe
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    theme: "light",
    language: "fr",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userData, prefsData] = await Promise.all([getCurrentUser(), getUserPreferences()]);

      setProfile({
        full_name: userData.full_name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
        role: userData.role || "",
      });

      setPreferences(prefsData);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Gestion du profil
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(profile);
      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'avatar
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      await uploadAvatar(file);
      setMessage({ type: "success", text: "Photo de profil mise à jour" });

      // Prévisualiser
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Erreur upload" });
    } finally {
      setLoading(false);
    }
  };

  // Gestion du mot de passe
  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      await changePassword(
        passwordData.old_password,
        passwordData.new_password,
        passwordData.confirm_password
      );
      setMessage({ type: "success", text: "Mot de passe changé avec succès" });
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Erreur lors du changement",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion des préférences
  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePreferences = async () => {
    try {
      setLoading(true);
      await updateUserPreferences(preferences);
      setMessage({ type: "success", text: "Préférences mises à jour" });
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la mise à jour" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Message de notification */}
        {message.text && (
          <MDBox mb={2}>
            <MDAlert color={message.type} dismissible>
              {message.text}
            </MDAlert>
          </MDBox>
        )}

        <Grid container spacing={3}>
          {/* Colonne gauche - Avatar et infos */}
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                {/* Avatar */}
                <MDBox position="relative" display="inline-block">
                  <Avatar
                    src={avatarPreview || "/default-avatar.png"}
                    alt={profile.full_name}
                    sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                  />
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        bgcolor: "info.main",
                        color: "white",
                        "&:hover": { bgcolor: "info.dark" },
                      }}
                    >
                      <Icon>camera_alt</Icon>
                    </IconButton>
                  </label>
                </MDBox>

                <MDTypography variant="h5" fontWeight="medium">
                  {profile.full_name}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  {profile.email}
                </MDTypography>
                <MDBox mt={2}>
                  <MDTypography variant="caption" color="text">
                    Rôle : <strong>{profile.role}</strong>
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Colonne droite - Formulaires */}
          <Grid item xs={12} md={8}>
            {/* Informations personnelles */}
            <Card sx={{ mb: 3 }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Informations personnelles
                </MDTypography>
                <Divider />
                <MDBox mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        label="Nom complet"
                        value={profile.full_name}
                        onChange={(e) => handleProfileChange("full_name", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        label="Email"
                        value={profile.email}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        label="Téléphone"
                        value={profile.phone_number}
                        onChange={(e) => handleProfileChange("phone_number", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        Sauvegarder
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </MDBox>
            </Card>

            {/* Changer le mot de passe */}
            <Card sx={{ mb: 3 }}>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Changer le mot de passe
                </MDTypography>
                <Divider />
                <MDBox mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        type="password"
                        label="Mot de passe actuel"
                        value={passwordData.old_password}
                        onChange={(e) => handlePasswordChange("old_password", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        type="password"
                        label="Nouveau mot de passe"
                        value={passwordData.new_password}
                        onChange={(e) => handlePasswordChange("new_password", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        type="password"
                        label="Confirmer le mot de passe"
                        value={passwordData.confirm_password}
                        onChange={(e) => handlePasswordChange("confirm_password", e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <MDButton
                        variant="gradient"
                        color="warning"
                        fullWidth
                        onClick={handleChangePassword}
                        disabled={loading}
                      >
                        Changer le mot de passe
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </MDBox>
            </Card>

            {/* Préférences */}
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Préférences
                </MDTypography>
                <Divider />
                <MDBox mt={2}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="button">Notifications par email</MDTypography>
                    <Switch
                      checked={preferences.email_notifications}
                      onChange={(e) =>
                        handlePreferenceChange("email_notifications", e.target.checked)
                      }
                    />
                  </MDBox>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="button">Notifications push</MDTypography>
                    <Switch
                      checked={preferences.push_notifications}
                      onChange={(e) =>
                        handlePreferenceChange("push_notifications", e.target.checked)
                      }
                    />
                  </MDBox>
                  <MDBox mt={3}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      fullWidth
                      onClick={handleSavePreferences}
                      disabled={loading}
                    >
                      Sauvegarder les préférences
                    </MDButton>
                  </MDBox>
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

export default Profile;
