import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { Plus, Search, Filter, Upload, Package, AlertCircle, X, Edit2, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";

interface ProductForm {
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  stock: string;
  minStock: string;
  cost: string;
  price: string;
}

const emptyForm: ProductForm = {
  code: "",
  name: "",
  description: "",
  category: "",
  unit: "unidad",
  stock: "0",
  minStock: "0",
  cost: "0",
  price: "0",
};

export default function InventoryScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const companyId = "company_1";
  const branchId = "branch_1";

  const productsQuery = trpc.inventory.getProducts.useQuery({ companyId, branchId });
  const createMutation = trpc.inventory.createProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setShowModal(false);
      setForm(emptyForm);
      Alert.alert("Éxito", "Producto creado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const updateMutation = trpc.inventory.updateProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      Alert.alert("Éxito", "Producto actualizado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const deleteMutation = trpc.inventory.deleteProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      Alert.alert("Éxito", "Producto eliminado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const products = productsQuery.data || [];
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLowStock = (stock: number, minStock: number) => stock <= minStock;

  const handleOpenModal = (productId?: string) => {
    if (productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setEditingId(productId);
        setForm({
          code: product.code,
          name: product.name,
          description: product.description,
          category: product.category,
          unit: product.unit,
          stock: product.stock.toString(),
          minStock: product.minStock.toString(),
          cost: product.cost.toString(),
          price: product.price.toString(),
        });
      }
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.code || !form.name || !form.category) {
      Alert.alert("Error", "Por favor completa los campos obligatorios");
      return;
    }

    const data = {
      code: form.code,
      name: form.name,
      description: form.description,
      category: form.category,
      unit: form.unit,
      stock: parseFloat(form.stock) || 0,
      minStock: parseFloat(form.minStock) || 0,
      cost: parseFloat(form.cost) || 0,
      price: parseFloat(form.price) || 0,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate({ ...data, companyId, branchId });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
      ]
    );
  };

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
          <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal()}>
            <Plus size={20} color={Colors.light.cardBackground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {productsQuery.isLoading ? (
          <Text style={styles.loadingText}>Cargando productos...</Text>
        ) : filteredProducts.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos registrados</Text>
        ) : (
          filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productIcon}>
                  <Package size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSku}>Código: {product.code}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity onPress={() => handleOpenModal(product.id)} style={styles.actionButton}>
                    <Edit2 size={18} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(product.id)} style={styles.actionButton}>
                    <Trash2 size={18} color={Colors.light.danger} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.productFooter}>
                <View style={styles.stockContainer}>
                  {isLowStock(product.stock, product.minStock) && (
                    <AlertCircle size={16} color={Colors.light.danger} />
                  )}
                  <Text style={[
                    styles.stockText,
                    isLowStock(product.stock, product.minStock) && styles.lowStockText
                  ]}>
                    Stock: {product.stock} {product.unit}
                  </Text>
                </View>
                <Text style={styles.priceText}>${product.price.toFixed(2)}</Text>
              </View>
              {isLowStock(product.stock, product.minStock) && (
                <View style={styles.lowStockBanner}>
                  <Text style={styles.lowStockBannerText}>
                    Stock bajo - Mínimo: {product.minStock}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar Producto" : "Nuevo Producto"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Código *</Text>
              <TextInput
                style={styles.input}
                value={form.code}
                onChangeText={(text) => setForm({ ...form, code: text })}
                placeholder="Ej: TOR-001"
              />

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Ej: Tornillo 1/4 x 2"
              />

              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="Descripción del producto"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Categoría *</Text>
              <TextInput
                style={styles.input}
                value={form.category}
                onChangeText={(text) => setForm({ ...form, category: text })}
                placeholder="Ej: Tornillería"
              />

              <Text style={styles.label}>Unidad</Text>
              <TextInput
                style={styles.input}
                value={form.unit}
                onChangeText={(text) => setForm({ ...form, unit: text })}
                placeholder="Ej: unidad, kg, m"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={form.stock}
                    onChangeText={(text) => setForm({ ...form, stock: text })}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Stock Mínimo</Text>
                  <TextInput
                    style={styles.input}
                    value={form.minStock}
                    onChangeText={(text) => setForm({ ...form, minStock: text })}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Costo</Text>
                  <TextInput
                    style={styles.input}
                    value={form.cost}
                    onChangeText={(text) => setForm({ ...form, cost: text })}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Precio</Text>
                  <TextInput
                    style={styles.input}
                    value={form.price}
                    onChangeText={(text) => setForm({ ...form, price: text })}
                    keyboardType="numeric"
                    placeholder="0.00"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar"}
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
  loadingText: {
    textAlign: "center" as const,
    color: Colors.light.textSecondary,
    marginTop: 20,
  },
  emptyText: {
    textAlign: "center" as const,
    color: Colors.light.textSecondary,
    marginTop: 20,
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
  productActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
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
  row: {
    flexDirection: "row" as const,
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
