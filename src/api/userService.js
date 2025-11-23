import axiosClient from "./axiosClient";
import { ENDPOINTS } from "./endpoints";

export const createUser = async (userData) => {
  const res = await axiosClient.post(ENDPOINTS.USER_CREATE, userData);
  return res.data;
};

export const listUsers = async () => {
  const res = await axiosClient.get(ENDPOINTS.USERS);
  return res.data;
};

export const getUser = async (id) => {
  const res = await axiosClient.get(ENDPOINTS.USER_DETAIL(id));
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosClient.put(ENDPOINTS.USER_DETAIL(id), data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosClient.delete(ENDPOINTS.USER_DETAIL(id));
  return res.data;
};
