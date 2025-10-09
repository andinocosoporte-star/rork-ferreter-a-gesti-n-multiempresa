import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getProducts from "./routes/inventory/get-products/route";
import createProduct from "./routes/inventory/create-product/route";
import updateProduct from "./routes/inventory/update-product/route";
import deleteProduct from "./routes/inventory/delete-product/route";
import getNextCode from "./routes/inventory/get-next-code/route";
import exportProducts from "./routes/inventory/export-products/route";
import importProducts from "./routes/inventory/import-products/route";
import getTemplate from "./routes/inventory/get-template/route";
import getSales from "./routes/sales/get-sales/route";
import createSale from "./routes/sales/create-sale/route";
import getQuotes from "./routes/quotes/get-quotes/route";
import createQuote from "./routes/quotes/create-quote/route";
import updateQuoteStatus from "./routes/quotes/update-quote-status/route";
import { getCustomersProcedure } from "./routes/customers/get-customers/route";
import { createCustomerProcedure } from "./routes/customers/create-customer/route";
import { getNextCustomerCodeProcedure } from "./routes/customers/get-next-code/route";
import { getCustomerDetailsProcedure } from "./routes/customers/get-customer-details/route";
import { addPaymentProcedure } from "./routes/customers/add-payment/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  inventory: createTRPCRouter({
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getNextCode,
    exportProducts,
    importProducts,
    getTemplate,
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
  customers: createTRPCRouter({
    getCustomers: getCustomersProcedure,
    createCustomer: createCustomerProcedure,
    getNextCode: getNextCustomerCodeProcedure,
    getCustomerDetails: getCustomerDetailsProcedure,
    addPayment: addPaymentProcedure,
  }),
});

export type AppRouter = typeof appRouter;
