import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Plus, Search, Filter, Calendar, DollarSign, Download } from "lucide-react-native";
import React, { useState } from "react";

import Colors from "@/constants/colors";

interface Quote {
  id: string;
  quoteNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: "pending" | "approved" | "rejected" | "expired";
  validUntil: string;
}

const mockQuotes: Quote[] = [
  {
    id: "1",
    quoteNumber: "COT-001",
    customerName: "Juan Pérez",
    date: "2025-10-08",
    total: 1250.50,
    status: "pending",
    validUntil: "2025-10-15",
  },
  {
    id: "2",
    quoteNumber: "COT-002",
    customerName: "María García",
    date: "2025-10-07",
    total: 890.00,
    status: "approved",
    validUntil: "2025-10-14",
  },
  {
    id: "3",
    quoteNumber: "COT-003",
    customerName: "Carlos López",
    date: "2025-10-06",
    total: 2340.75,
    status: "pending",
    validUntil: "2025-10-13",
  },
];

export default function QuotesScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getStatusColor = (status: Quote["status"]) => {
    switch (status) {
      case "approved":
        return Colors.light.success;
      case "pending":
        return Colors.light.warning;
      case "rejected":
        return Colors.light.danger;
      case "expired":
        return Colors.light.textSecondary;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusText = (status: Quote["status"]) => {
    switch (status) {
      case "approved":
        return "Aprobada";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazada";
      case "expired":
        return "Expirada";
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
            placeholder="Buscar cotizaciones..."
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
            <Text style={styles.addButtonText}>Nueva Cotización</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {mockQuotes.map((quote) => (
          <TouchableOpacity key={quote.id} style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <View>
                <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
                <Text style={styles.customerName}>{quote.customerName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(quote.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(quote.status) }]}>
                  {getStatusText(quote.status)}
                </Text>
              </View>
            </View>
            <View style={styles.quoteBody}>
              <View style={styles.quoteInfo}>
                <Calendar size={14} color={Colors.light.textSecondary} />
                <Text style={styles.quoteInfoText}>Válida hasta: {quote.validUntil}</Text>
              </View>
            </View>
            <View style={styles.quoteFooter}>
              <View style={styles.quoteInfo}>
                <DollarSign size={14} color={Colors.light.success} />
                <Text style={styles.totalText}>${quote.total.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Download size={16} color={Colors.light.primary} />
                <Text style={styles.downloadText}>Descargar PDF</Text>
              </TouchableOpacity>
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
  quoteCard: {
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
  quoteHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 12,
  },
  quoteNumber: {
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
  quoteBody: {
    marginBottom: 12,
  },
  quoteFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  quoteInfo: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  quoteInfoText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  downloadButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.primary + "20",
    borderRadius: 8,
  },
  downloadText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
});
