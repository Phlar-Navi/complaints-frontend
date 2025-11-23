// src/api/authService.js

import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";
import { setTokens, clearTokens } from "./token";

export const login = async (email, password, tenantSchema) => {
  const payload = { email, password };
  if (tenantSchema) payload.tenant_schema = tenantSchema;

  const res = await axiosClient.post(ENDPOINTS.LOGIN, payload);
  setTokens(res.data.access, res.data.refresh);
  return res.data;
};

export const logout = async () => {
  try {
    await axiosClient.post(ENDPOINTS.LOGOUT);
  } catch (e) {}

  clearTokens();
};

export const getCurrentUser = async () => {
  const res = await axiosClient.get(ENDPOINTS.ME);
  return res.data;
};

export const changePassword = async (oldPass, newPass) => {
  const res = await axiosClient.post(ENDPOINTS.CHANGE_PASSWORD, {
    old_password: oldPass,
    new_password: newPass,
  });

  setTokens(res.data.access, res.data.refresh);
  return res.data;
};
