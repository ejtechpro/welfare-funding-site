import axios from "axios";

const devURL = "http://localhost:3000/api";
const proURL = "/api";

const api = axios.create({
  baseURL: devURL,
  withCredentials: true,
  timeout: 60000,
});

export default api;
