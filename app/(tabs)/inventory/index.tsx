import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Plus, Search, Filter, Upload, Package, AlertCircle } from "lucide-react-native";
import React, { useState } from "react";

import Colors from "@/constants/colors";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  unit: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    sku: "TOR-001",
    name: "Tornillo 1/4 x 2\"",
    category: "Tornillería",
    stock: 150,
    minStock: 50,
    price: 0.25,
    unit: "unidad",
  },
  {
    id: "2",
    sku: "CEM-001",
    name: "Cemento Gris 50kg",
    category: "Construcción",
    stock: 25,
    minStock: 30,
    price: 8.50,
    unit: "saco",
  },
  {
    id: "3",
    sku: "PIN-001",
    name: "Pintura Blanca 1 Galón",
    category: "Pinturas",
    stock: 45,
    minStock: 20,
    price: 15.99,
    unit: "galón",
  },
  {
    id: "4",
    sku: "TUB-001",
    name: "Tubo PVC 1/2\" x 3m",
    category: "Plomería",
    stock: 80,
    minStock: 40,
    price: 3.75,
    unit: "unidad",
  },
];

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const isLowStock = (product: Product) => product.stock <= product.minStock;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton}>
            <Upload size={20} color={Colors.light.primary} />
            <Text style={styles.uploadButtonText}>Importar CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={Colors.light.cardBackground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {mockProducts.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard}>
            <View style={styles.productHeader}>
              <View style={styles.productIcon}>
                <Package size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>SKU: {product.sku}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
              </View>
            </View>
            <View style={styles.productFooter}>
              <View style={styles.stockContainer}>
                {isLowStock(product) && (
                  <AlertCircle size={16} color={Colors.light.danger} />
                )}
                <Text style={[
                  styles.stockText,
                  isLowStock(product) && styles.lowStockText
                ]}>
                  Stock: {product.stock} {product.unit}
                </Text>
              </View>
              <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
            </View>
            {isLowStock(product) && (
              <View style={styles.lowStockBanner}>
                <Text style={styles.lowStockBannerText}>
                  Stock bajo - Mínimo: {product.minStock}
                </Text>
              </View>
            )}
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
  uploadButton: {
    flex: 2,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary + "20",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  addButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  productCard: {
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
  productHeader: {
    flexDirection: "row" as const,
    marginBottom: 12,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  productFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  stockContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  stockText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  lowStockText: {
    color: Colors.light.danger,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  lowStockBanner: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.danger + "20",
    borderRadius: 8,
  },
  lowStockBannerText: {
    fontSize: 12,
    color: Colors.light.danger,
    fontWeight: "600" as const,
  },
});
