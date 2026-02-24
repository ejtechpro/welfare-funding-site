import { Activity, AlertCircle, CheckCircle, PencilLine } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBalanceHealthCheckOptions } from "@/queries/memberQueryOptions";

export const BalanceDebugTable = () => {
  const { data, isLoading, isError } = useQuery(getBalanceHealthCheckOptions());

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-gray-500 font-mono text-sm">
        <Activity className="animate-spin w-4 h-4" /> Loading balance health...
      </div>
    );

  if (isError || !data)
    return (
      <div className="flex items-center gap-2 text-red-600 font-mono text-sm">
        <AlertCircle className="w-4 h-4" /> Error fetching balances
      </div>
    );

  return (
    <div className="p-4 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="text-green-600 w-4 h-4" />
        <span className="text-sm font-medium">Balance Health Check</span>
      </div>

      {/* Summary stats */}
      <div className="flex gap-6 mb-4 text-xs">
        <div className="text-gray-600">
          <span className="font-medium">Total members:</span>{" "}
          {data.totalMembers}
        </div>
        <div className="text-gray-600">
          <span className="font-medium">Anomalies:</span>{" "}
          <span
            className={
              data.anomalyCount > 0
                ? "text-red-600 font-medium"
                : "text-green-600"
            }
          >
            {data.anomalyCount}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Member ID
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Billing Date
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Balance
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                Registration
              </th>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                User Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.members.map((m: any) => {
              return (
                <>
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-bold text-gray-900">
                      {m.tnsNumber ?? m.memberId}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600 italic text-[11px]">
                      {m.billingDate
                        ? new Date(m.billingDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-gray-900">
                      Ksh {m.balance ?? 0}
                    </td>
                    <td className="px-3 py-1.5 text-gray-600 text-[11px] italic">
                      {m.registrationStatus}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1.5">
                        {m.userStatus === "active" ? (
                          <>
                            <CheckCircle className="text-green-500 w-3.5 h-3.5" />
                            <span className="text-green-700 text-[11px] font-medium italic">
                              active
                            </span>
                          </>
                        ) : (
                          <>
                            <PencilLine className="text-blue-500 w-3.5 h-3.5" />
                            <span className="text-blue-700 text-[11px] font-medium italic">
                              inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={5} className="px-3 py-1.5">
                      Anomaly:{" "}
                      {m.reason ? (
                        <span className="text-red-500">{m.reason}</span>
                      ) : (
                        "NULL"
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      {data.anomalyCount === 0 && (
        <div className="mt-3 text-[11px] text-gray-500 italic text-center">
          No anomalies detected — all balances are healthy
        </div>
      )}
    </div>
  );
};
