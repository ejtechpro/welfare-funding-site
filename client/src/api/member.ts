import api from "./api";

export const memberSignIn = (payload: any) =>
  api.post("/members/signIn", payload).then((res) => res.data);
