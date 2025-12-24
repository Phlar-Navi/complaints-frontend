/**
 * Page complète de gestion des notifications
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationStats,
  NOTIFICATION_TYPES,
} from "api/notificationsService";

function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0); // 0: Toutes, 1: Non lues, 2: Lues
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allNotifs, statsData] = await Promise.all([
        getNotifications(),
        getNotificationStats(),
      ]);

      setStats(statsData);

      // Filtrer selon l'onglet
      let filtered = allNotifs;
      if (tab === 1) {
        // Non lues
        filtered = allNotifs.filter((n) => !n.is_read);
      } else if (tab === 2) {
        // Lues
        filtered = allNotifs.filter((n) => n.is_read);
      }

      setNotifications(filtered);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsAsRead();
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Supprimer cette notification ?")) return;

    try {
      await deleteNotification(notificationId);
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleDeleteReadAll = async () => {
    if (!window.confirm("Supprimer toutes les notifications lues ?")) return;

    try {
      setLoading(true);
      await deleteReadNotifications();
      loadData();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    return NOTIFICATION_TYPES[type]?.icon || "notifications";
  };

  const getNotificationColor = (type) => {
    return NOTIFICATION_TYPES[type]?.color || "info";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Statistiques */}
          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="info">
                  notifications
                </Icon>
                <MDTypography variant="h3" fontWeight="medium" mt={1}>
                  {stats.total}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Total notifications
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="error">
                  notifications_active
                </Icon>
                <MDTypography variant="h3" fontWeight="medium" mt={1}>
                  {stats.unread}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Non lues
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <MDBox p={3} textAlign="center">
                <Icon fontSize="large" color="success">
                  check_circle
                </Icon>
                <MDTypography variant="h3" fontWeight="medium" mt={1}>
                  {stats.read}
                </MDTypography>
                <MDTypography variant="button" color="text">
                  Lues
                </MDTypography>
              </MDBox>
            </Card>
          </Grid>

          {/* Liste des notifications */}
          <Grid item xs={12}>
            <Card>
              {/* Header avec actions */}
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDTypography variant="h6" color="white">
                    Mes notifications
                  </MDTypography>
                  <MDBox display="flex" gap={1}>
                    {stats.unread > 0 && (
                      <MDButton
                        variant="contained"
                        color="white"
                        size="small"
                        onClick={handleMarkAllRead}
                        disabled={loading}
                      >
                        Tout marquer lu
                      </MDButton>
                    )}
                    {stats.read > 0 && (
                      <MDButton
                        variant="contained"
                        color="white"
                        size="small"
                        onClick={handleDeleteReadAll}
                        disabled={loading}
                      >
                        Supprimer lues
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
              </MDBox>

              {/* Onglets */}
              <MDBox px={3} pt={2}>
                <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
                  <Tab label={`Toutes (${stats.total})`} />
                  <Tab label={`Non lues (${stats.unread})`} />
                  <Tab label={`Lues (${stats.read})`} />
                </Tabs>
              </MDBox>

              {/* Liste */}
              <MDBox p={3}>
                {loading ? (
                  <MDBox textAlign="center" py={3}>
                    <MDTypography variant="body2" color="text">
                      Chargement...
                    </MDTypography>
                  </MDBox>
                ) : notifications.length === 0 ? (
                  <MDBox textAlign="center" py={5}>
                    <Icon fontSize="large" color="disabled">
                      inbox
                    </Icon>
                    <MDTypography variant="body2" color="text" mt={1}>
                      Aucune notification
                    </MDTypography>
                  </MDBox>
                ) : (
                  <List>
                    {notifications.map((notif) => (
                      <ListItem
                        key={notif.id}
                        sx={{
                          border: "1px solid",
                          borderColor: notif.is_read ? "grey.300" : "info.main",
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: notif.is_read ? "transparent" : "grey.100",
                          "&:hover": {
                            bgcolor: "grey.200",
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Icon color={getNotificationColor(notif.type)}>
                            {getNotificationIcon(notif.type)}
                          </Icon>
                        </ListItemIcon>

                        <ListItemText
                          onClick={() => handleNotificationClick(notif)}
                          sx={{ cursor: "pointer", flex: 1 }}
                          primary={
                            <MDBox display="flex" alignItems="center" gap={1}>
                              <MDTypography variant="button" fontWeight="medium">
                                {notif.title}
                              </MDTypography>
                              {!notif.is_read && (
                                <Chip label="Nouveau" color="error" size="small" />
                              )}
                            </MDBox>
                          }
                          secondary={
                            <MDBox>
                              <MDTypography variant="body2" color="text">
                                {notif.message}
                              </MDTypography>
                              <MDTypography variant="caption" color="text">
                                {formatDate(notif.created_at)}
                              </MDTypography>
                            </MDBox>
                          }
                        />

                        {/* Actions */}
                        <MDBox display="flex" gap={1}>
                          {!notif.is_read && (
                            <Tooltip title="Marquer comme lue">
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleMarkAsRead(notif.id)}
                              >
                                <Icon>check</Icon>
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(notif.id)}
                            >
                              <Icon>delete</Icon>
                            </IconButton>
                          </Tooltip>
                        </MDBox>
                      </ListItem>
                    ))}
                  </List>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Notifications;
