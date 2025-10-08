import { Stack } from "expo-router";
import React from "react";

export default function InventoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Inventario",
        }}
      />
    </Stack>
  );
}
