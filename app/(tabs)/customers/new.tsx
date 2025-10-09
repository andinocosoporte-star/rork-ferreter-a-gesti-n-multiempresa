import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import Colors from "@/constants/colors";

interface CustomerForm {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: string;
}

const emptyForm: CustomerForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  creditLimit: "0",
};

export default function NewCustomerScreen() {
  const router = useRouter();
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const companyId = "company_1";
  const branchId = "branch_1";

  const nextCodeQuery = trpc.customers.getNextCode.useQuery({ companyId, branchId });

  React.useEffect(() => {
    if (nextCodeQuery.data && !form.code) {
      setForm((prev) => ({ ...prev, code: nextCodeQuery.data }));
    }
  }, [nextCodeQuery.data]);

  const createMutation = trpc.customers.createCustomer.useMutation({
    onSuccess: () => {
      Alert.alert("Éxito", "Cliente creado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSave = () => {
    if (!form.code || !form.name || !form.email || !form.phone) {
      Alert.alert("Error", "Por favor completa los campos obligatorios");
      return;
    }

    createMutation.mutate({
      code: form.code,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      creditLimit: parseFloat(form.creditLimit) || 0,
      companyId,
      branchId,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Información del Cliente</Text>

        <Text style={styles.label}>Código de Cliente *</Text>
        <TextInput
          style={styles.input}
          value={form.code}
          onChangeText={(text) => setForm({ ...form, code: text })}
          placeholder="Ej: CLI-001"
          editable={false}
        />

        <Text style={styles.label}>Nombre Completo *</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholder="Nombre del cliente"
        />

        <Text style={styles.label}>Correo Electrónico *</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="correo@ejemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          placeholder="+34 123 456 789"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
          placeholder="Dirección completa"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Límite de Crédito</Text>
        <TextInput
          style={styles.input}
          value={form.creditLimit}
          onChangeText={(text) => setForm({ ...form, creditLimit: text })}
          placeholder="0.00"
          keyboardType="numeric"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={createMutation.isPending}
        >
          <Text style={styles.saveButtonText}>
            {createMutation.isPending ? "Guardando..." : "Guardar Cliente"}
          </Text>
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 18,
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
    backgroundColor: Colors.light.cardBackground,
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
  footer: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.cardBackground,
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
