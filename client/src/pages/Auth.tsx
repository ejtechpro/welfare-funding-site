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
import { UserRole } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  // Check length (at least 3 chars)
  if (trimmedName.length < 3) return false;
  // Check if it's not just empty/spaces
  if (trimmedName.length === 0) return false;
  // Check if it's not just special characters or numbers
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) return false;
  return true;
};

const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, "");
  // Check if it's between 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

const validatePassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const validateArea = (area: string): boolean => {
  const trimmedArea = area.trim();
  // Optional field but if provided, must be at least 3 chars
  if (trimmedArea.length > 0 && trimmedArea.length < 3) return false;
  return true;
};

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  selectedRole?: string;
  areaOfResidence?: string;
}

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [areaOfResidence, setAreaOfResidence] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const roles = [
    { value: UserRole.admin, label: "☑️ Admin" },
    { value: UserRole.advisory_committee, label: "Advisory Committee" },
    { value: UserRole.general_coordinator, label: "General Coordinator" },
    { value: UserRole.area_coordinator, label: "☑️ Area Coordinator" },
    { value: UserRole.secretary, label: "☑️ Secretary" },
    {
      value: UserRole.customer_service_personnel,
      label: "Customer Service Personnel",
    },
    { value: UserRole.organizing_secretary, label: "Organizing Secretary" },
    { value: UserRole.treasurer, label: "☑️ Treasurer" },
    { value: UserRole.auditor, label: "☑️ Auditor" },
  ];

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate, user]);

  // Real-time validation
  useEffect(() => {
    if (touchedFields.size > 0) {
      validateForm();
    }
  }, [
    firstName,
    lastName,
    email,
    phone,
    password,
    selectedRole,
    areaOfResidence,
  ]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (!validateName(firstName)) {
      newErrors.firstName =
        "First name must be at least 3 characters and contain only letters, spaces, hyphens, or apostrophes";
    }

    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!validateName(lastName)) {
      newErrors.lastName =
        "Last name must be at least 3 characters and contain only letters, spaces, hyphens, or apostrophes";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Phone number must be between 10-15 digits";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!validatePassword(password)) {
      newErrors.password =
        "Password must be at least 8 characters with at least one uppercase, one lowercase, and one number";
    }

    // Role validation
    if (!selectedRole) {
      newErrors.selectedRole = "Please select a role";
    }

    // Area validation (optional)
    if (areaOfResidence.trim() && !validateArea(areaOfResidence)) {
      newErrors.areaOfResidence =
        "Area must be at least 3 characters if provided";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const signUpMutation = useMutation({
    mutationFn: async () => {
      return registerUser({
        email: email.trim().toLowerCase(),
        password: password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        userRole: "user",
        requestedRole: selectedRole,
        assignedArea: areaOfResidence.trim(),
      });
    },
    onSuccess: (data) => {
      if (data?.success) {
        toast.success("Please check your email to confirm your account!");
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setPhone("");
        setSelectedRole("");
        setAreaOfResidence("");
        setErrors({});
        setTouchedFields(new Set());
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
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });
    },
    onSuccess: async (data) => {
      if (data?.token) {
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

    // Validate email for sign in
    if (!loginEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!validateEmail(loginEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!loginPassword) {
      toast.error("Password is required");
      return;
    }

    loginMutation.mutate();
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "password",
      "selectedRole",
    ];
    setTouchedFields(new Set(allFields));

    if (!validateForm()) {
      // Show first error as toast for better UX
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    signUpMutation.mutate();
  };

  const getFieldError = (fieldName: keyof ValidationErrors) => {
    return touchedFields.has(fieldName) ? errors[fieldName] : undefined;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-xl">
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
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className={
                      errors.email && touchedFields.has("email")
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.email && touchedFields.has("email") && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className={
                      errors.password && touchedFields.has("password")
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.password && touchedFields.has("password") && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
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
                      onBlur={() => handleFieldBlur("firstName")}
                      required
                      className={
                        getFieldError("firstName") ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("firstName") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("firstName")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => handleFieldBlur("lastName")}
                      required
                      className={
                        getFieldError("lastName") ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("lastName") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("lastName")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      required
                      className={getFieldError("email") ? "border-red-500" : ""}
                    />
                    {getFieldError("email") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("email")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => handleFieldBlur("phone")}
                      required
                      className={getFieldError("phone") ? "border-red-500" : ""}
                    />
                    {getFieldError("phone") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("phone")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className="text-foreground font-medium"
                    >
                      Select Role *
                    </Label>
                    <Select
                      onValueChange={setSelectedRole}
                      value={selectedRole}
                    >
                      <SelectTrigger
                        className={`border-border/50 focus:border-primary ${
                          getFieldError("selectedRole") ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Choose your administrative role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {getFieldError("selectedRole") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("selectedRole")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleFieldBlur("password")}
                      required
                      className={
                        getFieldError("password") ? "border-red-500" : ""
                      }
                    />
                    {getFieldError("password") && (
                      <p className="text-sm text-red-500">
                        {getFieldError("password")}
                      </p>
                    )}
                    {!errors.password &&
                      touchedFields.has("password") &&
                      password && (
                        <p className="text-xs text-green-500">
                          Password strength: Good
                        </p>
                      )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="areaOfResidence"
                    className="text-foreground font-medium"
                  >
                    Area of Residence/Assignment (Optional)
                  </Label>
                  <Input
                    id="areaOfResidence"
                    value={areaOfResidence}
                    onChange={(e) => setAreaOfResidence(e.target.value)}
                    onBlur={() => handleFieldBlur("areaOfResidence")}
                    placeholder="Enter your area of residence or assignment"
                    className={`border-border/50 focus:border-primary ${
                      getFieldError("areaOfResidence") ? "border-red-500" : ""
                    }`}
                  />
                  {getFieldError("areaOfResidence") && (
                    <p className="text-sm text-red-500">
                      {getFieldError("areaOfResidence")}
                    </p>
                  )}
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
                  Submit Registration
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
