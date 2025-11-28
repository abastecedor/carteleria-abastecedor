// src/api.js
import axios from "axios";

const API_URL = "http://localhost:3001";

export const getProducts = async () => {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
};
