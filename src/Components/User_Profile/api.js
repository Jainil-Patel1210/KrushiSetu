// src/api.js
import axios from "axios";

BASE_URL = `${import.meta.env.VITE_BASE_URL}/profile`
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export default api;
