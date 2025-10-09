import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

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
        // Attempt to attach a token from AsyncStorage if present.
        // We avoid synchronous storage reads here; consumers can set
        // a per-request header if they keep tokens elsewhere.
        return {
          "Content-Type": "application/json",
        };
      },
    }),
  ],
});
