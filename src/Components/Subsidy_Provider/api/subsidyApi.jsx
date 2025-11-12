import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/subsidies";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

// Subsidy API Functions

// ✅ Get current user’s subsidies (uses access_token cookie automatically)
export const getMySubsidies = async () => {
  const res = await api.get("/my_subsidies/");
  return res.data;
};

// ✅ Create a new subsidy entry
export const createSubsidy = async (data) => {
  const res = await api.post("/", data);
  return res.data;
};

// ✅ Update a subsidy
export const updateSubsidy = async (id, data) => {
  const res = await api.put(`/${id}/`, data);
  return res.data;
};

// ✅ Delete a subsidy
export const deleteSubsidy = async (id) => {
  await api.delete(`/${id}/`);
};

// ✅ Get all subsidies (public/admin endpoint)
export const getAllSubsidies = async () => {
  const res = await api.get("/");
  return res.data;
};
