import axios from "axios";
import type { AxiosInstance, AxiosResponse } from "axios";
import { API_BASE_URL } from "./constants";
import type { ApiError } from "../types/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for JWT (to be implemented later)
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token here when authentication is implemented
    // const token = getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || "Error de servidor",
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error || "Unknown error",
    };
    return Promise.reject(apiError);
  }
);

export { apiClient };
