import { fetchAllMembers } from "@/api/member";
import type { Member } from "@/types";
import { queryOptions } from "@tanstack/react-query";

export const getMembersOptions = () =>
  queryOptions<Member[]>({
    queryKey: ["members"],
    queryFn: () => fetchAllMembers(),
  });
