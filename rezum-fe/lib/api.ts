import axios from "axios";

const api = axios.create({
  baseURL: process.env.BACKEND_API_URL || "http://localhost:3400/api/v1",
});

export default api;
