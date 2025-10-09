import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import Colors from "@/constants/colors";

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  mode = "date",
  minimumDate,
  maximumDate,
  placeholder = "Seleccionar fecha",
}: DatePickerProps) {
  const [show, setShow] = useState<boolean>(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return placeholder;
    }
    
    try {
      if (mode === "date") {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } else if (mode === "time") {
        return date.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        return date.toLocaleString("es-ES", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      console.error("[DatePicker] Error formatting date:", error);
      return placeholder;
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Calendar size={20} color={Colors.light.primary} />
        <Text style={styles.buttonText}>{formatDate(value)}</Text>
      </TouchableOpacity>

      {show && (
        <View>
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => setShow(false)}
            >
              <Text style={styles.doneButtonText}>Listo</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  button: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  doneButton: {
    backgroundColor: Colors.light.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center" as const,
    marginTop: 8,
  },
  doneButtonText: {
    color: Colors.light.cardBackground,
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
