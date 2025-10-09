import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!baseUrl) {
    console.error("[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL is not set");
    console.error("[tRPC] Please create a .env file with EXPO_PUBLIC_RORK_API_BASE_URL=your-vercel-url");
    return "";
  }
  
  console.log("[tRPC] Base URL:", baseUrl);
  return baseUrl;
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
          const baseUrl = getBaseUrl();
          if (!baseUrl) {
            throw new Error("Backend URL no configurado. Por favor configura EXPO_PUBLIC_RORK_API_BASE_URL en tu archivo .env");
          }
          
          console.log("[tRPC] Making request to:", url);
          console.log("[tRPC] Request method:", options?.method);
          
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              "Content-Type": "application/json",
            },
          });
          
          console.log("[tRPC] Response status:", response.status);
          console.log("[tRPC] Response ok:", response.ok);
          
          if (!response.ok) {
            const text = await response.text();
            console.error("[tRPC] Response not OK:", response.status, text);
          }
          
          return response;
        } catch (error) {
          console.error("[tRPC] Network error:", error);
          if (error instanceof Error) {
            console.error("[tRPC] Error message:", error.message);
          }
          throw error;
        }
      },
    }),
  ],
});
