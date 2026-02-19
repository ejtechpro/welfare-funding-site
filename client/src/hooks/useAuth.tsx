import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, User } from "@/types";
import { currentUserOptions } from "@/queries/userQueryOptions";
import { logout } from "@/api/user";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery(currentUserOptions());

  const signOut = async () => {
    await logout();
    navigate("/");
    queryClient.removeQueries({ queryKey: ["current-user"] });
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        session: null,
        loading: isLoading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
