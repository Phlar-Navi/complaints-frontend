import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@mui/material/Icon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import {
  getUnreadNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NOTIFICATION_TYPES,
} from "api/notificationsService";

function NotificationMenu() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();

    // Polling toutes les 30 secondes
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getUnreadNotifications(),
        countUnreadNotifications(),
      ]);
      setNotifications(notifs.slice(0, 5)); // Top 5
      setUnreadCount(count);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Marquer comme lue
      await markNotificationAsRead(notification.id);

      // Rediriger si il y a un lien
      if (notification.link) {
        navigate(notification.link);
      }

      handleClose();
      loadNotifications(); // Rafraîchir
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await markAllNotificationsAsRead();
      loadNotifications();
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    return NOTIFICATION_TYPES[type]?.icon || "notifications";
  };

  const getNotificationColor = (type) => {
    return NOTIFICATION_TYPES[type]?.color || "info";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // en secondes

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return `Il y a ${Math.floor(diff / 86400)} j`;
  };

  return (
    <>
      {/* Icône de notification avec badge */}
      <IconButton onClick={handleOpen} size="small" sx={{ ml: 1 }}>
        <Badge badgeContent={unreadCount} color="error">
          <Icon>notifications</Icon>
        </Badge>
      </IconButton>

      {/* Menu déroulant */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 500,
            width: 360,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {/* Header */}
        <MDBox px={2} py={1.5}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="h6" fontWeight="medium">
              Notifications
            </MDTypography>
            {unreadCount > 0 && (
              <MDButton
                variant="text"
                color="info"
                size="small"
                onClick={handleMarkAllRead}
                disabled={loading}
              >
                Tout marquer lu
              </MDButton>
            )}
          </MDBox>
        </MDBox>

        <Divider />

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <MDBox p={3} textAlign="center">
            <Icon fontSize="large" color="disabled">
              notifications_none
            </Icon>
            <MDTypography variant="caption" color="text" display="block" mt={1}>
              Aucune notification
            </MDTypography>
          </MDBox>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notif) => (
              <ListItem
                key={notif.id}
                button
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  bgcolor: "grey.100",
                  borderBottom: "1px solid",
                  borderColor: "grey.300",
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
                  primary={
                    <MDTypography variant="button" fontWeight="medium">
                      {notif.title}
                    </MDTypography>
                  }
                  secondary={
                    <MDBox>
                      <MDTypography
                        variant="caption"
                        color="text"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {notif.message}
                      </MDTypography>
                      <MDTypography variant="caption" color="info" display="block">
                        {formatTime(notif.created_at)}
                      </MDTypography>
                    </MDBox>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        {/* Footer */}
        <MenuItem
          onClick={() => {
            navigate("/notifications");
            handleClose();
          }}
        >
          <MDTypography variant="button" color="info" textAlign="center" width="100%">
            Voir toutes les notifications
          </MDTypography>
        </MenuItem>
      </Menu>
    </>
  );
}

export default NotificationMenu;
