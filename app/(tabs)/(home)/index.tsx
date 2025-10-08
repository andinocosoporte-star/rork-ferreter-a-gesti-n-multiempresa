import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { TrendingUp, TrendingDown, DollarSign, FileText, Package, Users } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, isPositive, icon, color }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        {icon}
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.changeContainer}>
          {isPositive ? (
            <TrendingUp size={14} color={Colors.light.success} />
          ) : (
            <TrendingDown size={14} color={Colors.light.danger} />
          )}
          <Text style={[styles.changeText, { color: isPositive ? Colors.light.success : Colors.light.danger }]}>
            {change}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido</Text>
        <Text style={styles.companyName}>Ferretería El Tornillo</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Ventas del Mes"
          value="$45,231"
          change="+12.5%"
          isPositive={true}
          icon={<DollarSign size={24} color={Colors.light.success} />}
          color={Colors.light.success}
        />
        <StatCard
          title="Cotizaciones"
          value="23"
          change="+8.2%"
          isPositive={true}
          icon={<FileText size={24} color={Colors.light.info} />}
          color={Colors.light.info}
        />
        <StatCard
          title="Productos"
          value="1,234"
          change="-2.4%"
          isPositive={false}
          icon={<Package size={24} color={Colors.light.warning} />}
          color={Colors.light.warning}
        />
        <StatCard
          title="Clientes"
          value="89"
          change="+5.1%"
          isPositive={true}
          icon={<Users size={24} color={Colors.light.primary} />}
          color={Colors.light.primary}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ventas Recientes</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyStateText}>No hay ventas recientes</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos con Bajo Stock</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.emptyState}>
            <Package size={48} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyStateText}>Todos los productos tienen stock suficiente</Text>
          </View>
        </View>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 12,
    textAlign: "center" as const,
  },
});
