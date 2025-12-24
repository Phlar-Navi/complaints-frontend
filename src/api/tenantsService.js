// ==================== api/tenantsService.js ====================

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

const BASE_URL = "/api";

// ==================== TENANTS CRUD ====================

/**
 * Récupérer tous les tenants
 * @returns {Promise<Array>} Liste des tenants
 */
export const getTenants = async () => {
  const res = await axiosClient.get(ENDPOINTS.TENANTS);
  return res.data;
};

/**
 * Récupérer un tenant par ID
 * @param {string} id - UUID du tenant
 * @returns {Promise<Object>} Détails du tenant
 */
export const getTenant = async (id) => {
  const res = await axiosClient.get(ENDPOINTS.TENANT_SPECIFIC(id));
  return res.data;
};

/**
 * Créer un nouveau tenant
 * @param {Object} data - Données du tenant
 * @returns {Promise<Object>} Tenant créé
 */
export const createTenant = async (data) => {
  const res = await axiosClient.post(ENDPOINTS.TENANT_CREATE, data);
  return res.data;
};

/**
 * Mettre à jour un tenant
 * @param {string} id - UUID du tenant
 * @param {Object} data - Données à mettre à jour
 * @returns {Promise<Object>} Tenant mis à jour
 */
export const updateTenant = async (id, data) => {
  const res = await axiosClient.patch(ENDPOINTS.TENANT_SPECIFIC(id), data);
  return res.data;
};

/**
 * Supprimer un tenant
 * @param {string} id - UUID du tenant
 * @returns {Promise<void>}
 */
export const deleteTenant = async (id) => {
  await axiosClient.delete(ENDPOINTS.TENANT_SPECIFIC(id));
};

/**
 * Activer/Désactiver un tenant
 * @param {string} id - UUID du tenant
 * @returns {Promise<Object>}
 */
export const toggleTenantActive = async (id) => {
  const res = await axiosClient.post(ENDPOINTS.TENANT_ACTIVATE(id));
  return res.data;
};

/**
 * Récupérer les utilisateurs d'un tenant
 * @param {string} tenantId - UUID du tenant
 * @returns {Promise<Array>} Liste des utilisateurs
 */
export const getTenantUsers = async (tenantId) => {
  const res = await axiosClient.get(ENDPOINTS.TENANT_USERS(tenantId));
  return res.data;
};

/**
 * Récupérer les stats d'un tenant
 * @param {string} tenantId - UUID du tenant
 * @returns {Promise<Object>} Statistiques
 */
export const getTenantStats = async (tenantId) => {
  const res = await axiosClient.get(ENDPOINTS.TENANT_STATS(tenantId));
  return res.data;
};

/**
 * Ajouter un domaine à un tenant
 * @param {string} tenantId - UUID du tenant
 * @param {Object} domainData - {domain: string, is_primary: boolean}
 * @returns {Promise<Object>} Domaine créé
 */
export const addTenantDomain = async (tenantId, domainData) => {
  const res = await axiosClient.post(ENDPOINTS.TENANT_ADD_DOMAIN(tenantId), domainData);
  return res.data;
};

// ==================== STATS GLOBALES ====================

/**
 * Récupérer les statistiques globales de tous les tenants
 * @returns {Promise<Object>} Stats globales
 */
export const getGlobalStats = async () => {
  const res = await axiosClient.get(ENDPOINTS.TENANTS_GLOBAL_STATS);
  return res.data;
};
