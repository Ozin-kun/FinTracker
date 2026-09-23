import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Transactions ─────────────────────────────────────────
export const getTransactions = () => api.get("/transactions");
export const getSummary = () => api.get("/transactions/summary");
export const createTransaction = (data) => api.post("/transactions", data);
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

// ─── Chat Agent ───────────────────────────────────────────
export const sendMessage = (message) => api.post("/chat", { message });