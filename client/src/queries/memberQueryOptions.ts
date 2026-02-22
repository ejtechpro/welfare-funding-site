import { balanceHealthCheck, fetchAllMembers } from "@/api/member";
import type { BalanceHealthCheckResponse, Member } from "@/types";
import { queryOptions } from "@tanstack/react-query";

export const getMembersOptions = () =>
  queryOptions<Member[]>({
    queryKey: ["members"],
    queryFn: () => fetchAllMembers(),
  });

export const getBalanceHealthCheckOptions = () =>
  queryOptions<BalanceHealthCheckResponse>({
    queryKey: ["balances"],
    queryFn: () => balanceHealthCheck(),
  });
