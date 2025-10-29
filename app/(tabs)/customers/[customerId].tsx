import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { UserCircle, CreditCard, DollarSign, Calendar, X } from "lucide-react-native";
import React, { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";

export default function CustomerDetailScreen() {
  const { customerId } = useLocalSearchParams<{ customerId: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentDescription, setPaymentDescription] = useState<string>("");

  const companyId = "company_1";
  const branchId = "branch_1";

  const customerQuery = trpc.customers.getCustomerDetails.useQuery({
    customerId: customerId || "",
  });

  const addPaymentMutation = trpc.customers.addPayment.useMutation({
    onSuccess: () => {
      customerQuery.refetch();
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentDescription("");
      Alert.alert("Éxito", "Pago registrado correctamente");
    },
    onError: (error: { message: string }) => {
      Alert.alert("Error", error.message);
    },
  });

  const customer = customerQuery.data?.customer;
  const currentDebt = customerQuery.data?.currentDebt || 0;
  const available = customerQuery.data?.available || 0;
  const transactions = customerQuery.data?.transactions || [];

  if (customerQuery.isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando detalles del cliente...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Cliente no encontrado</Text>
      </View>
    );
  }

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Por favor ingresa un monto válido");
      return;
    }

    if (amount > currentDebt) {
      Alert.alert("Error", "El monto no puede ser mayor a la deuda actual");
      return;
    }

    addPaymentMutation.mutate({
      customerId: customer.id,
      amount,
      description: paymentDescription || "Abono a cuenta",
      companyId,
      branchId,
      createdBy: "user_1",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.customerHeader}>
          <View style={styles.customerIcon}>
            <UserCircle size={48} color={Colors.light.primary} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerCode}>{customer.code}</Text>
            <Text style={styles.customerContact}>{customer.email}</Text>
            <Text style={styles.customerContact}>{customer.phone}</Text>
            {customer.address && (
              <Text style={styles.customerAddress}>{customer.address}</Text>
            )}
          </View>
        </View>

        <View style={styles.creditSection}>
          <View style={styles.creditCard}>
            <View style={styles.creditHeader}>
              <CreditCard size={24} color={Colors.light.primary} />
              <Text style={styles.creditTitle}>Estado de Cuenta</Text>
            </View>

            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>Límite de crédito</Text>
              <Text style={styles.creditValue}>€{customer.creditLimit.toFixed(2)}</Text>
            </View>

            <View style={styles.creditRow}>
              <Text style={styles.creditLabel}>Deuda actual</Text>
              <Text style={[styles.creditValue, styles.debtValue]}>
                €{currentDebt.toFixed(2)}
              </Text>
            </View>

            <View style={[styles.creditRow, styles.creditRowHighlight]}>
              <Text style={styles.creditLabelBold}>Crédito disponible</Text>
              <Text
                style={[
                  styles.creditValueBold,
                  available < 0 && styles.negativeValue,
                ]}
              >
                €{available.toFixed(2)}
              </Text>
            </View>

            {currentDebt > 0 && (
              <TouchableOpacity
                style={styles.paymentButton}
                onPress={() => setShowPaymentModal(true)}
              >
                <DollarSign size={20} color={Colors.light.cardBackground} />
                <Text style={styles.paymentButtonText}>Registrar Pago</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Historial de Transacciones</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay transacciones registradas</Text>
            </View>
          ) : (
            transactions.map((transaction: any) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View
                    style={[
                      styles.transactionIcon,
                      transaction.type === "payment"
                        ? styles.paymentIcon
                        : styles.saleIcon,
                    ]}
                  >
                    {transaction.type === "payment" ? (
                      <DollarSign size={16} color={Colors.light.success} />
                    ) : (
                      <CreditCard size={16} color={Colors.light.danger} />
                    )}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <View style={styles.transactionDate}>
                      <Calendar size={12} color={Colors.light.textSecondary} />
                      <Text style={styles.transactionDateText}>
                        {new Date(transaction.date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionAmounts}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.type === "payment"
                          ? styles.paymentAmount
                          : styles.saleAmount,
                      ]}
                    >
                      {transaction.type === "payment" ? "-" : "+"}€
                      {transaction.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionBalance}>
                      Saldo: €{transaction.balance.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Pago</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.debtInfo}>
                Deuda actual: €{currentDebt.toFixed(2)}
              </Text>

              <Text style={styles.label}>Monto del Pago *</Text>
              <TextInput
                style={styles.input}
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={paymentDescription}
                onChangeText={setPaymentDescription}
                placeholder="Abono a cuenta"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddPayment}
                disabled={addPaymentMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {addPaymentMutation.isPending ? "Guardando..." : "Registrar Pago"}
                </Text>
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
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingText: {
    textAlign: "center" as const,
    color: Colors.light.textSecondary,
    marginTop: 20,
  },
  errorText: {
    textAlign: "center" as const,
    color: Colors.light.danger,
    marginTop: 20,
  },
  customerHeader: {
    flexDirection: "row" as const,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  customerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 16,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  customerCode: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600" as const,
    marginBottom: 8,
  },
  customerContact: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  creditSection: {
    marginBottom: 24,
  },
  creditCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  creditHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 16,
    gap: 8,
  },
  creditTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  creditRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 8,
  },
  creditRowHighlight: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: 8,
    paddingTop: 12,
  },
  creditLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  creditValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  creditLabelBold: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  creditValueBold: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  debtValue: {
    color: Colors.light.danger,
  },
  negativeValue: {
    color: Colors.light.danger,
  },
  paymentButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 16,
    gap: 8,
  },
  paymentButtonText: {
    color: Colors.light.cardBackground,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 32,
    alignItems: "center" as const,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  transactionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  paymentIcon: {
    backgroundColor: Colors.light.success + "20",
  },
  saleIcon: {
    backgroundColor: Colors.light.danger + "20",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  transactionDate: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  transactionDateText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  transactionAmounts: {
    alignItems: "flex-end" as const,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginBottom: 2,
  },
  paymentAmount: {
    color: Colors.light.success,
  },
  saleAmount: {
    color: Colors.light.danger,
  },
  transactionBalance: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  debtInfo: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.danger,
    marginBottom: 16,
    textAlign: "center" as const,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top" as const,
  },
  modalFooter: {
    flexDirection: "row" as const,
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: "center" as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.cardBackground,
  },
});
