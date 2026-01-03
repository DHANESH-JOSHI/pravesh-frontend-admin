"use client"
import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetched = useRef(false);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const login = useCallback((user: User) => {
    setUser(user);
  }, []);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    (async () => {
      try {
        const res = await userService.getMe();
        // Keep the session - set user data regardless of role
        // Layout will handle redirecting to appropriate dashboard based on role
        setUser(res?.data || null);
      } catch (e: any) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}