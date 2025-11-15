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

export default api;