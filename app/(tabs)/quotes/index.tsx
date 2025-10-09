import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Dimensions } from "react-native";
import { Plus, Calendar, DollarSign, Download, X, Trash2, ShoppingCart, Search } from "lucide-react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";
import DatePicker from "@/components/DatePicker";

interface QuoteItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
  availableStock: number;
}

interface QuoteForm {
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  date: Date;
  validUntil: Date;
  notes: string;
}

const emptyForm: QuoteForm = {
  customerName: "",
  customerDocument: "",
  customerPhone: "",
  customerEmail: "",
  date: new Date(),
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  notes: "",
};

export default function QuotesScreen() {

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showProductSelector, setShowProductSelector] = useState<boolean>(false);
  const [form, setForm] = useState<QuoteForm>(emptyForm);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>("");

  const companyId = "company_1";
  const branchId = "branch_1";
  const createdBy = "user_1";

  const quotesQuery = trpc.quotes.getQuotes.useQuery({ companyId, branchId });
  const productsQuery = trpc.inventory.getProducts.useQuery({ companyId, branchId });
  
  const createMutation = trpc.quotes.createQuote.useMutation({
    onSuccess: () => {
      quotesQuery.refetch();
      setShowModal(false);
      setForm(emptyForm);
      setItems([]);
      Alert.alert("Éxito", "Cotización creada correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const updateStatusMutation = trpc.quotes.updateQuoteStatus.useMutation({
    onSuccess: () => {
      quotesQuery.refetch();
      Alert.alert("Éxito", "Estado actualizado correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const quotes = quotesQuery.data || [];
  const products = productsQuery.data || [];
  
  console.log('[Quotes] Quotes count:', quotes.length);
  console.log('[Quotes] Products count:', products.length);
  


  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = items.find((i) => i.productId === productId);
    if (existingItem) {
      Alert.alert("Aviso", "Este producto ya está en la lista");
      return;
    }

    const newItem: QuoteItem = {
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      quantity: 1,
      unit: product.unit,
      unitPrice: product.price,
      discount: 0,
      subtotal: product.price,
      availableStock: product.stock,
    };

    setItems([...items, newItem]);
    setShowProductSelector(false);
    setProductSearch("");
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === "quantity") {
      item.quantity = value;
    } else if (field === "unitPrice") {
      item.unitPrice = value;
    } else if (field === "discount") {
      if (value > 100) value = 100;
      if (value < 0) value = 0;
      item.discount = value;
    }

    const priceAfterDiscount = item.unitPrice * (1 - item.discount / 100);
    item.subtotal = priceAfterDiscount * item.quantity;

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    return { subtotal, tax, total, discount: 0 };
  };

  const handleSave = () => {
    if (!form.customerName) {
      Alert.alert("Error", "Por favor ingresa el nombre del cliente");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Error", "Por favor agrega al menos un producto");
      return;
    }

    const totals = calculateTotals();

    createMutation.mutate({
      ...form,
      date: form.date,
      validUntil: form.validUntil,
      items: items.map((item) => ({
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      companyId,
      branchId,
      createdBy,
    });
  };

  const totals = calculateTotals();

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={20} color={Colors.light.cardBackground} />
          <Text style={styles.addButtonText}>Nueva Cotización</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {quotesQuery.isLoading ? (
          <Text style={styles.loadingText}>Cargando cotizaciones...</Text>
        ) : quotes.length === 0 ? (
          <Text style={styles.emptyText}>No hay cotizaciones registradas</Text>
        ) : (
          quotes.map((quote) => (
            <TouchableOpacity key={quote.id} style={styles.quoteCard} onPress={() => router.push(`/quotes/${quote.id}`)}>
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
                  <Text style={styles.quoteInfoText}>
                    Válida hasta: {quote.validUntil instanceof Date 
                      ? quote.validUntil.toLocaleDateString()
                      : new Date(quote.validUntil).toLocaleDateString()}
                  </Text>
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
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Cotización</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Información de la Cotización</Text>
              
              <DatePicker
                label="Fecha de Cotización *"
                value={form.date}
                onChange={(date) => setForm({ ...form, date })}
                mode="date"
              />

              <DatePicker
                label="Válida hasta *"
                value={form.validUntil}
                onChange={(date) => setForm({ ...form, validUntil: date })}
                mode="date"
                minimumDate={form.date}
              />

              <Text style={styles.sectionTitle}>Información del Cliente</Text>
              
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={form.customerName}
                onChangeText={(text) => setForm({ ...form, customerName: text })}
                placeholder="Nombre del cliente"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Documento</Text>
                  <TextInput
                    style={styles.input}
                    value={form.customerDocument}
                    onChangeText={(text) => setForm({ ...form, customerDocument: text })}
                    placeholder="DNI/RUC"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Teléfono</Text>
                  <TextInput
                    style={styles.input}
                    value={form.customerPhone}
                    onChangeText={(text) => setForm({ ...form, customerPhone: text })}
                    placeholder="Teléfono"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.customerEmail}
                onChangeText={(text) => setForm({ ...form, customerEmail: text })}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
              />

              <Text style={styles.sectionTitle}>Productos</Text>
              
              <TouchableOpacity
                style={styles.addProductButton}
                onPress={() => setShowProductSelector(true)}
              >
                <ShoppingCart size={20} color={Colors.light.primary} />
                <Text style={styles.addProductButtonText}>Agregar Producto</Text>
              </TouchableOpacity>

              {items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <TouchableOpacity onPress={() => removeItem(index)}>
                      <Trash2 size={18} color={Colors.light.danger} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemCode}>Código: {item.productCode}</Text>
                  <Text style={styles.itemStock}>Stock disponible: {item.availableStock}</Text>
                  
                  <View style={styles.itemRow}>
                    <View style={styles.itemField}>
                      <Text style={styles.itemLabel}>Cantidad</Text>
                      <TextInput
                        style={styles.itemInput}
                        value={item.quantity.toString()}
                        onChangeText={(text) => updateItem(index, "quantity", parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.itemLabel}>Precio Unit.</Text>
                      <TextInput
                        style={styles.itemInput}
                        value={item.unitPrice.toString()}
                        onChangeText={(text) => updateItem(index, "unitPrice", parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.itemField}>
                      <Text style={styles.itemLabel}>Desc. %</Text>
                      <TextInput
                        style={styles.itemInput}
                        value={item.discount.toString()}
                        onChangeText={(text) => updateItem(index, "discount", parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <Text style={styles.itemSubtotal}>Subtotal: ${item.subtotal.toFixed(2)}</Text>
                </View>
              ))}

              <View style={styles.totalsCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>${totals.subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IGV (18%):</Text>
                  <Text style={styles.totalValue}>${totals.tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowFinal]}>
                  <Text style={styles.totalLabelFinal}>Total:</Text>
                  <Text style={styles.totalValueFinal}>${totals.total.toFixed(2)}</Text>
                </View>
              </View>

              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
                placeholder="Notas adicionales"
                multiline
                numberOfLines={3}
              />
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
                disabled={createMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {createMutation.isPending ? "Guardando..." : "Crear Cotización"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showProductSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.productSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Producto</Text>
              <TouchableOpacity onPress={() => setShowProductSelector(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                value={productSearch}
                onChangeText={setProductSearch}
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <ScrollView style={styles.productList}>
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productItem}
                  onPress={() => addProduct(product.id)}
                >
                  <View>
                    <Text style={styles.productItemName}>{product.name}</Text>
                    <Text style={styles.productItemCode}>Código: {product.code}</Text>
                    <Text style={styles.productItemStock}>Stock: {product.stock} {product.unit}</Text>
                  </View>
                  <Text style={styles.productItemPrice}>${product.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
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
    paddingBottom: 100,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "95%",
    width: isTablet ? "80%" : "100%",
    alignSelf: "center" as const,
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
    marginTop: 16,
    marginBottom: 12,
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
  addProductButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary + "20",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  addProductButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  itemCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  itemHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  itemCode: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  itemStock: {
    fontSize: 12,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 8,
  },
  itemField: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  itemInput: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 6,
    padding: 8,
    fontSize: 13,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.success,
    textAlign: "right" as const,
  },
  totalsCard: {
    backgroundColor: Colors.light.primary + "10",
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
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
  productSelectorModal: {
    backgroundColor: Colors.light.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    width: isTablet ? "70%" : "100%",
    alignSelf: "center" as const,
  },
  productList: {
    padding: 16,
  },
  productItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productItemName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  productItemCode: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  productItemStock: {
    fontSize: 12,
    color: Colors.light.primary,
  },
  productItemPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
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
});
