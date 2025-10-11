import { handle } from "hono/vercel";
import app from "@/backend/hono";

// Fallback para rutas tRPC en Next.js/Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
