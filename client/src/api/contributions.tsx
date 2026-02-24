import api from "./api";

export const addContributionType = (data: any) =>
  api.post("/contributions/add-type", data).then((res) => res.data);

export const updateContributionType = (data: any, id: string) =>
  api.put(`/contributions/update-type/${id}`, data).then((res) => res.data);

export const getContributionType = () =>
  api.get(`/contributions/get-types`).then((res) => res.data);

export const getActiveContributionType = () =>
  api.get(`/contributions/get-active-types`).then((res) => res.data);

export const deleteContributionType = (id: string) =>
  api.delete(`/contributions/delete-type/${id}`).then((res) => res.data);
