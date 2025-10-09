import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import { Search, Plus, Phone, Mail, MapPin } from "lucide-react-native";

export default function CustomersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const customersQuery = trpc.customers.getCustomers.useQuery({
    companyId: "company-1",
    branchId: "branch-1",
    search,
  });

  const customers = customersQuery.data || [];

  const totalCustomers = customers.length;
  const customersWithCredit = customers.filter((c) => c.creditCount > 0).length;
  const totalDebt = customers.reduce((sum, c) => sum + c.currentDebt, 0);
  const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/customers/new")}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalCustomers}</Text>
          <Text style={styles.statLabel}>Clientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{customersWithCredit}</Text>
          <Text style={styles.statLabel}>Con Deudas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(totalDebt)}</Text>
          <Text style={styles.statLabel}>Total Deuda</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatCurrency(totalCreditLimit)}</Text>
          <Text style={styles.statLabel}>Límite Total</Text>
        </View>
      </View>

      {customersQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const percentUsed =
              item.creditLimit > 0
                ? (item.currentDebt / item.creditLimit) * 100
                : 0;

            return (
              <TouchableOpacity
                style={styles.customerCard}
                onPress={() => router.push(`/customers/${item.id}`)}
              >
                <View style={styles.customerHeader}>
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerId}>ID: {item.code}</Text>
                </View>

                <View style={styles.customerInfo}>
                  <View style={styles.infoRow}>
                    <Phone size={14} color="#666" />
                    <Text style={styles.infoText}>{item.phone}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Mail size={14} color="#666" />
                    <Text style={styles.infoText}>{item.email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MapPin size={14} color="#666" />
                    <Text style={styles.infoText}>{item.address}</Text>
                  </View>
                </View>

                {item.creditLimit > 0 && (
                  <View style={styles.creditSection}>
                    <View style={styles.creditHeader}>
                      <Text style={styles.creditTitle}>Línea de Crédito</Text>
                    </View>
                    <View style={styles.creditAmounts}>
                      <View style={styles.creditAmount}>
                        <Text style={styles.creditLabel}>Límite</Text>
                        <Text style={styles.creditValue}>
                          {formatCurrency(item.creditLimit)}
                        </Text>
                      </View>
                      <View style={styles.creditAmount}>
                        <Text style={styles.creditLabel}>Deuda Actual</Text>
                        <Text style={[styles.creditValue, styles.debtValue]}>
                          {formatCurrency(item.currentDebt)}
                        </Text>
                      </View>
                      <View style={styles.creditAmount}>
                        <Text style={styles.creditLabel}>Disponible</Text>
                        <Text style={[styles.creditValue, styles.availableValue]}>
                          {formatCurrency(item.available)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${Math.min(percentUsed, 100)}%`,
                            backgroundColor:
                              percentUsed > 90
                                ? "#FF3B30"
                                : percentUsed > 70
                                ? "#FF9500"
                                : "#34C759",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.percentText}>
                      {percentUsed.toFixed(1)}% utilizado
                    </Text>
                  </View>
                )}

                {item.creditCount > 0 && (
                  <View style={styles.actionsContainer}>
                    <Text style={styles.clientSince}>
                      Cliente desde: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => router.push(`/customers/${item.id}`)}
                      >
                        <Text style={styles.detailsButtonText}>Ver Detalles</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.paymentButton}
                        onPress={() => router.push(`/customers/${item.id}`)}
                      >
                        <Text style={styles.paymentButtonText}>Aplicar Abono</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay clientes registrados</Text>
              <Text style={styles.emptySubtext}>
                Presiona el botón + para agregar uno
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#000",
  },
  addButton: {
    width: 44,
    height: 44,
    backgroundColor: "#007AFF",
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  statsContainer: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
  },
  statCard: {
    flex: 1,
    alignItems: "center" as const,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center" as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  customerCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerHeader: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 4,
  },
  customerId: {
    fontSize: 14,
    color: "#666",
  },
  customerInfo: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  creditSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 16,
  },
  creditHeader: {
    marginBottom: 12,
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#000",
  },
  creditAmounts: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  creditAmount: {
    flex: 1,
  },
  creditLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  creditValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#000",
  },
  debtValue: {
    color: "#FF3B30",
  },
  availableValue: {
    color: "#34C759",
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    overflow: "hidden" as const,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  percentText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center" as const,
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 16,
    marginTop: 16,
  },
  clientSince: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    height: 36,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  paymentButton: {
    flex: 1,
    height: 36,
    backgroundColor: "#34C759",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  paymentButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  emptyContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
});
