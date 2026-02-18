import { LoginInput, RegisterPayload } from "@/types";
import api from "./api";

export const registerUser = (payload: RegisterPayload) =>
  api.post("/auth/register", payload).then((res) => res.data);

export const userLogin = (payload: LoginInput) =>
  api.post("/auth/login", payload).then((res) => res.data);

export const fetchCurrentUser = () =>
  api.get("/users/me").then((res) => res.data);
