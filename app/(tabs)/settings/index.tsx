import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { Building2, MapPin, Users, UserCog, LogOut, ChevronRight, UserCircle } from "lucide-react-native";
import React from "react";
import { useRouter } from "expo-router";

import Colors from "@/constants/colors";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();
  
  const companySettings: SettingItem[] = [
    {
      id: "company",
      title: "Mi Empresa",
      subtitle: "Ferretería El Tornillo",
      icon: <Building2 size={24} color={Colors.light.primary} />,
      onPress: () => console.log("Company settings"),
    },
    {
      id: "branches",
      title: "Sucursales",
      subtitle: "3 sucursales activas",
      icon: <MapPin size={24} color={Colors.light.info} />,
      onPress: () => console.log("Branches"),
    },
    {
      id: "customers",
      title: "Clientes",
      subtitle: "Gestionar clientes y créditos",
      icon: <UserCircle size={24} color={Colors.light.primary} />,
      onPress: () => router.push("/(tabs)/customers"),
    },
  ];

  const userSettings: SettingItem[] = [
    {
      id: "users",
      title: "Usuarios",
      subtitle: "Gestionar usuarios y permisos",
      icon: <Users size={24} color={Colors.light.success} />,
      onPress: () => console.log("Users"),
    },
    {
      id: "roles",
      title: "Roles y Permisos",
      subtitle: "Configurar roles de usuario",
      icon: <UserCog size={24} color={Colors.light.warning} />,
      onPress: () => console.log("Roles"),
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity key={item.id} style={styles.settingItem} onPress={item.onPress}>
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        )}
      </View>
      <ChevronRight size={20} color={Colors.light.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Empresa</Text>
        <View style={styles.card}>
          {companySettings.map(renderSettingItem)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usuarios y Permisos</Text>
        <View style={styles.card}>
          {userSettings.map(renderSettingItem)}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={20} color={Colors.light.danger} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Versión 1.0.0</Text>
        <Text style={styles.footerText}>Sistema de Gestión Ferretería</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: "hidden" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  logoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.danger,
  },
  footer: {
    alignItems: "center" as const,
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
});
