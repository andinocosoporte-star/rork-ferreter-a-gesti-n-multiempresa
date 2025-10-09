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

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const currentUserQuery = trpc.auth.getCurrentUser.useQuery(
    { token: token || "" },
    { 
      enabled: !!token,
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    if (currentUserQuery.data) {
      setUser(currentUserQuery.data);
      setIsLoading(false);
    } else if (currentUserQuery.isError) {
      console.error("[AuthContext] Error loading user:", currentUserQuery.error);
      setToken(null);
      setUser(null);
      AsyncStorage.removeItem(AUTH_TOKEN_KEY).catch(err => 
        console.error("[AuthContext] Error removing token:", err)
      );
      setIsLoading(false);
    } else if (token && !currentUserQuery.isLoading && !currentUserQuery.data) {
      console.log("[AuthContext] Token exists but no user data, clearing session");
      setToken(null);
      setUser(null);
      AsyncStorage.removeItem(AUTH_TOKEN_KEY).catch(err => 
        console.error("[AuthContext] Error removing token:", err)
      );
      setIsLoading(false);
    } else if (!token) {
      setIsLoading(false);
    }
  }, [currentUserQuery.data, currentUserQuery.isError, currentUserQuery.isLoading, token]);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading token:", error);
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log("[AuthContext] Attempting login for:", email);
      const result = await loginMutation.mutateAsync({ email, password });
      console.log("[AuthContext] Login successful, saving token");
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      if (error instanceof Error) {
        console.error("[AuthContext] Error message:", error.message);
        console.error("[AuthContext] Error stack:", error.stack);
      }
      
      let errorMessage = "Error al iniciar sesión";
      if (error instanceof Error) {
        if (error.message.includes("Network request failed")) {
          errorMessage = "No se puede conectar al servidor. Verifica tu conexión a internet.";
        } else if (error.message.includes("Credenciales inválidas")) {
          errorMessage = "Correo o contraseña incorrectos";
        } else {
          errorMessage = error.message;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  }, [loginMutation]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    companyName: string;
    companyLegalName: string;
    companyTaxId: string;
    companyPhone: string;
    companyEmail: string;
    companyAddress: string;
    companyCity: string;
    companyCountry: string;
  }) => {
    try {
      const result = await registerMutation.mutateAsync(data);
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error instanceof Error ? error.message : "Error al registrar" };
    }
  }, [registerMutation]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await logoutMutation.mutateAsync({ token });
      }
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, [token, logoutMutation]);

  return useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, token, isLoading, login, register, logout]);
});
