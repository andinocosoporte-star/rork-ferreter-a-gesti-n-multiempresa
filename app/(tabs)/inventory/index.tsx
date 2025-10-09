import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus, Search, Download, Upload, Package, AlertCircle, X, FileDown } from "lucide-react-native";
import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ProductForm {
  code: string;
  name: string;
  description: string;
  detailedDescription: string;
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
  detailedDescription: "",
  category: "",
  unit: "unidad",
  stock: "0",
  minStock: "0",
  cost: "0",
  price: "0",
};



export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const companyId = "company_1";
  const branchId = "branch_1";

  const productsQuery = trpc.inventory.getProducts.useQuery({ companyId, branchId });
  const nextCodeQuery = trpc.inventory.getNextCode.useQuery({ companyId });
  const exportQuery = trpc.inventory.exportProducts.useQuery({ companyId, branchId }, { enabled: false });
  const templateQuery = trpc.inventory.getTemplate.useQuery(undefined, { enabled: false });

  const createMutation = trpc.inventory.createProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setShowModal(false);
      setForm(emptyForm);
      Alert.alert("Éxito", "Material creado correctamente");
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
      Alert.alert("Éxito", "Material actualizado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const deleteMutation = trpc.inventory.deleteProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      Alert.alert("Éxito", "Material eliminado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const importMutation = trpc.inventory.importProducts.useMutation({
    onSuccess: (result) => {
      productsQuery.refetch();
      const message = `Importados: ${result.success}/${result.total}\n${result.errors.length > 0 ? `\nErrores:\n${result.errors.slice(0, 5).join("\n")}` : ""}`;
      Alert.alert("Importación completada", message);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const products = productsQuery.data || [];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [products, searchQuery]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const lowStock = products.filter((p) => p.stock <= p.minStock).length;
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

    return { totalProducts, lowStock, totalValue };
  }, [products]);

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
          detailedDescription: product.detailedDescription,
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
      const nextCode = nextCodeQuery.data || "MAT-001";
      setForm({ ...emptyForm, code: nextCode });
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
      detailedDescription: form.detailedDescription,
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
      "¿Estás seguro de eliminar este material?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate({ id }) },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const result = await exportQuery.refetch();
      if (!result.data) return;

      const { csv, filename } = result.data;

      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(fileUri);
      }

      Alert.alert("Éxito", "Inventario exportado correctamente");
    } catch {
      Alert.alert("Error", "No se pudo exportar el inventario");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const result = await templateQuery.refetch();
      if (!result.data) return;

      const { csv, filename } = result.data;

      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, csv, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        await Sharing.shareAsync(fileUri);
      }

      Alert.alert("Éxito", "Plantilla descargada correctamente");
    } catch {
      Alert.alert("Error", "No se pudo descargar la plantilla");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const fileUri = result.assets[0].uri;
      let csvData: string;

      if (Platform.OS === "web") {
        const response = await fetch(fileUri);
        csvData = await response.text();
      } else {
        csvData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      }

      importMutation.mutate({ csvData, companyId, branchId });
    } catch {
      Alert.alert("Error", "No se pudo importar el archivo");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Productos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.dangerText]}>{stats.lowStock}</Text>
            <Text style={styles.statLabel}>Stock Bajo</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, styles.successText]}>€{stats.totalValue.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Valor Total</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <Download size={18} color="#10B981" />
            <Text style={styles.exportButtonText}>Exportar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.importButton} onPress={handleImport}>
            <Upload size={18} color={Colors.light.primary} />
            <Text style={styles.importButtonText}>Importar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.templateButton} onPress={handleDownloadTemplate}>
            <FileDown size={18} color="#8B5CF6" />
            <Text style={styles.templateButtonText}>Plantilla</Text>
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
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => handleOpenModal(product.id)}
            >
              <View style={styles.productHeader}>
                <View style={styles.productIcon}>
                  <Package size={24} color={Colors.light.primary} />
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productDescription}>{product.description}</Text>
                </View>
              </View>
              <View style={styles.productFooter}>
                <View style={styles.stockContainer}>
                  {isLowStock(product.stock, product.minStock) && (
                    <AlertCircle size={16} color={Colors.light.danger} />
                  )}
                  <Text
                    style={[
                      styles.stockText,
                      isLowStock(product.stock, product.minStock) && styles.lowStockText,
                    ]}
                  >
                    {product.stock} {product.unit}
                  </Text>
                  {isLowStock(product.stock, product.minStock) && (
                    <Text style={styles.minStockText}>Mín: {product.minStock}</Text>
                  )}
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.costLabel}>Costo:</Text>
                  <Text style={styles.costText}>€{product.cost.toFixed(2)}</Text>
                  <Text style={styles.priceLabel}>Precio:</Text>
                  <Text style={styles.priceText}>€{product.price.toFixed(2)}</Text>
                  <Text style={styles.marginText}>+{((product.price - product.cost) / product.cost * 100).toFixed(0)}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Editar Material" : "Nuevo Material"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Información del Material</Text>

              <Text style={styles.label}>Código de Material *</Text>
              <TextInput
                style={styles.input}
                value={form.code}
                onChangeText={(text) => setForm({ ...form, code: text })}
                placeholder="Ej: MAT-001"
                editable={!editingId}
              />

              <Text style={styles.label}>Descripción/Nombre *</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                placeholder="Nombre del material"
              />

              <Text style={styles.label}>Descripción Detallada</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.detailedDescription}
                onChangeText={(text) => setForm({ ...form, detailedDescription: text })}
                placeholder="Descripción detallada del material"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Unidad de Medida</Text>
              <TextInput
                style={styles.input}
                value={form.unit}
                onChangeText={(text) => setForm({ ...form, unit: text })}
                placeholder="Ej: unidad, saco, kg"
              />

              <Text style={styles.label}>Costo Promedio</Text>
              <TextInput
                style={styles.input}
                value={form.cost}
                onChangeText={(text) => setForm({ ...form, cost: text })}
                keyboardType="numeric"
                placeholder="0.00"
              />

              <Text style={styles.label}>Precio Sugerido</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(text) => setForm({ ...form, price: text })}
                keyboardType="numeric"
                placeholder="0.00"
              />

              <Text style={styles.label}>Categoría *</Text>
              <TextInput
                style={styles.input}
                value={form.category}
                onChangeText={(text) => setForm({ ...form, category: text })}
                placeholder="Ej: Construcción"
              />

              <Text style={styles.label}>Descripción (Breve)</Text>
              <TextInput
                style={styles.input}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="Descripción breve"
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
                  {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar Material"}
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
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
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
  dangerText: {
    color: Colors.light.danger,
  },
  successText: {
    color: Colors.light.success,
  },
  headerActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#10B98120",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  exportButtonText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  importButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary + "20",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  importButtonText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: "600" as const,
  },
  templateButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#8B5CF620",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  templateButtonText: {
    color: "#8B5CF6",
    fontSize: 13,
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
  productCategory: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  productFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
  },
  stockContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  stockText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  lowStockText: {
    color: Colors.light.danger,
  },
  minStockText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  priceContainer: {
    alignItems: "flex-end" as const,
  },
  costLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  costText: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  marginText: {
    fontSize: 11,
    color: Colors.light.success,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
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
