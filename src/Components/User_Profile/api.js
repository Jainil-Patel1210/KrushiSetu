// src/api.js
import axios from "axios";

// Local fallback URL
const LOCAL_URL = "http://127.0.0.1:8000";

// Use VITE_BASE_URL if available, otherwise use localhost
const BASE = import.meta.env.VITE_BASE_URL || LOCAL_URL;

// Global API path
const BASE_URL = `${BASE.replace(/\/$/, "")}/profile`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

export default api;
