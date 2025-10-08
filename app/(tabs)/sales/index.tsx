import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Plus, Search, Filter, Calendar, DollarSign } from "lucide-react-native";
import React, { useState } from "react";

import Colors from "@/constants/colors";

interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: "completed" | "pending" | "cancelled";
}

const mockSales: Sale[] = [
  {
    id: "1",
    invoiceNumber: "VEN-001",
    customerName: "Juan Pérez",
    date: "2025-10-08",
    total: 1250.50,
    status: "completed",
  },
  {
    id: "2",
    invoiceNumber: "VEN-002",
    customerName: "María García",
    date: "2025-10-07",
    total: 890.00,
    status: "completed",
  },
  {
    id: "3",
    invoiceNumber: "VEN-003",
    customerName: "Carlos López",
    date: "2025-10-07",
    total: 2340.75,
    status: "pending",
  },
];

export default function SalesScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return Colors.light.success;
      case "pending":
        return Colors.light.warning;
      case "cancelled":
        return Colors.light.danger;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusText = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ventas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={Colors.light.cardBackground} />
            <Text style={styles.addButtonText}>Nueva Venta</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {mockSales.map((sale) => (
          <TouchableOpacity key={sale.id} style={styles.saleCard}>
            <View style={styles.saleHeader}>
              <View>
                <Text style={styles.invoiceNumber}>{sale.invoiceNumber}</Text>
                <Text style={styles.customerName}>{sale.customerName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sale.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(sale.status) }]}>
                  {getStatusText(sale.status)}
                </Text>
              </View>
            </View>
            <View style={styles.saleFooter}>
              <View style={styles.saleInfo}>
                <Calendar size={14} color={Colors.light.textSecondary} />
                <Text style={styles.saleInfoText}>{sale.date}</Text>
              </View>
              <View style={styles.saleInfo}>
                <DollarSign size={14} color={Colors.light.success} />
                <Text style={styles.totalText}>${sale.total.toFixed(2)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 12,
    marginBottom: 12,
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
  headerActions: {
    flexDirection: "row" as const,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  addButton: {
    flex: 2,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  addButtonText: {
    color: Colors.light.cardBackground,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  saleCard: {
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
  saleHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
  saleFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  saleInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  saleInfoText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
});
