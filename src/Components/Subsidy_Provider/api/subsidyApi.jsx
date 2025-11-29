import axios from "axios";

const BASE = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const BASE_URL = `${BASE}/subsidies`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});


// Fetch Subsidy Provider's subsidies
export const getMySubsidies = async () => {
  const res = await api.get("/my_subsidies/");
  return res.data;
};

// Create a new subsidy 
export const createSubsidy = async (data) => {
  const res = await api.post("/", data);
  return res.data;
};

//  Update a subsidy
export const updateSubsidy = async (id, data) => {
  const res = await api.put(`/${id}/`, data);
  return res.data;
};

//  Delete a subsidy
export const deleteSubsidy = async (id) => {
  await api.delete(`/${id}/`);
};

// Get all subsidies (public/admin endpoint)
export const getAllSubsidies = async () => {
  const res = await api.get("/");
  return res.data;
};
