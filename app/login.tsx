import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "";
    console.log("[Login] Environment variable EXPO_PUBLIC_RORK_API_BASE_URL:", url);
    setBackendUrl(url || "No configurado");
    if (url && url !== "https://your-project-name.vercel.app" && url !== "No configurado") {
      checkBackendStatus(url);
    } else {
      setBackendStatus("offline");
      console.log("[Login] Backend status set to offline - URL not configured properly");
    }
  }, []);

  const checkBackendStatus = async (url: string) => {
    if (url === "No configurado" || !url) {
      setBackendStatus("offline");
      return;
    }

    try {
      console.log("[Login] Checking backend status at:", url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${url}/api`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log("[Login] Backend status response:", response.status);
      
      if (response.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch (error) {
      console.error("[Login] Backend status check failed:", error);
      setBackendStatus("offline");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.error || "Error al iniciar sesión");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <LogIn size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          
          {backendStatus === "offline" && (
            <View style={styles.statusBanner}>
              <AlertCircle size={16} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.statusText}>Servidor no disponible</Text>
                <Text style={styles.statusSubtext}>
                  {backendUrl === "No configurado" || !backendUrl
                    ? "Reinicia el servidor Expo con: npx expo start -c"
                    : `No se puede conectar a: ${backendUrl}\n\nSi acabas de configurar la URL, reinicia con: npx expo start -c`}
                </Text>
              </View>
            </View>
          )}
          
          {backendStatus === "checking" && (
            <View style={[styles.statusBanner, styles.statusBannerWarning]}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.statusText}>Verificando conexión...</Text>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor={Colors.light.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={Colors.light.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <Link href="/register" asChild>
            <TouchableOpacity
              style={styles.registerButton}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>Crear nueva cuenta</Text>
            </TouchableOpacity>
          </Link>
        </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sistema de Gestión Ferretería</Text>
            <Text style={styles.footerVersion}>Versión 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center" as const,
    padding: 24,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.cardBackground,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center" as const,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: Colors.light.text,
  },
  loginButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  divider: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  registerButton: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  registerButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  footer: {
    alignItems: "center" as const,
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statusBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  statusBannerWarning: {
    backgroundColor: "#f59e0b",
  },
  statusText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  statusSubtext: {
    color: "#fff",
    fontSize: 11,
    marginTop: 2,
    opacity: 0.9,
  },
});
