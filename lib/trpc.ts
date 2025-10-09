import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => {
        return {
          "Content-Type": "application/json",
        };
      },
      fetch: async (url, options) => {
        try {
          console.log("[tRPC] Making request to:", url);
          console.log("[tRPC] Request options:", JSON.stringify(options, null, 2));
          
          const response = await fetch(url, options);
          console.log("[tRPC] Response status:", response.status);
          console.log("[tRPC] Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
          
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          console.log("[tRPC] Response body:", text.substring(0, 500));
          
          if (!response.ok) {
            console.error("[tRPC] Response not OK:", response.status, text);
          }
          
          return response;
        } catch (error) {
          console.error("[tRPC] Network error:", error);
          throw error;
        }
      },
    }),
  ],
});
