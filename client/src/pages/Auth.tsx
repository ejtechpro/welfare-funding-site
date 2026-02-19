import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerUser, userLogin } from "@/api/user";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  const signUpMutation = useMutation({
    mutationFn: async () => {
      return registerUser({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName,
        lastName: lastName,
        phone: null,
        role: "user",
      });
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Please check your email to confirm your account!");
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      return userLogin({
        email: email,
        password,
      });
    },
    onSuccess: async (data) => {
      if (data?.token) {
        // Invalidate/refetch current-user so AuthProvider updates
        await queryClient.invalidateQueries({ queryKey: ["current-user"] });
        navigate("/dashboard");
        setEmail("");
        setPassword("");
        toast.success("Successfully signed in!");
      }
    },
    onError: (error: any) => {
      if (error?.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 4) {
      toast.error("Your password is too short!");
      return;
    }

    signUpMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="absolute top-4 left-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <CardTitle className="text-2xl font-bold">TNS Portal</CardTitle>
          <CardDescription>
            Sign in to access your Team No Struggle account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    signUpMutation.isPending ||
                    loading ||
                    loginMutation.isPending
                  }
                >
                  {(signUpMutation.isPending ||
                    loading ||
                    loginMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    signUpMutation.isPending ||
                    loading ||
                    loginMutation.isPending
                  }
                >
                  {(signUpMutation.isPending ||
                    loading ||
                    loginMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
