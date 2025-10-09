import { Stack } from "expo-router";

export default function CustomersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Clientes",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "Nuevo Cliente",
          headerShown: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[customerId]"
        options={{
          title: "Detalles del Cliente",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
