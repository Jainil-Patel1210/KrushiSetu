// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/profile',
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

export default api;
