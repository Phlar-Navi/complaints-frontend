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

export const getCurrentUser = async () => {
  const response = await axiosClient.get(ENDPOINTS.ME);
  return response.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosClient.put(ENDPOINTS.USER_DETAIL(id), data);
  return res.data;
};

export const updateProfile = async (data) => {
  const response = await axiosClient.put(ENDPOINTS.UPDATE_PROFILE, data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axiosClient.post(ENDPOINTS.UPLOAD_AVATAR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const response = await axiosClient.post(ENDPOINTS.CHANGE_PASSWORD_SELF, {
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  });
  return response.data;
};

export const getUserPreferences = async () => {
  const response = await axiosClient.get(ENDPOINTS.PREFERENCES);
  return response.data;
};

export const updateUserPreferences = async (preferences) => {
  const response = await axiosClient.put(ENDPOINTS.PREFERENCES, preferences);
  return response.data;
};

export const deleteUser = async (id) => {
  const res = await axiosClient.delete(ENDPOINTS.USER_DETAIL(id));
  return res.data;
};
