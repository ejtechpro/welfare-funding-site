import type { CreateMonthlyExpenseDTO, MonthlyExpense } from "@/types";
import api from "./api";

/* CREATE */
export const addExpenditure = (data: CreateMonthlyExpenseDTO) =>
  api.post("/expenditures/add", data).then((res) => res.data);

/* READ (all) */
export const getExpenditures = () =>
  api.get<MonthlyExpense[]>("/expenditures").then((res) => res.data);

/* READ (single) */
export const getExpenditureById = (id: string) =>
  api.get<MonthlyExpense>(`/expenditures/${id}`).then((res) => res.data);

/* UPDATE */
export const updateExpenditure = (
  id: string,
  data: Partial<Omit<MonthlyExpense, "id">>,
) => api.put(`/expenditures/${id}`, data).then((res) => res.data);

/* DELETE */
export const deleteExpenditure = (id: string) =>
  api.delete(`/expenditures/${id}`).then((res) => res.data);
