import axios from "axios";

const api = axios.create({
  baseURL: "https://krushisetu-backend-production-4a02.up.railway.app/api",
  withCredentials: true,
});

export default api;
