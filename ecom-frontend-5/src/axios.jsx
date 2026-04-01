import axios from "axios";

const defaultApiUrl = import.meta.env.DEV
  ? "http://localhost:8080/api"
  : "https://e-commerce-application-by-java-spring.onrender.com/api";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

API.interceptors.request.use((config) => {
  const authToken = localStorage.getItem("authToken");
  if (authToken) {
    config.headers.Authorization = `Basic ${authToken}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

export default API;
