import type { LoginInput, RegisterPayload } from "@/types";
import api from "./api";

export const registerUser = (payload: RegisterPayload) =>
  api.post("/auth/register", payload).then((res) => res.data);

export const userLogin = (payload: LoginInput) =>
  api.post("/auth/login", payload).then((res) => res.data);

export const fetchCurrentUser = () =>
  api.get("/users/me").then((res) => res.data);

export const logout = () => api.post("/users/logout").then((res) => res.data);

export const fetchStaffs = () =>
  api.get("/users/staffs").then((res) => res.data);

export const approveStaffWithPwd = (data: any) =>
  api.post("/users/approve", data).then((res) => res.data);

export const staffRejection = (data: any) =>
  api.post("/users/reject", data).then((res) => res.data);
