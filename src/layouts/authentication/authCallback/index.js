// src/layouts/authentication/auth-callback/index.jsx

import { useEffect } from "react";
import { handleAuthCallback } from "api/authService";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

/**
 * Page de callback après login cross-domain
 * Cette page récupère les tokens depuis l'URL et les stocke dans localStorage
 */
function AuthCallback() {
  useEffect(() => {
    console.log("📥 AuthCallback: Récupération des tokens...");
    handleAuthCallback();
  }, []);

  return (
    <BasicLayout image={bgImage}>
      <MDBox
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="300px"
      >
        <MDTypography variant="h4" color="white" mb={2}>
          Connexion en cours...
        </MDTypography>
        <MDTypography variant="body2" color="white" textAlign="center">
          Vous allez être redirigé dans un instant.
        </MDTypography>

        {/* Loader simple */}
        <MDBox mt={3}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
        </MDBox>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </MDBox>
    </BasicLayout>
  );
}

export default AuthCallback;
