import { Route, Routes } from "react-router-dom";
import { AuthRoute } from "./AuthRoute ";
import Dashboard from "@/pages/Dashboard";
import ViewMembers from "@/pages/ViewMembers";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "@/types";
import CoordinatorPortal from "@/pages/CoordinatorPortal";
import AuditorPortal from "@/pages/AuditorPortal";
import AdminPortal from "@/pages/AdminPortal";
import SecretaryPortal from "@/pages/SecretaryPortal";

function ProtectedRoute() {
  return (
    <Routes>
      {/* 🔒 Any logged-in user */}
      <Route element={<AuthRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/viewmems" element={<ViewMembers />} />

        {/* 🔐 Role-based */}
        <Route
          element={
            <RoleRoute
              roles={[UserRole.general_coordinator, UserRole.area_coordinator]}
            />
          }
        >
          <Route path="/coordinator" element={<CoordinatorPortal />} />
          <Route path="/general-coordinator" element={<CoordinatorPortal />} />
        </Route>

        <Route element={<RoleRoute roles={[UserRole.auditor]} />}>
          <Route path="/auditor" element={<AuditorPortal />} />
        </Route>

        <Route element={<RoleRoute roles={[UserRole.admin]} />}>
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/treasurer" element={<AdminPortal />} />
        </Route>

        <Route element={<RoleRoute roles={[UserRole.secretary]} />}>
          <Route path="/secretary" element={<SecretaryPortal />} />
          <Route path="/customer-service" element={<SecretaryPortal />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default ProtectedRoute;
