import {
  deleteContributionType,
  getContributionType,
} from "@/api/contributions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-300",
  inactive: "bg-gray-100 text-gray-600 border-gray-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
};

const ContributionTypeTable = ({ onEdit }: { onEdit: (row: any) => void }) => {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["contribution-types"],
    queryFn: async () => {
      const res = await getContributionType();
      return res.types;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContributionType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contribution-types"],
      });
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <table className="w-full border text-sm">
      <thead className="bg-muted">
        <tr>
          <th className="border p-2">Name</th>
          <th className="border p-2">Category</th>
          <th className="border p-2">Default Amount</th>
          <th className="border p-2">Status</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.length > 0 &&
          data.map((row: any) => (
            <tr key={row.id}>
              <td className="border p-2">{row.name}</td>
              <td className="border p-2">{row.category}</td>
              <td className="border p-2">{row.defaultAmount}</td>
              <td className="border p-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${
                    statusColors[row.status] ||
                    "bg-yellow-100 text-yellow-700 border-yellow-300"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="border p-2 space-x-2">
                <Button size="sm" onClick={() => onEdit(row)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(row.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export default ContributionTypeTable;
