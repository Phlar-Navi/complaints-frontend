// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Logout from "layouts/authentication/logout";
import AuthCallback from "layouts/authentication/authCallback";
import ComplaintsList from "layouts/complaints";
import ComplaintDetail from "layouts/complaints/detail";
import CreateComplaint from "layouts/complaints/create";
import RoleBasedDashboard from "layouts/dashboard/RoleBasedDashboard";
import UsersManagement from "layouts/users/UsersManagement";
import TenantsManagement from "layouts/tenants/index";
import Icon from "@mui/material/Icon";
import SuperAdminDashboard from "layouts/dashboard/components/SuperAdminDashboard";

// Fonction pour obtenir les routes basées sur le rôle actuel
const getRoutes = () => {
  const rawUser = localStorage.getItem("user");
  const userData = rawUser ? JSON.parse(rawUser) : null;

  const isTenantAdmin = userData?.role === "TENANT_ADMIN";
  const isSuperAdmin = userData?.role === "SUPER_ADMIN";

  // DEV ONLY console.log("🔄 Routes recalculées - Utilisateur:", userData?.email, "Rôle:", userData?.role);

  return [
    {
      type: "collapse",
      name: "Dashboard",
      key: "dashboard",
      icon: <Icon fontSize="small">dashboard</Icon>,
      route: "/dashboard",
      component: isSuperAdmin ? <SuperAdminDashboard /> : <RoleBasedDashboard />,
    },
    ...(isSuperAdmin
      ? [
          {
            type: "collapse",
            name: "Tenants",
            key: "tenants",
            icon: <Icon fontSize="small">apartment</Icon>,
            route: "/tenants",
            component: <TenantsManagement />,
          },
        ]
      : []),
    ...(!isSuperAdmin
      ? [
          {
            type: "collapse",
            name: "Plaintes",
            key: "complaints",
            icon: <Icon fontSize="small">assignment</Icon>,
            route: "/complaints",
            component: <ComplaintsList />,
          },
        ]
      : []),
    {
      type: "route",
      key: "complaint-detail",
      route: "/complaints/:id",
      component: <ComplaintDetail />,
    },
    {
      type: "route",
      key: "complaint-create",
      route: "/complaints/create",
      component: <CreateComplaint />,
    },
    {
      type: "route",
      name: "Sign In",
      key: "sign-in",
      icon: <Icon fontSize="small">login</Icon>,
      route: "/authentication/sign-in",
      component: <SignIn />,
    },
    {
      type: "collapse",
      name: "Notifications",
      key: "notifications",
      icon: <Icon fontSize="small">notifications</Icon>,
      route: "/notifications",
      component: <Notifications />,
    },
    {
      type: "collapse",
      name: "Profile",
      key: "profile",
      icon: <Icon fontSize="small">person</Icon>,
      route: "/profile",
      component: <Profile />,
    },
    ...(isTenantAdmin
      ? [
          {
            type: "collapse",
            name: "Utilisateurs",
            key: "users",
            icon: <Icon fontSize="small">people</Icon>,
            route: "/users",
            component: <UsersManagement />,
          },
        ]
      : []),
    {
      type: "collapse",
      name: "Sign Out",
      key: "sign-out",
      icon: <Icon fontSize="small">logout</Icon>,
      route: "/authentication/logout",
      component: <Logout />,
    },
    {
      type: "route",
      name: "Auth Callback",
      key: "auth-callback",
      route: "/auth-callback",
      component: <AuthCallback />,
      invisible: true,
    },
  ];
};

export default getRoutes;
