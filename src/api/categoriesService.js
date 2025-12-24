import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

const BASE_URL = "/api";

// ==================== CATEGORIES ====================

/**
 * Récupérer toutes les catégories
 * @param {string} tenantId - UUID du tenant (optionnel pour SUPER_ADMIN)
 * @returns {Promise<Array>} Liste des catégories
 */
export const getCategories = async (tenantId = null) => {
  let url = ENDPOINTS.CATEGORIES;
  if (tenantId) {
    url += `?tenant=${tenantId}`;
  }
  const res = await axiosClient.get(url);
  return res.data;
};

/**
 * Récupérer une catégorie
 * @param {string} id - UUID de la catégorie
 * @returns {Promise<Object>} Détails de la catégorie
 */
export const getCategory = async (id) => {
  const res = await axiosClient.get(ENDPOINTS.CATEGORY_DETAIL(id));
  return res.data;
};

/**
 * Créer une catégorie
 * @param {Object} data - {name, description, tenant}
 * @returns {Promise<Object>} Catégorie créée
 */
export const createCategory = async (data) => {
  const res = await axiosClient.post(ENDPOINTS.CATEGORIES, data);
  return res.data;
};

/**
 * Mettre à jour une catégorie
 * @param {string} id - UUID de la catégorie
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Catégorie mise à jour
 */
export const updateCategory = async (id, data) => {
  const res = await axiosClient.patch(ENDPOINTS.CATEGORY_DETAIL(id), data);
  return res.data;
};

/**
 * Supprimer une catégorie
 * @param {string} id - UUID de la catégorie
 * @returns {Promise<void>}
 */
export const deleteCategory = async (id) => {
  await axiosClient.delete(ENDPOINTS.CATEGORY_DETAIL(id));
};

/**
 * Récupérer les stats d'une catégorie
 * @param {string} id - UUID de la catégorie
 * @returns {Promise<Object>} Statistiques
 */
export const getCategoryStats = async (id) => {
  const res = await axiosClient.get(ENDPOINTS.CATEGORY_STATS(id));
  return res.data;
};

// ==================== SOUS-CATEGORIES ====================

/**
 * Récupérer toutes les sous-catégories
 * @param {string} categoryId - UUID de la catégorie parente (optionnel)
 * @returns {Promise<Array>} Liste des sous-catégories
 */
export const getSubCategories = async (categoryId = null) => {
  let url = ENDPOINTS.SUBCATEGORIES;
  if (categoryId) {
    url += `?category=${categoryId}`;
  }
  const res = await axiosClient.get(url);
  return res.data;
};

/**
 * Créer une sous-catégorie
 * @param {Object} data - {name, description, category, tenant}
 * @returns {Promise<Object>} Sous-catégorie créée
 */
export const createSubCategory = async (data) => {
  const res = await axiosClient.post(ENDPOINTS.SUBCATEGORIES, data);
  return res.data;
};

/**
 * Mettre à jour une sous-catégorie
 * @param {string} id - UUID de la sous-catégorie
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Sous-catégorie mise à jour
 */
export const updateSubCategory = async (id, data) => {
  const res = await axiosClient.patch(ENDPOINTS.SUBCATEGORY_DETAIL(id), data);
  return res.data;
};

/**
 * Supprimer une sous-catégorie
 * @param {string} id - UUID de la sous-catégorie
 * @returns {Promise<void>}
 */
export const deleteSubCategory = async (id) => {
  await axiosClient.delete(ENDPOINTS.SUBCATEGORY_DETAIL(id));
};

// ==================== HELPERS ====================

/**
 * Formater les données pour affichage
 */
export const formatCategoryForDisplay = (category) => {
  return {
    id: category.id,
    name: category.name,
    description: category.description || "-",
    tenant: category.tenant_name || "N/A",
    subcategories: category.subcategory_count || 0,
    complaints: category.complaint_count || 0,
    createdAt: new Date(category.created_at).toLocaleDateString("fr-FR"),
  };
};