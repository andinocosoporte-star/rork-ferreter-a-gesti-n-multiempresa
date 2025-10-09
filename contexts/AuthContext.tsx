import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { trpc } from "@/lib/trpc";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  companyId: string;
  companyName: string;
  branchId?: string;
  branchName?: string;
};

const AUTH_TOKEN_KEY = "@auth_token";

type AuthContextShape = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: true } | { success: false; error: string }>;
  register: (data: unknown) => Promise<{ success: true } | { success: false; error: string }>;
  logout: () => Promise<void>;
};

export const [AuthProvider, useAuth] = createContextHook<AuthContextShape>(() => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Load token once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (mounted && stored) setToken(stored);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const currentUserQuery = trpc.auth.getCurrentUser.useQuery(
    { token: token ?? "" },
    { enabled: !!token, retry: 1, retryDelay: 1000 }
  );

  useEffect(() => {
    if (currentUserQuery.data) setUser(currentUserQuery.data as AuthUser);
  }, [currentUserQuery.data]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await loginMutation.mutateAsync({ email, password });
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.token);
        setToken(res.token);
        setUser(res.user as AuthUser);
        return { success: true } as const;
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : String(e) } as const;
      }
    },
    [loginMutation]
  );

  const register = useCallback(
    async (data: unknown) => {
      try {
        const res = await registerMutation.mutateAsync(data as any);
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, res.token);
        setToken(res.token);
        setUser(res.user as AuthUser);
        return { success: true } as const;
      } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : String(e) } as const;
      }
    },
    [registerMutation]
  );

  const logout = useCallback(async () => {
    try {
      if (token) await logoutMutation.mutateAsync({ token });
    } finally {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY).catch(() => {});
      setToken(null);
      setUser(null);
    }
  }, [token, logoutMutation]);

  return useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );
});
