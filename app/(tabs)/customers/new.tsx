import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";

export default function NewCustomerScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  const nextCodeQuery = trpc.customers.getNextCode.useQuery({
    companyId: "company_1",
    branchId: "branch_1",
  });

  const createCustomerMutation = trpc.customers.createCustomer.useMutation({
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

  useEffect(() => {
    if (nextCodeQuery.data) {
      setCode(nextCodeQuery.data);
    }
  }, [nextCodeQuery.data]);

  const handleSave = () => {
    if (!code.trim()) {
      Alert.alert("Error", "El código de cliente es requerido");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "El nombre del cliente es requerido");
      return;
    }

    createCustomerMutation.mutate({
      code: code.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      creditLimit: parseFloat(creditLimit) || 0,
      companyId: "company_1",
      branchId: "branch_1",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Cliente</Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Código de Cliente <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="CLI-003"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Nombre de Cliente <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nombre completo o empresa"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="cliente@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Celular</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="8868-8888"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Dirección completa"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Límite de Crédito Aprobado</Text>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              value={creditLimit}
              onChangeText={setCreditLimit}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={createCustomerMutation.isPending}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveButton,
            createCustomerMutation.isPending && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={createCustomerMutation.isPending}
        >
          {createCustomerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cliente</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 8,
  },
  required: {
    color: "#FF3B30",
  },
  input: {
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: "top" as const,
  },
  footer: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#666",
  },
  saveButton: {
    flex: 1,
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
