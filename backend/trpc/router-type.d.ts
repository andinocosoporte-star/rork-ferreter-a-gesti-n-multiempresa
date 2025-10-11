export type AppRouter = {
  example: {
    hi: any;
  };
  inventory: {
    getProducts: any;
    createProduct: any;
    updateProduct: any;
    deleteProduct: any;
    getNextCode: any;
    exportProducts: any;
    importProducts: any;
    getTemplate: any;
  };
  sales: {
    getSales: any;
    createSale: any;
    getNextNumber: any;
  };
  quotes: {
    getQuotes: any;
    createQuote: any;
    updateQuoteStatus: any;
    getNextNumber: any;
  };
  customers: {
    getCustomers: any;
    createCustomer: any;
    getNextCode: any;
    getCustomerDetails: any;
    addPayment: any;
  };
  auth: {
    login: any;
    register: any;
    logout: any;
    getCurrentUser: any;
  };
};
