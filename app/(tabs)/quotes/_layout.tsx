import { Stack } from "expo-router";
import React from "react";

export default function QuotesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Cotizaciones",
        }}
      />
      <Stack.Screen
        name="[quoteId]"
        options={{
          title: "Detalle de Cotización",
        }}
      />
    </Stack>
  );
}
