// src/api/complaintsService.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

const BASE_URL = "/api";

// ==================== COMPLAINTS CRUD ====================

/**
 * Récupérer la liste des plaintes avec filtres optionnels
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.status - Filtrer par statut (NEW, ASSIGNED, etc.)
 * @param {string} filters.urgency - Filtrer par urgence (HIGH, MEDIUM, LOW)
 * @param {string} filters.assigned_user - UUID de l'utilisateur assigné
 * @param {string} filters.category - UUID de la catégorie
 * @param {string} filters.search - Recherche dans reference, title, description
 * @param {string} filters.ordering - Trier par champ (-submitted_at, urgency, etc.)
 * @param {number} filters.page - Numéro de page pour pagination
 * @returns {Promise<Array>} Liste des plaintes
 */
export const getComplaints = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  //const url = `${BASE_URL}/complaints/${params.toString() ? `?${params.toString()}` : ""}`;
  const url = ENDPOINTS.COMPLAINT_DETAIL(params.toString() ? `?${params.toString()}` : "");
  const res = await axiosClient.get(url);
  return res.data;
};

/**
 * Récupérer les détails d'une plainte
 * @param {string} id - UUID de la plainte
 * @returns {Promise<Object>} Détails de la plainte
 */
export const getComplaint = async (id) => {
  const res = await axiosClient.get(ENDPOINTS.COMPLAINT_DETAIL(id));
  return res.data;
};

/**
 * Créer une nouvelle plainte
 * @param {Object} data - Données de la plainte
 * @param {string} data.title - Titre de la plainte
 * @param {string} data.description - Description détaillée
 * @param {string} data.urgency - Urgence (HIGH, MEDIUM, LOW)
 * @param {string} data.location - Lieu (optionnel)
 * @param {string} data.phone_number - Numéro de téléphone (optionnel)
 * @param {string} data.category - UUID de la catégorie (optionnel)
 * @param {string} data.subcategory - UUID de la sous-catégorie (optionnel)
 * @returns {Promise<Object>} Plainte créée
 */
export const createComplaint = async (data) => {
  const res = await axiosClient.post(ENDPOINTS.COMPLAINTS, data);
  return res.data;
};

/**
 * Mettre à jour une plainte
 * @param {string} id - UUID de la plainte
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Plainte mise à jour
 */
export const updateComplaint = async (id, data) => {
  const res = await axiosClient.patch(ENDPOINTS.COMPLAINT_DETAIL(id), data);
  return res.data;
};

/**
 * Supprimer une plainte (uniquement admins)
 * @param {string} id - UUID de la plainte
 * @returns {Promise<void>}
 */
export const deleteComplaint = async (id) => {
  await axiosClient.delete(ENDPOINTS.COMPLAINT_DETAIL(id));
};

// ==================== ACTIONS SUR LES PLAINTES ====================

/**
 * Assigner une plainte à un agent
 * @param {string} complaintId - UUID de la plainte
 * @param {string} userId - UUID de l'utilisateur à assigner
 * @returns {Promise<Object>} Plainte mise à jour
 */
export const assignComplaint = async (complaintId, userId) => {
  const res = await axiosClient.post(ENDPOINTS.COMPLAINT_ASSIGN(complaintId), {
    user_id: userId,
  });
  return res.data;
};

/**
 * Ajouter un commentaire à une plainte
 * @param {string} complaintId - UUID de la plainte
 * @param {Object} data - Données du commentaire
 * @param {string} data.note - Contenu du commentaire
 * @param {string} data.type - Type (INTERNAL, PUBLIC, SYSTEM)
 * @returns {Promise<Object>} Commentaire créé
 */
export const addComment = async (complaintId, data) => {
  const res = await axiosClient.post(ENDPOINTS.COMPLAINT_COMMENT(complaintId), data);
  return res.data;
};

/**
 * Ajouter une pièce jointe à une plainte
 * @param {string} complaintId - UUID de la plainte
 * @param {File} file - Fichier à uploader
 * @returns {Promise<Object>} Pièce jointe créée
 */
export const addAttachment = async (complaintId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosClient.post(ENDPOINTS.COMPLAINT_ATTACHMENT(complaintId), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

/**
 * Récupérer l'historique d'une plainte
 * @param {string} complaintId - UUID de la plainte
 * @returns {Promise<Array>} Historique de la plainte
 */
export const getComplaintHistory = async (complaintId) => {
  const res = await axiosClient.get(ENDPOINTS.COMPLAINT_HISTORY(complaintId));
  return res.data;
};

// ==================== DASHBOARD & STATISTIQUES ====================

/**
 * Récupérer les statistiques du dashboard
 * @returns {Promise<Object>} Statistiques complètes
 * @property {Object} overview - Vue d'ensemble (total, tendances, etc.)
 * @property {Array} weekly_trend - Tendance sur 7 jours
 * @property {Object} urgency_distribution - Répartition par urgence
 * @property {Object} status_distribution - Répartition par statut
 * @property {Array} workload - Charge de travail par agent
 * @property {Object} sla_performance - Performance SLA
 * @property {Object} personal_stats - Statistiques personnelles
 */
export const getDashboardStats = async () => {
  const res = await axiosClient.get(ENDPOINTS.DASHBOARD);
  return res.data;
};

// ==================== SLA CONFIGURATION ====================

/**
 * Récupérer toutes les configurations SLA
 * @returns {Promise<Array>} Liste des configurations SLA
 */
export const getSLAConfigs = async () => {
  const res = await axiosClient.get(ENDPOINTS.SLA_CONFIGS);
  return res.data;
};

/**
 * Récupérer une configuration SLA
 * @param {string} id - UUID de la config SLA
 * @returns {Promise<Object>} Configuration SLA
 */
export const getSLAConfig = async (id) => {
  const res = await axiosClient.get(ENDPOINTS.SLA_CONFIG_DETAIL(id));
  return res.data;
};

/**
 * Créer une configuration SLA
 * @param {Object} data - Données de la config
 * @param {string} data.category - UUID de la catégorie
 * @param {string} data.urgency_level - Niveau d'urgence (HIGH, MEDIUM, LOW)
 * @param {number} data.delay_hours - Délai en heures
 * @returns {Promise<Object>} Config SLA créée
 */
export const createSLAConfig = async (data) => {
  const res = await axiosClient.post(ENDPOINTS.SLA_CONFIGS, data);
  return res.data;
};

/**
 * Mettre à jour une configuration SLA
 * @param {string} id - UUID de la config SLA
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Config SLA mise à jour
 */
export const updateSLAConfig = async (id, data) => {
  const res = await axiosClient.patch(ENDPOINTS.SLA_CONFIG_DETAIL(id), data);
  return res.data;
};

/**
 * Supprimer une configuration SLA
 * @param {string} id - UUID de la config SLA
 * @returns {Promise<void>}
 */
export const deleteSLAConfig = async (id) => {
  await axiosClient.delete(ENDPOINTS.SLA_CONFIG_DETAIL(id));
};

// ==================== HISTORIQUE GLOBAL ====================

/**
 * Récupérer l'historique complet (tous les changements)
 * @param {Object} filters - Filtres optionnels
 * @param {string} filters.action - Filtrer par type d'action
 * @param {string} filters.complaint - UUID de la plainte
 * @returns {Promise<Array>} Liste des entrées d'historique
 */
export const getHistory = async (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });
  //const url = `${BASE_URL}/history/${params.toString() ? `?${params.toString()}` : ""}`;
  const url = ENDPOINTS.HISTORY_DETAIL(params.toString() ? `?${params.toString()}` : "");
  const res = await axiosClient.get(url);
  return res.data;
};

// ==================== HELPERS & UTILITAIRES ====================

/**
 * Traduire les statuts en français
 */
export const STATUS_LABELS = {
  NEW: "Nouvelle",
  RECEIVED: "Reçue",
  ASSIGNED: "Assignée",
  IN_PROGRESS: "En cours",
  INVESTIGATION: "Investigation",
  ACTION: "Action en cours",
  RESOLVED: "Résolue",
  ARCHIVED: "Archivée",
  CLOSED: "Clôturée",
};

/**
 * Traduire les urgences en français
 */
export const URGENCY_LABELS = {
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
};

/**
 * Traduire les types de commentaires
 */
export const COMMENT_TYPE_LABELS = {
  INTERNAL: "Interne",
  PUBLIC: "Public",
  SYSTEM: "Système",
};

/**
 * Couleurs pour les badges d'urgence
 */
export const URGENCY_COLORS = {
  HIGH: "red",
  MEDIUM: "orange",
  LOW: "green",
};

/**
 * Couleurs pour les badges de statut
 */
export const STATUS_COLORS = {
  NEW: "blue",
  RECEIVED: "cyan",
  ASSIGNED: "purple",
  IN_PROGRESS: "yellow",
  INVESTIGATION: "orange",
  ACTION: "amber",
  RESOLVED: "green",
  ARCHIVED: "gray",
  CLOSED: "slate",
};

/**
 * Formater une date en format lisible
 * @param {string} dateString - Date ISO string
 * @returns {string} Date formatée
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Formater une durée en heures en format lisible
 * @param {number} hours - Durée en heures
 * @returns {string} Durée formatée
 */
export const formatDuration = (hours) => {
  if (!hours) return "-";

  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  } else if (hours < 24) {
    return `${Math.round(hours)} h`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return remainingHours > 0 ? `${days}j ${remainingHours}h` : `${days}j`;
  }
};

/**
 * Calculer le temps restant avant le SLA
 * @param {string} slaDeadline - Date limite SLA
 * @returns {Object} Temps restant et statut
 */
export const calculateSLARemaining = (slaDeadline) => {
  if (!slaDeadline) return { remaining: null, isOverdue: false, label: "-" };

  const now = new Date();
  const deadline = new Date(slaDeadline);
  const diff = deadline - now;

  const isOverdue = diff < 0;
  const hours = Math.abs(diff) / (1000 * 60 * 60);

  return {
    remaining: hours,
    isOverdue,
    label: isOverdue
      ? `En retard de ${formatDuration(hours)}`
      : `${formatDuration(hours)} restantes`,
  };
};

/**
 * Vérifier si une plainte est urgente et non traitée
 * @param {Object} complaint - Objet plainte
 * @returns {boolean}
 */
export const isUrgentUnhandled = (complaint) => {
  return complaint.urgency === "HIGH" && ["NEW", "RECEIVED"].includes(complaint.status);
};

/**
 * Obtenir l'icône appropriée pour un statut
 * @param {string} status - Statut de la plainte
 * @returns {string} Nom de l'icône (compatible avec lucide-react)
 */
export const getStatusIcon = (status) => {
  const icons = {
    NEW: "FileText",
    RECEIVED: "Inbox",
    ASSIGNED: "UserCheck",
    IN_PROGRESS: "Clock",
    INVESTIGATION: "Search",
    ACTION: "Zap",
    RESOLVED: "CheckCircle",
    ARCHIVED: "Archive",
    CLOSED: "Lock",
  };
  return icons[status] || "FileText";
};

/**
 * Exporter les plaintes en CSV (côté client)
 * @param {Array} complaints - Liste des plaintes
 * @param {string} filename - Nom du fichier
 */
export const exportToCSV = (complaints, filename = "plaintes.csv") => {
  const headers = [
    "Référence",
    "Titre",
    "Statut",
    "Urgence",
    "Catégorie",
    "Assigné à",
    "Date de soumission",
    "Deadline SLA",
  ];

  const rows = complaints.map((c) => [
    c.reference,
    c.title,
    STATUS_LABELS[c.status],
    URGENCY_LABELS[c.urgency],
    c.category_name || "-",
    c.assigned_user_name || "-",
    formatDate(c.submitted_at),
    formatDate(c.sla_deadline),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
