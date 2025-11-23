import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const createTenant = async (tenantData) => {
  const res = await axiosClient.post(ENDPOINTS.TENANT_CREATE, tenantData);
  return res.data;
};
