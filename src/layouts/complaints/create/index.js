// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// React
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// API
import { createComplaint, URGENCY_LABELS } from "api/complaintsService";
// import { getCategories } from "api/categoriesService"; // À créer si nécessaire

function CreateComplaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    urgency: "MEDIUM",
    location: "",
    phone_number: "",
    category: "",
    subcategory: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Charger les catégories au montage (si disponible)
  useEffect(() => {
    // fetchCategories();
    // Pour l'instant, on peut utiliser des catégories en dur
    setCategories([
      { id: "1", name: "Violence" },
      { id: "2", name: "Vol" },
      { id: "3", name: "Vandalisme" },
      { id: "4", name: "Autre" },
    ]);
  }, []);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Le titre est requis";
    } else if (formData.title.length < 5) {
      newErrors.title = "Le titre doit contenir au moins 5 caractères";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La description est requise";
    } else if (formData.description.length < 20) {
      newErrors.description = "La description doit contenir au moins 20 caractères";
    }

    if (!formData.urgency) {
      newErrors.urgency = "L'urgence est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      // Préparer les données (enlever les champs vides optionnels)
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        urgency: formData.urgency,
      };

      if (formData.location) dataToSend.location = formData.location;
      if (formData.phone_number) dataToSend.phone_number = formData.phone_number;
      if (formData.category) dataToSend.category = formData.category;
      if (formData.subcategory) dataToSend.subcategory = formData.subcategory;

      const newComplaint = await createComplaint(dataToSend);

      alert("Plainte créée avec succès !");
      navigate(`/complaints/${newComplaint.id}`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert(error.response?.data?.detail || "Erreur lors de la création de la plainte");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ? Les modifications seront perdues.")) {
      navigate("/complaints");
    }
  };

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

        <Grid container justifyContent="center">
          <Grid item xs={12} lg={10}>
            <Card>
              <MDBox
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                mx={2}
                mt={-3}
                p={3}
                mb={1}
                textAlign="center"
              >
                <MDTypography variant="h4" fontWeight="medium" color="white">
                  Créer une nouvelle plainte
                </MDTypography>
                <MDTypography variant="body2" color="white" mt={1}>
                  Remplissez le formulaire ci-dessous pour enregistrer une nouvelle plainte
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    {/* Titre */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Titre de la plainte *"
                        value={formData.title}
                        onChange={handleChange("title")}
                        error={!!errors.title}
                        helperText={errors.title}
                        placeholder="Ex: Agression dans le parc central"
                      />
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label="Description détaillée *"
                        value={formData.description}
                        onChange={handleChange("description")}
                        error={!!errors.description}
                        helperText={
                          errors.description ||
                          "Décrivez les faits de manière détaillée (minimum 20 caractères)"
                        }
                        placeholder="Décrivez les circonstances, les personnes impliquées, etc."
                      />
                    </Grid>

                    {/* Urgence */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth error={!!errors.urgency}>
                        <InputLabel>Niveau d&apos;urgence *</InputLabel>
                        <Select
                          value={formData.urgency}
                          onChange={handleChange("urgency")}
                          label="Niveau d'urgence *"
                        >
                          {Object.entries(URGENCY_LABELS).map(([key, label]) => (
                            <MenuItem key={key} value={key}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.urgency && <FormHelperText>{errors.urgency}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {/* Catégorie */}
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Délits</InputLabel>
                        <Select
                          value={formData.category}
                          onChange={handleChange("category")}
                          label="Délit"
                        >
                          <MenuItem value="">Aucune</MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Lieu */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Lieu de l'incident"
                        value={formData.location}
                        onChange={handleChange("location")}
                        placeholder="Ex: Parc Central, Avenue de la République"
                      />
                    </Grid>

                    {/* Téléphone */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Numéro de téléphone"
                        value={formData.phone_number}
                        onChange={handleChange("phone_number")}
                        placeholder="+237 6XX XX XX XX"
                        helperText="Numéro de contact pour le suivi"
                      />
                    </Grid>

                    {/* Informations supplémentaires */}
                    <Grid item xs={12}>
                      <MDBox
                        p={2}
                        bgcolor="grey.100"
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                      >
                        <Icon color="info" sx={{ mr: 1 }}>
                          info
                        </Icon>
                        <MDTypography variant="caption" color="text">
                          Les champs marqués d&apos;une * sont obligatoires. Une fois la plainte
                          créée, elle sera automatiquement enregistrée avec la date et l&apos;heure
                          actuelles.
                        </MDTypography>
                      </MDBox>
                    </Grid>

                    {/* Boutons d'action */}
                    <Grid item xs={12}>
                      <MDBox display="flex" justifyContent="flex-end" gap={2}>
                        <MDButton
                          variant="outlined"
                          color="secondary"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Annuler
                        </MDButton>
                        <MDButton
                          variant="gradient"
                          color="success"
                          type="submit"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Icon sx={{ mr: 1, animation: "spin 1s linear infinite" }}>
                                hourglass_empty
                              </Icon>
                              Création en cours...
                            </>
                          ) : (
                            <>
                              <Icon sx={{ mr: 1 }}>add_circle</Icon>
                              Créer la plainte
                            </>
                          )}
                        </MDButton>
                      </MDBox>
                    </Grid>
                  </Grid>
                </form>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default CreateComplaint;
