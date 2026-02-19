import type { LoginInput, RegisterPayload } from "@/types";
import api from "./api";

export const memberSignIn = (payload: RegisterPayload) =>
  api.post("/member/signIn", payload).then((res) => res.data);
