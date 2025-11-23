import axios from "axios";
import { ENDPOINTS } from "./endpoints";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";

const axiosClient = axios.create({
  withCredentials: false,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- REFRESH TOKEN INTERCEPTOR ---
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = getRefreshToken();

        if (!refresh) {
          clearTokens();
          return Promise.reject(error);
        }

        const res = await axios.post(ENDPOINTS.REFRESH, {
          refresh: refresh,
        });

        const newAccess = res.data.access;
        const newRefresh = res.data.refresh ?? refresh;

        setTokens(newAccess, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return axiosClient(originalRequest);
      } catch (err) {
        clearTokens();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
