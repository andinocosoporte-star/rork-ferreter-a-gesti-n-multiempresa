import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getProducts from "./routes/inventory/get-products/route";
import createProduct from "./routes/inventory/create-product/route";
import updateProduct from "./routes/inventory/update-product/route";
import deleteProduct from "./routes/inventory/delete-product/route";
import getSales from "./routes/sales/get-sales/route";
import createSale from "./routes/sales/create-sale/route";
import getQuotes from "./routes/quotes/get-quotes/route";
import createQuote from "./routes/quotes/create-quote/route";
import updateQuoteStatus from "./routes/quotes/update-quote-status/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  inventory: createTRPCRouter({
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  }),
  sales: createTRPCRouter({
    getSales,
    createSale,
  }),
  quotes: createTRPCRouter({
    getQuotes,
    createQuote,
    updateQuoteStatus,
  }),
});

export type AppRouter = typeof appRouter;
