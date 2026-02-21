import api from "./api";

export const fetchAllMembers = () =>
  api.get("/members/all").then((res) => res.data);

export const memberApproval = (memberId: string) =>
  api.put(`/members/approve/${memberId}`).then((res) => res.data);

export const memberRejection = (memberId: string) =>
  api.put(`/members/reject/${memberId}`).then((res) => res.data);

export const manualPayment = (data: any) =>
  api.post("/transactions/manual-payment", data).then((res) => res.data);
