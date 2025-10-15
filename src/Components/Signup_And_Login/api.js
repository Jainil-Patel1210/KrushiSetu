import axios from "axios";

const api = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_BASE_URL,
=======
  baseURL: "https://krushisetu-backend-production-4a02.up.railway.app/api",
>>>>>>> 0db76520ca21306dc68e53a13a28d222c1460006
  withCredentials: true,
});

export default api;
