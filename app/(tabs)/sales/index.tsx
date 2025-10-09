import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Dimensions } from "react-native";
import { Plus, Calendar, DollarSign, X, Trash2, ShoppingCart, Search } from "lucide-react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";

interface SaleItem {
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

interface SaleForm {
  customerId?: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  paymentType: 'cash' | 'credit';
  notes: string;
}

const emptyForm: SaleForm = {
  customerId: undefined,
  customerName: "",
  customerDocument: "",
  customerPhone: "",
  customerEmail: "",
  paymentMethod: "efectivo",
  paymentType: "cash",
  notes: "",
};

export default function SalesScreen() {

  const [showModal, setShowModal] = useState<boolean>(false);
  const [showProductSelector, setShowProductSelector] = useState<boolean>(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState<boolean>(false);
  const [form, setForm] = useState<SaleForm>(emptyForm);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState<string>("");

  const companyId = "company_1";
  const branchId = "branch_1";
  const createdBy = "user_1";

  const salesQuery = trpc.sales.getSales.useQuery({ companyId, branchId });
  const productsQuery = trpc.inventory.getProducts.useQuery({ companyId, branchId });
  const customersQuery = trpc.customers.getCustomers.useQuery({ companyId, branchId });
  
  const createMutation = trpc.sales.createSale.useMutation({
    onSuccess: () => {
      salesQuery.refetch();
      productsQuery.refetch();
      setShowModal(false);
      setForm(emptyForm);
      setItems([]);
      Alert.alert("Éxito", "Venta registrada correctamente");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const sales = salesQuery.data || [];
  const products = productsQuery.data || [];
  const customers = customersQuery.data || [];
  
  console.log('[Sales] Sales count:', sales.length);
  console.log('[Sales] Products count:', products.length);
  console.log('[Sales] Customers count:', customers.length);
  


  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.code.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const selectCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    setForm({
      ...form,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
    });
    setShowCustomerSelector(false);
    setCustomerSearch("");
  };

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = items.find((i) => i.productId === productId);
    if (existingItem) {
      Alert.alert("Aviso", "Este producto ya está en la lista");
      return;
    }

    const newItem: SaleItem = {
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

  const updateItem = (index: number, field: keyof SaleItem, value: number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === "quantity") {
      if (value > item.availableStock) {
        Alert.alert("Error", `Stock insuficiente. Disponible: ${item.availableStock}`);
        return;
      }
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

    if (form.paymentType === 'credit' && !form.customerId) {
      Alert.alert("Error", "Para ventas a crédito debes seleccionar un cliente registrado");
      return;
    }

    const totals = calculateTotals();

    createMutation.mutate({
      ...form,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={20} color={Colors.light.cardBackground} />
          <Text style={styles.addButtonText}>Nueva Venta</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {salesQuery.isLoading ? (
          <Text style={styles.loadingText}>Cargando ventas...</Text>
        ) : sales.length === 0 ? (
          <Text style={styles.emptyText}>No hay ventas registradas</Text>
        ) : (
          sales.map((sale) => (
            <TouchableOpacity key={sale.id} style={styles.saleCard} onPress={() => router.push(`/sales/${sale.id}`)}>
              <View style={styles.saleHeader}>
                <View>
                  <Text style={styles.invoiceNumber}>{sale.saleNumber}</Text>
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
                  <Text style={styles.saleInfoText}>
                    {new Date(sale.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.saleInfo}>
                  <DollarSign size={14} color={Colors.light.success} />
                  <Text style={styles.totalText}>${sale.total.toFixed(2)}</Text>
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
              <Text style={styles.modalTitle}>Nueva Venta</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.sectionTitle}>Información del Cliente</Text>
              
              <TouchableOpacity
                style={styles.selectCustomerButton}
                onPress={() => setShowCustomerSelector(true)}
              >
                <Text style={styles.selectCustomerButtonText}>
                  {form.customerId ? "Cliente Seleccionado" : "Seleccionar Cliente Registrado"}
                </Text>
              </TouchableOpacity>

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

              <Text style={styles.label}>Tipo de Pago</Text>
              <View style={styles.paymentMethods}>
                {[{ value: "cash", label: "Efectivo" }, { value: "credit", label: "Crédito" }].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.paymentMethod,
                      form.paymentType === type.value && styles.paymentMethodActive,
                    ]}
                    onPress={() => setForm({ ...form, paymentType: type.value as 'cash' | 'credit' })}
                  >
                    <Text
                      style={[
                        styles.paymentMethodText,
                        form.paymentType === type.value && styles.paymentMethodTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Método de Pago</Text>
              <View style={styles.paymentMethods}>
                {["efectivo", "tarjeta", "transferencia"].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentMethod,
                      form.paymentMethod === method && styles.paymentMethodActive,
                    ]}
                    onPress={() => setForm({ ...form, paymentMethod: method })}
                  >
                    <Text
                      style={[
                        styles.paymentMethodText,
                        form.paymentMethod === method && styles.paymentMethodTextActive,
                      ]}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                  {createMutation.isPending ? "Guardando..." : "Registrar Venta"}
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

      <Modal visible={showCustomerSelector} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.productSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
              <TouchableOpacity onPress={() => setShowCustomerSelector(false)}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar clientes..."
                value={customerSearch}
                onChangeText={setCustomerSearch}
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <ScrollView style={styles.productList}>
              {filteredCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.productItem}
                  onPress={() => selectCustomer(customer.id)}
                >
                  <View>
                    <Text style={styles.productItemName}>{customer.name}</Text>
                    <Text style={styles.productItemCode}>Código: {customer.code}</Text>
                    <Text style={styles.productItemStock}>
                      Crédito disponible: ${customer.available.toFixed(2)}
                    </Text>
                  </View>
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
  paymentMethods: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 8,
  },
  paymentMethod: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center" as const,
  },
  paymentMethodActive: {
    backgroundColor: Colors.light.primary + "20",
    borderColor: Colors.light.primary,
  },
  paymentMethodText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  paymentMethodTextActive: {
    color: Colors.light.primary,
    fontWeight: "600" as const,
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
  selectCustomerButton: {
    backgroundColor: Colors.light.info + "20",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.light.info,
  },
  selectCustomerButtonText: {
    color: Colors.light.info,
    fontSize: 14,
    fontWeight: "600" as const,
  },
});
