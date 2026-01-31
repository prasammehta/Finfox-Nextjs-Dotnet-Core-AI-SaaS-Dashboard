// services/http.ts
import axios from "axios";

const TOKEN_KEY = "auth_token";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5252";

export const http = axios.create({
  baseURL: BASE_URL,
});

/**
 * Get full asset URL by prepending base URL to relative paths
 */
export const getAssetUrl = (assetPath?: string | null): string => {
  if (!assetPath) return "";
  // If it's already a full URL, return as is
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }
  // Prepend base URL to relative paths
  return `${BASE_URL}${assetPath.startsWith("/") ? "" : "/"}${assetPath}`;
};

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for handling 401 errors
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);
