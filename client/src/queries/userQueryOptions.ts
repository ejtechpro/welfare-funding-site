import { fetchCurrentUser, fetchStaffs } from "@/api/user";
import type { Staff, User } from "@/types";
import { queryOptions } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const getUserByIdOptions = (id?: string | null) =>
  queryOptions<User>({
    queryKey: ["user", id],
    // queryFn: () => getUserById(id ?? null),
    enabled: !!id,
  });

export const currentUserOptions = () =>
  queryOptions<User>({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    // staleTime: 5 * 60 * 1000, // 5 min — prevent frequent refetching
    // refetchOnMount: false,
    // refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const err = error as AxiosError;
      const status = err.response?.status;
      if (status === 401) return false;
      return failureCount < 1;
    },
  });

export const getStaffOptions = () =>
  queryOptions<Staff[]>({
    queryKey: ["staffs"],
    queryFn: ()=> fetchStaffs(),
  });
