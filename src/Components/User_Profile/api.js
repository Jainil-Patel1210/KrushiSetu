// src/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/profile",
    // baseURL: "https://krushisetu-backend-production-4a02.up.railway.app/api",
    withCredentials: true,
});

export default api;
