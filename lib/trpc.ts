import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

  if (!baseUrl) {
    // Return empty string to allow the consumer to handle missing URL.
    return "";
  }

  return baseUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: async () => {
        // Attach Authorization header from AsyncStorage when available.
        try {
          const token = await AsyncStorage.getItem("@auth_token");
          const base: Record<string, string> = { "Content-Type": "application/json" };
          if (token) {
            return { ...base, Authorization: `Bearer ${token}` };
          }
          return base;
        } catch (e) {
          // If storage fails, return minimal headers — do not throw.
          return { "Content-Type": "application/json" };
        }
      },
    }),
  ],
});
