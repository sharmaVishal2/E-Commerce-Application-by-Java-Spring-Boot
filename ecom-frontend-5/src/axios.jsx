import axios from "axios";

const defaultApiUrl = import.meta.env.DEV
  ? "http://localhost:8080/api"
  : "https://e-commerce-application-by-java-spring.onrender.com/api";

export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl;
export const AUTH_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  if (config.skipAuth) {
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  }

  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    config.headers.Authorization = `Basic ${authToken}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

export default API;
