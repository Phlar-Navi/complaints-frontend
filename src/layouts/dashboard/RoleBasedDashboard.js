/**
 * Dashboard principal qui s'adapte au rôle de l'utilisateur
 * Charge dynamiquement le bon composant selon le rôle
 */
import { lazy, Suspense } from "react";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useRoleDashboard } from "hooks/useRoleDashboard";
import PropTypes from "prop-types";

// Import lazy des composants dashboard par rôle
const SuperAdminDashboard = lazy(() => import("./components/SuperAdminDashboard"));
const TenantAdminDashboard = lazy(() => import("./components/TenantAdminDashboard"));
const ReceptionDashboard = lazy(() => import("./components/ReceptionDashboard"));
const AgentDashboard = lazy(() => import("./components/AgentDashboard"));
const AuditorDashboard = lazy(() => import("./components/AuditorDashboard"));

// Map des composants par rôle
const DASHBOARD_COMPONENTS = {
  SUPER_ADMIN: SuperAdminDashboard,
  TENANT_ADMIN: TenantAdminDashboard,
  RECEPTION: ReceptionDashboard,
  AGENT: AgentDashboard,
  AUDITOR: AuditorDashboard,
};

// Composant de chargement
function LoadingDashboard() {
  return (
    <MDBox py={3} textAlign="center">
      <Icon fontSize="large" sx={{ mb: 2, animation: "spin 2s linear infinite" }}>
        hourglass_empty
      </Icon>
      <MDTypography variant="h6">Chargement du dashboard...</MDTypography>
    </MDBox>
  );
}

function ErrorDashboard({ error, onRetry }) {
  return (
    <MDBox py={3} textAlign="center">
      <Icon fontSize="large" color="error" sx={{ mb: 2 }}>
        error_outline
      </Icon>
      <MDTypography variant="h6" color="error">
        Erreur lors du chargement
      </MDTypography>
      <MDTypography variant="body2" color="text" sx={{ mt: 1, mb: 2 }}>
        {error}
      </MDTypography>
      <MDButton color="info" onClick={onRetry}>
        Réessayer
      </MDButton>
    </MDBox>
  );
}

ErrorDashboard.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

// Composant principal
function RoleBasedDashboard() {
  // Hook qui gère la récupération des données selon le rôle
  const { role, stats, user, loading, error, lastUpdate, refresh } = useRoleDashboard({
    autoRefresh: true,
    refreshInterval: 30000, // 30 secondes
  });

  // État de chargement initial
  if (loading && !stats) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <LoadingDashboard />
        <Footer />
      </DashboardLayout>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <ErrorDashboard error={error} onRetry={refresh} />
        <Footer />
      </DashboardLayout>
    );
  }

  // Pas de données
  if (!stats || !role) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} textAlign="center">
          <Icon fontSize="large" sx={{ mb: 2 }}>
            inbox
          </Icon>
          <MDTypography variant="h6">
            Aucune donnée disponible pour role &quot;{role}&quot;
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // Récupérer le composant dashboard approprié
  const DashboardComponent = DASHBOARD_COMPONENTS[role];

  if (!DashboardComponent) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3} textAlign="center">
          <Icon fontSize="large" color="warning" sx={{ mb: 2 }}>
            warning
          </Icon>
          <MDTypography variant="h6">Rôle non reconnu: {role}</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Header avec info dernière mise à jour */}
        {lastUpdate && (
          <MDBox display="flex" justifyContent="flex-end" mb={2}>
            <MDTypography variant="caption" color="text">
              Dernière mise à jour:{" "}
              {lastUpdate.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </MDTypography>
          </MDBox>
        )}

        {/* Dashboard spécifique au rôle */}
        <Suspense fallback={<LoadingDashboard />}>
          <DashboardComponent stats={stats} user={user} onRefresh={refresh} />
        </Suspense>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default RoleBasedDashboard;

// CSS pour l'animation de chargement
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
