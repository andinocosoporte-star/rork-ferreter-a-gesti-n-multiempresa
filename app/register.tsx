import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { UserPlus, Mail, Lock, User, Phone, Building2, MapPin } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyLegalName, setCompanyLegalName] = useState<string>("");
  const [companyTaxId, setCompanyTaxId] = useState<string>("");
  const [companyPhone, setCompanyPhone] = useState<string>("");
  const [companyEmail, setCompanyEmail] = useState<string>("");
  const [companyAddress, setCompanyAddress] = useState<string>("");
  const [companyCity, setCompanyCity] = useState<string>("");
  const [companyCountry, setCompanyCountry] = useState<string>("El Salvador");

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name || !phone || !companyName || !companyLegalName || !companyTaxId || !companyPhone || !companyEmail || !companyAddress || !companyCity || !companyCountry) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    const result = await register({
      email,
      password,
      name,
      phone,
      companyName,
      companyLegalName,
      companyTaxId,
      companyPhone,
      companyEmail,
      companyAddress,
      companyCity,
      companyCountry,
    });
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Error", result.error || "Error al registrar");
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
            <UserPlus size={48} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Registra tu empresa y comienza</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Datos del Usuario</Text>

          <View style={styles.inputContainer}>
            <User size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={Colors.light.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

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
            <Phone size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono"
              placeholderTextColor={Colors.light.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar contraseña"
              placeholderTextColor={Colors.light.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <Text style={styles.sectionTitle}>Datos de la Empresa</Text>

          <View style={styles.inputContainer}>
            <Building2 size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre comercial"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyName}
              onChangeText={setCompanyName}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Building2 size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Razón social"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyLegalName}
              onChangeText={setCompanyLegalName}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Building2 size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="NIT / RFC"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyTaxId}
              onChangeText={setCompanyTaxId}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo de la empresa"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyEmail}
              onChangeText={setCompanyEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Teléfono de la empresa"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyPhone}
              onChangeText={setCompanyPhone}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Dirección"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyAddress}
              onChangeText={setCompanyAddress}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ciudad"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyCity}
              onChangeText={setCompanyCity}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="País"
              placeholderTextColor={Colors.light.textSecondary}
              value={companyCountry}
              onChangeText={setCompanyCountry}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
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
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 32,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    marginBottom: 12,
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
  registerButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  loginButton: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    height: 56,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 12,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  loginButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
