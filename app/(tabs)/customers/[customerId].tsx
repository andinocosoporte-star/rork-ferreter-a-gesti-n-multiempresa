import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Phone, Mail, MapPin, ArrowLeft } from "lucide-react-native";

export default function CustomerDetailsScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");

  const detailsQuery = trpc.customers.getCustomerDetails.useQuery({
    customerId: customerId || "",
  });

  const addPaymentMutation = trpc.customers.addPayment.useMutation({
    onSuccess: () => {
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentDescription("");
      detailsQuery.refetch();
      Alert.alert("Éxito", "Abono aplicado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);

    if (!amount || amount <= 0) {
      Alert.alert("Error", "Ingrese un monto válido");
      return;
    }

    if (!paymentDescription.trim()) {
      Alert.alert("Error", "Ingrese una descripción");
      return;
    }

    addPaymentMutation.mutate({
      customerId: customerId || "",
      amount,
      description: paymentDescription.trim(),
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
    });
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    })}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (detailsQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!detailsQuery.data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Cliente no encontrado</Text>
      </View>
    );
  }

  const { customer, currentDebt, available, transactions, stats } = detailsQuery.data;
  const percentUsed =
    customer.creditLimit > 0 ? (currentDebt / customer.creditLimit) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Cliente</Text>
        </View>

        <View style={styles.customerCard}>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerId}>{customer.code}</Text>

          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Phone size={16} color="#666" />
              <Text style={styles.contactText}>{customer.phone}</Text>
            </View>
            <View style={styles.contactRow}>
              <Mail size={16} color="#666" />
              <Text style={styles.contactText}>{customer.email}</Text>
            </View>
            <View style={styles.contactRow}>
              <MapPin size={16} color="#666" />
              <Text style={styles.contactText}>{customer.address}</Text>
            </View>
          </View>

          <Text style={styles.clientSince}>
            Cliente desde: {formatDate(customer.createdAt)}
          </Text>
        </View>

        {customer.creditLimit > 0 && (
          <View style={styles.creditCard}>
            <View style={styles.creditHeader}>
              <Text style={styles.creditTitle}>Línea de Crédito</Text>
            </View>

            <View style={styles.creditAmounts}>
              <View style={styles.creditAmount}>
                <Text style={styles.creditLabel}>Límite</Text>
                <Text style={styles.creditValue}>
                  {formatCurrency(customer.creditLimit)}
                </Text>
              </View>
              <View style={styles.creditAmount}>
                <Text style={styles.creditLabel}>Deuda Actual</Text>
                <Text style={[styles.creditValue, styles.debtValue]}>
                  {formatCurrency(currentDebt)}
                </Text>
              </View>
              <View style={styles.creditAmount}>
                <Text style={styles.creditLabel}>Disponible</Text>
                <Text style={[styles.creditValue, styles.availableValue]}>
                  {formatCurrency(available)}
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

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Estado de Créditos</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.paid}</Text>
              <Text style={styles.statLabel}>Pagados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.overdueNumber]}>
                {stats.overdue}
              </Text>
              <Text style={styles.statLabel}>Vencidos</Text>
            </View>
          </View>
        </View>

        {currentDebt > 0 && (
          <View style={styles.activeCreditsCard}>
            <Text style={styles.activeCreditsTitle}>Créditos Activos</Text>
            <View style={styles.activeCreditsAmount}>
              <Text style={styles.activeCreditsValue}>
                {formatCurrency(currentDebt)}
              </Text>
              <Text style={styles.activeCreditsLabel}>Activo</Text>
            </View>
          </View>
        )}

        <View style={styles.transactionsCard}>
          <Text style={styles.transactionsTitle}>Historial de Transacciones</Text>
          {transactions.length === 0 ? (
            <Text style={styles.noTransactions}>
              No hay transacciones registradas
            </Text>
          ) : (
            transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionHeader}>
                  <View
                    style={[
                      styles.transactionBadge,
                      transaction.type === "sale"
                        ? styles.saleBadge
                        : styles.paymentBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.transactionBadgeText,
                        transaction.type === "sale"
                          ? styles.saleBadgeText
                          : styles.paymentBadgeText,
                      ]}
                    >
                      {transaction.type === "sale" ? "Venta" : "Abono"}
                    </Text>
                  </View>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <View style={styles.transactionAmounts}>
                  <View style={styles.transactionAmountItem}>
                    <Text style={styles.transactionAmountLabel}>Monto</Text>
                    <Text
                      style={[
                        styles.transactionAmountValue,
                        transaction.type === "sale"
                          ? styles.debtValue
                          : styles.availableValue,
                      ]}
                    >
                      {transaction.type === "sale" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmountItem}>
                    <Text style={styles.transactionAmountLabel}>Saldo</Text>
                    <Text style={styles.transactionAmountValue}>
                      {formatCurrency(transaction.balance)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {currentDebt > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.paymentButtonText}>Aplicar Abono</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aplicar Abono</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Monto del Abono</Text>
              <TextInput
                style={styles.modalInput}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
              <Text style={styles.modalHint}>
                Deuda actual: {formatCurrency(currentDebt)}
              </Text>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Descripción</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                value={paymentDescription}
                onChangeText={setPaymentDescription}
                placeholder="Ej: Abono a cuenta"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPaymentModal(false)}
                disabled={addPaymentMutation.isPending}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSaveButton,
                  addPaymentMutation.isPending && styles.modalSaveButtonDisabled,
                ]}
                onPress={handleAddPayment}
                disabled={addPaymentMutation.isPending}
              >
                {addPaymentMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveButtonText}>Aplicar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#000",
  },
  customerCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  customerName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 4,
  },
  customerId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  contactInfo: {
    gap: 12,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: "#666",
  },
  clientSince: {
    fontSize: 12,
    color: "#999",
  },
  creditCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creditHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  creditTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  creditAmounts: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  debtValue: {
    color: "#FF3B30",
  },
  availableValue: {
    color: "#34C759",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  percentText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center" as const,
  },
  statsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
  },
  statItem: {
    alignItems: "center" as const,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 4,
  },
  overdueNumber: {
    color: "#FF3B30",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  activeCreditsCard: {
    backgroundColor: "#FFF3CD",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  activeCreditsTitle: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 8,
  },
  activeCreditsAmount: {
    alignItems: "center" as const,
  },
  activeCreditsValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#856404",
    marginBottom: 4,
  },
  activeCreditsLabel: {
    fontSize: 14,
    color: "#856404",
  },
  transactionsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 16,
  },
  noTransactions: {
    fontSize: 14,
    color: "#999",
    textAlign: "center" as const,
    paddingVertical: 20,
  },
  transactionItem: {
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 16,
    marginTop: 16,
  },
  transactionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  transactionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saleBadge: {
    backgroundColor: "#FFE5E5",
  },
  paymentBadge: {
    backgroundColor: "#E5F5E5",
  },
  transactionBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  saleBadgeText: {
    color: "#FF3B30",
  },
  paymentBadgeText: {
    color: "#34C759",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionDescription: {
    fontSize: 14,
    color: "#000",
    marginBottom: 12,
  },
  transactionAmounts: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  transactionAmountItem: {
    flex: 1,
  },
  transactionAmountLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  transactionAmountValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  paymentButton: {
    height: 48,
    backgroundColor: "#34C759",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 20,
  },
  modalField: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  modalTextArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: "top" as const,
  },
  modalHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666",
  },
  modalSaveButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#34C759",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
