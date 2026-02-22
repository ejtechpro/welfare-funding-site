import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CoordinatorPortal from "./pages/CoordinatorPortal";
import AuditorPortal from "./pages/AuditorPortal";
import AdminPortal from "./pages/AdminPortal";
import SecretaryPortal from "./pages/SecretaryPortal";
import AdminRegistration from "./pages/AdminRegistration";
import ViewMembers from "./pages/ViewMembers";
import PortalLogin from "./pages/PortalLogin";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MemberAgreement from "./pages/MemberAgreement";
import NotFound from "./pages/NotFound";
import { AuthRoute } from "./controls/AuthRoute ";
import { RoleRoute } from "./controls/RoleRoute";
import { UserRole } from "./types";
import { AuthProvider } from "./hooks/useAuth";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Routes>
        {/* Maintenance page */}
        {/* <Route path="*" element={<Maintenance/>} /> */}
        {/* public */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        {/* {/* <Route path="/portal-login" element={<PortalLogin />} /> */}
        {/* <Route path="/adminregistration" element={<AdminRegistration />} /> 

        {/* 🔒 Any logged-in user */}
        <Route element={<AuthRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/viewmems" element={<ViewMembers />} />

          {/* 🔐 Role-based */}
          <Route 
            element={
              <RoleRoute
                roles={[
                  UserRole.general_coordinator,
                  UserRole.area_coordinator,
                  UserRole.admin,
                ]}
              />
            }
          > 
            <Route path="/coordinator" element={<CoordinatorPortal />} />
            <Route
              path="/general-coordinator"
              element={<CoordinatorPortal />}
            />
          </Route> 

        <Route 
            element={<RoleRoute roles={[UserRole.auditor, UserRole.admin]} />}
          >
            <Route path="/auditor" element={<AuditorPortal />} />
          </Route> 

           <Route
            element={<RoleRoute roles={[UserRole.admin, UserRole.treasurer]} />}
          >
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/treasurer" element={<AdminPortal />} />
          </Route> 

         <Route
            element={<RoleRoute roles={[UserRole.secretary, UserRole.admin]} />}
          >
            <Route path="/secretary" element={<SecretaryPortal />} />
            <Route path="/customer-service" element={<SecretaryPortal />} />
          </Route>
        </Route> 

        {/* public */}
         <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/member-agreement" element={<MemberAgreement />} />
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </AuthProvider>
     <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
