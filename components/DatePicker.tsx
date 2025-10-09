import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react-native";
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

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());

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

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDateSelect = (date: Date | null) => {
    if (!date) return;

    if (minimumDate && date < minimumDate) return;
    if (maximumDate && date > maximumDate) return;

    onChange(date);
    setShow(false);
  };

  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true;
    if (minimumDate && date < minimumDate) return true;
    if (maximumDate && date > maximumDate) return true;
    return false;
  };

  const isDateSelected = (date: Date | null): boolean => {
    if (!value || !date) return false;
    return (
      date.getDate() === value.getDate() &&
      date.getMonth() === value.getMonth() &&
      date.getFullYear() === value.getFullYear()
    );
  };

  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.button} onPress={() => setShow(true)}>
        <Calendar size={20} color={Colors.light.primary} />
        <Text style={styles.buttonText}>{formatDate(value)}</Text>
      </TouchableOpacity>

      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={() => setShow(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShow(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShow(false)}
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.navigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handlePreviousMonth}
              >
                <ChevronLeft size={24} color={Colors.light.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNextMonth}
              >
                <ChevronRight size={24} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.daysHeader}>
              {DAYS.map((day) => (
                <Text key={day} style={styles.dayHeaderText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {days.map((date, index) => {
                const isEmpty = date === null;
                const disabled = isDateDisabled(date);
                const selected = isDateSelected(date);
                const today = isToday(date);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      selected && styles.dayCellSelected,
                      today && !selected && styles.dayCellToday,
                    ]}
                    onPress={() => handleDateSelect(date)}
                    disabled={isEmpty || disabled}
                  >
                    {!isEmpty && date && (
                      <Text
                        style={[
                          styles.dayText,
                          disabled && styles.dayTextDisabled,
                          selected && styles.dayTextSelected,
                          today && !selected && styles.dayTextToday,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get("window");
const calendarWidth = Math.min(width - 40, 400);

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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  modalContent: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    width: calendarWidth,
    maxWidth: 400,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  navigation: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
  },
  daysHeader: {
    flexDirection: "row" as const,
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center" as const,
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  daysGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 4,
  },
  dayCellSelected: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  dayTextDisabled: {
    color: Colors.light.textSecondary,
    opacity: 0.3,
  },
  dayTextSelected: {
    color: Colors.light.cardBackground,
    fontWeight: "700" as const,
  },
  dayTextToday: {
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
});
