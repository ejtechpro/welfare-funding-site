import api from "./api";

export const addDisbursment = (data: any) =>
  api.post("/disbursments/add", data).then((res) => res.data);