// src/api.js
import axios from "axios";

const BASE_URL = import.meta.env.MODE === 'production' 
  ? `${import.meta.env.VITE_BASE_URL}` 
  : 'http://127.0.0.1:8000'; 

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Add request interceptor to include Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;