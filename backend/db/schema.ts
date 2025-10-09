export type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  detailedDescription: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  companyId: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SaleItem = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
};

export type Sale = {
  id: string;
  saleNumber: string;
  date: Date;
  customerId?: string;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentType: 'cash' | 'credit';
  status: 'completed' | 'cancelled';
  notes: string;
  companyId: string;
  branchId: string;
  createdBy: string;
  createdAt: Date;
};

export type QuoteItem = {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  subtotal: number;
};

export type Quote = {
  id: string;
  quoteNumber: string;
  date: Date;
  validUntil: Date;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  notes: string;
  companyId: string;
  branchId: string;
  createdBy: string;
  createdAt: Date;
};

export type Customer = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  creditLimit: number;
  companyId: string;
  branchId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreditTransaction = {
  id: string;
  customerId: string;
  type: 'sale' | 'payment';
  saleId?: string;
  amount: number;
  balance: number;
  description: string;
  date: Date;
  companyId: string;
  branchId: string;
  createdBy: string;
  createdAt: Date;
};

export type InMemoryDB = {
  products: Product[];
  sales: Sale[];
  quotes: Quote[];
  customers: Customer[];
  creditTransactions: CreditTransaction[];
};

export const db: InMemoryDB = {
  products: [],
  sales: [],
  quotes: [],
  customers: [],
  creditTransactions: [],
};
