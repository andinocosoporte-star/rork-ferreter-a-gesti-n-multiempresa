import { handle } from "hono/vercel";
import app from "@/backend/hono";

// export const runtime = "edge"; // Eliminado para usar Node.js tradicional

// Exporta todos los métodos HTTP que usará tu Hono app
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
