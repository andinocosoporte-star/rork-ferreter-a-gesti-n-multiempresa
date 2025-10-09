import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft, Download, Calendar, DollarSign, User, CreditCard } from "lucide-react-native";
import React from "react";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";

export default function SaleDetailScreen() {
  const { saleId } = useLocalSearchParams<{ saleId: string }>();
  const companyId = "company_1";
  const branchId = "branch_1";

  const salesQuery = trpc.sales.getSales.useQuery({ companyId, branchId });
  const sale = salesQuery.data?.find((s) => s.id === saleId);

  if (!sale) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle de Venta</Text>
          <View style={{ width: 40 }}></View>
        </View>
        <View style={styles.content}>
          <Text style={styles.emptyText}>Venta no encontrada</Text>
        </View>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.light.success;
      case "cancelled":
        return Colors.light.danger;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const handleDownloadPDF = () => {
    Alert.alert("Descargar PDF", "Funcionalidad de descarga PDF próximamente");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Venta</Text>
        <TouchableOpacity onPress={handleDownloadPDF} style={styles.downloadButton}>
          <Download size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.saleNumber}>{sale.saleNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sale.status) + "20" }]}>
              <Text style={[styles.statusText, { color: getStatusColor(sale.status) }]}>
                {getStatusText(sale.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.light.textSecondary} />
            <Text style={styles.infoText}>
              {new Date(sale.date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>
          <View style={styles.infoRow}>
            <User size={16} color={Colors.light.textSecondary} />
            <Text style={styles.infoText}>{sale.customerName}</Text>
          </View>
          {sale.customerEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoText}>{sale.customerEmail}</Text>
            </View>
          )}
          {sale.customerPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono:</Text>
              <Text style={styles.infoText}>{sale.customerPhone}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {sale.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemCode}>Código: {item.productCode}</Text>
                <Text style={styles.itemDetails}>
                  {item.quantity} {item.unit} × ${item.unitPrice.toFixed(2)}
                  {item.discount > 0 && ` (-${item.discount}%)`}
                </Text>
              </View>
              <Text style={styles.itemTotal}>${item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pago</Text>
          <View style={styles.infoRow}>
            <CreditCard size={16} color={Colors.light.textSecondary} />
            <Text style={styles.infoText}>
              {sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoText}>
              {sale.paymentType === "cash" ? "Efectivo" : "Crédito"}
            </Text>
          </View>
        </View>

        <View style={styles.totalsCard}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${sale.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IGV (18%):</Text>
            <Text style={styles.totalValue}>${sale.tax.toFixed(2)}</Text>
          </View>
          {sale.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuento:</Text>
              <Text style={[styles.totalValue, { color: Colors.light.danger }]}>
                -${sale.discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.totalRowFinal]}>
            <Text style={styles.totalLabelFinal}>Total:</Text>
            <Text style={styles.totalValueFinal}>${sale.total.toFixed(2)}</Text>
          </View>
        </View>

        {sale.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notesText}>{sale.notes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  downloadButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  emptyText: {
    textAlign: "center" as const,
    color: Colors.light.textSecondary,
    marginTop: 20,
  },
  card: {
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
  cardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  saleNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  itemRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  totalsCard: {
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  totalLabelFinal: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  totalValueFinal: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
