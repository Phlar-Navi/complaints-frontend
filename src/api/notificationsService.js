/**
 * Service pour la gestion des notifications
 */
import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

/**
 * Récupérer toutes les notifications
 */
export const getNotifications = async () => {
  const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS);
  return response.data;
};

/**
 * Récupérer les notifications non lues
 */
export const getUnreadNotifications = async () => {
  const response = await axiosClient.get(ENDPOINTS.NOTIFICATION_UNREAD);
  return response.data;
};

/**
 * Compter les notifications non lues
 */
export const countUnreadNotifications = async () => {
  const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS_COUNT_UNREAD);
  return response.data.count;
};

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await axiosClient.post(ENDPOINTS.NOTIFICATIONS_MARK_READ(notificationId));
  return response.data;
};

/**
 * Marquer toutes les notifications comme lues
 */
export const markAllNotificationsAsRead = async () => {
  const response = await axiosClient.post(ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  return response.data;
};

/**
 * Supprimer une notification
 */
export const deleteNotification = async (notificationId) => {
  await axiosClient.delete(ENDPOINTS.NOTIFICATIONS_DELETE(notificationId));
};

/**
 * Supprimer toutes les notifications lues
 */
export const deleteReadNotifications = async () => {
  const response = await axiosClient.delete(ENDPOINTS.NOTIFICATIONS_DELETE_READ);
  return response.data;
};

/**
 * Récupérer les statistiques des notifications
 */
export const getNotificationStats = async () => {
  const response = await axiosClient.get(ENDPOINTS.NOTIFICATIONS_STATS);
  return response.data;
};

/**
 * Types de notifications avec icônes et couleurs
 */
export const NOTIFICATION_TYPES = {
  INFO: { icon: "info", color: "info", label: "Information" },
  SUCCESS: { icon: "check_circle", color: "success", label: "Succès" },
  WARNING: { icon: "warning", color: "warning", label: "Avertissement" },
  ERROR: { icon: "error", color: "error", label: "Erreur" },
  COMPLAINT_ASSIGNED: { icon: "assignment_ind", color: "primary", label: "Assignation" },
  COMPLAINT_UPDATED: { icon: "update", color: "info", label: "Mise à jour" },
  COMPLAINT_COMMENT: { icon: "comment", color: "secondary", label: "Commentaire" },
  SLA_WARNING: { icon: "schedule", color: "error", label: "Alerte SLA" },
  SYSTEM: { icon: "settings", color: "dark", label: "Système" },
};

export default {
  getNotifications,
  getUnreadNotifications,
  countUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
  getNotificationStats,
  NOTIFICATION_TYPES,
};
