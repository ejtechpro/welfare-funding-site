import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  FileText,
  DollarSign,
  Settings,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.userRole as UserRole;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const navigateToPortal = (portal: string) => {
    navigate(`/${portal}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              No role assigned. Please contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRolePortals = () => {
    const portals = [];

    switch (userRole) {
      case "area_coordinator":
        portals.push({
          title: "Area Coordinator Portal",
          description: "Manage members in your assigned area",
          icon: Users,
          route: "coordinator",
        });
        break;

      case "general_coordinator":
        portals.push({
          title: "General Coordinator Portal",
          description: "Oversee all coordinators and approve tasks",
          icon: Settings,
          route: "general-coordinator",
        });
        break;

      case "secretary":
        portals.push({
          title: "Secretary Portal",
          description: "Handle administrative tasks and documentation",
          icon: FileText,
          route: "secretary",
        });
        break;

      case "customer_service_personnel":
        portals.push({
          title: "Customer Service Portal",
          description: "Access all areas for customer support",
          icon: Users,
          route: "customer-service",
        });
        break;

      case "auditor":
        portals.push({
          title: "Auditor Portal",
          description: "Review financial data and generate reports",
          icon: DollarSign,
          route: "auditor",
        });
        break;

      case "treasurer":
        portals.push({
          title: "Treasurer Portal",
          description: "Manage treasury and financial operations",
          icon: DollarSign,
          route: "treasurer",
        });
        break;

      case "admin":
        portals.push({
          title: "Admin Portal",
          description: "Approve members and manage staff registrations",
          icon: Shield,
          route: "admin",
        });
        break;
    }

    return portals;
  };

  const portals = getRolePortals();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">TNS Dashboard</h1>
            <p className="text-muted-foreground">Welcome back {user?.firstName} {user?.lastName}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className=" space-y-2">
                  <CardTitle>Your Account</CardTitle>
                  <CardDescription>
                    Current roles and permissions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-900 capitalize hover:bg-blue-500"
                  >
                    {userRole}
                  </Badge>
                  <Badge variant="secondary" className=" capitalize">
                    {user?.approval}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portals.map((portal) => (
            <Card
              key={portal.route}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigateToPortal(portal.route)}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <portal.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{portal.title}</CardTitle>
                </div>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full mt-4">Access Portal</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
