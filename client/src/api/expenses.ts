import type { MonthlyExpense } from "@/types";
import api from "./api";

export const addMonthlyExpense = (data: MonthlyExpense) =>
  api.post("/expenses/add", data).then((res) => res.data);
