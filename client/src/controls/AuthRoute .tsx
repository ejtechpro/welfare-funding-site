import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import TnsLoading from "@/components/Loading";
import { useEffect, useState } from "react";
import DashboardSkeleton from "@/components/DashboardSkeleton";

export const AuthRoute = () => {
  const { user, loading } = useAuth();
  const [delayDone, setDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayDone(true);
    }, 2000); // seconds

    return () => clearTimeout(timer);
  }, []);

  if (loading || !delayDone)
    return (
      <TnsLoading>
        <DashboardSkeleton />
      </TnsLoading>
    );

  if (!user) return <Navigate to="/auth" replace />;

  return <Outlet />;
};
