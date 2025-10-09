import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { Plus, Search, UserCircle, CreditCard, AlertCircle } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const companyId = "company_1";
  const branchId = "branch_1";

  const customersQuery = trpc.customers.getCustomers.useQuery({
    companyId,
    branchId,
    search: searchQuery,
  });

  const customers = customersQuery.data || [];
  
  console.log('[Customers] Customers count:', customers.length);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const withCredit = customers.filter((c) => c.currentDebt > 0).length;
    const totalDebt = customers.reduce((sum, c) => sum + c.currentDebt, 0);

    return { totalCustomers, withCredit, totalDebt };
  }, [customers]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Clientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.warningText]}>{stats.withCredit}</Text>
            <Text style={styles.statLabel}>Con Crédito</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.dangerText]}>€{stats.totalDebt.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Deuda Total</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/customers/new")}
        >
          <Plus size={20} color={Colors.light.cardBackground} />
          <Text style={styles.addButtonText}>Nuevo Cliente</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {customersQuery.isLoading ? (
          <Text style={styles.loadingText}>Cargando clientes...</Text>
        ) : customers.length === 0 ? (
          <View style={styles.emptyState}>
            <UserCircle size={64} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyText}>No hay clientes registrados</Text>
            <Text style={styles.emptySubtext}>Agrega tu primer cliente para comenzar</Text>
          </View>
        ) : (
          customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              style={styles.customerCard}
              onPress={() => router.push(`/(tabs)/customers/${customer.id}`)}
            >
              <View style={styles.customerHeader}>
                <View style={styles.customerIcon}>
                  <UserCircle size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerCode}>{customer.code}</Text>
                  <Text style={styles.customerContact}>{customer.email}</Text>
                  <Text style={styles.customerContact}>{customer.phone}</Text>
                </View>
              </View>

              <View style={styles.customerFooter}>
                <View style={styles.creditInfo}>
                  <CreditCard size={16} color={Colors.light.textSecondary} />
                  <Text style={styles.creditLabel}>Límite de crédito</Text>
                  <Text style={styles.creditValue}>€{customer.creditLimit.toFixed(2)}</Text>
                </View>

                {customer.currentDebt > 0 && (
                  <View style={styles.debtInfo}>
                    <AlertCircle size={16} color={Colors.light.danger} />
                    <Text style={styles.debtLabel}>Deuda actual</Text>
                    <Text style={styles.debtValue}>€{customer.currentDebt.toFixed(2)}</Text>
                  </View>
                )}

                <View style={styles.availableInfo}>
                  <Text style={styles.availableLabel}>Disponible</Text>
                  <Text style={[styles.availableValue, customer.available < 0 && styles.negativeValue]}>
                    €{customer.available.toFixed(2)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: Colors.light.text,
  },
  statsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: isTablet ? 150 : 100,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  warningText: {
    color: Colors.light.warning,
  },
  dangerText: {
    color: Colors.light.danger,
  },
  addButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  addButtonText: {
    color: Colors.light.cardBackground,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    textAlign: "center" as const,
    color: Colors.light.textSecondary,
    marginTop: 20,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  customerCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: "row" as const,
    marginBottom: 12,
  },
  customerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  customerCode: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  customerContact: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  customerFooter: {
    gap: 8,
  },
  creditInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  creditLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  creditValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  debtInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  debtLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  debtValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.danger,
  },
  availableInfo: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  availableLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  availableValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  negativeValue: {
    color: Colors.light.danger,
  },
});
