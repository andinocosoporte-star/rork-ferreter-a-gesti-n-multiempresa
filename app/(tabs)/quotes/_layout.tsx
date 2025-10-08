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
    </Stack>
  );
}
