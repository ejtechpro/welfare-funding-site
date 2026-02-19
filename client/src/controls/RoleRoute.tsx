import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types";
import TnsLoading from "@/components/Loading";
import DashboardSkeleton from "@/components/DashboardSkeleton";

type RoleRouteProps = {
  roles: readonly (typeof UserRole)[keyof typeof UserRole][]; // array of valid roles
};

/**
 * Protects a route based on allowed roles.
 * Pass an array of roles. Example:
 *   <RoleRoute roles={[UserRole.admin, UserRole.secretary]} />
 */
export const RoleRoute = ({ roles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <TnsLoading>
        <DashboardSkeleton />
      </TnsLoading>
    );

  if (!user) return <Navigate to="/auth" replace />;
  console.log(user.role);

  // allow access if user's role is in the allowed roles
  if (!roles.includes(user.role as any))
    return <Navigate to="/dashboard" replace />;

  return <Outlet context={roles} />;
};
