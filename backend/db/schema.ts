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
  products: [
    {
      id: "product_1",
      code: "MAT-001",
      name: "Cemento Portland Tipo I",
      description: "Cemento para construcción",
      detailedDescription: "Cemento Portland Tipo I de 42.5 kg",
      category: "Cemento",
      unit: "Bolsa",
      stock: 100,
      minStock: 20,
      cost: 25.50,
      price: 32.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_2",
      code: "MAT-002",
      name: "Varilla de Acero 1/2\"",
      description: "Varilla corrugada",
      detailedDescription: "Varilla de acero corrugada de 1/2 pulgada x 9 metros",
      category: "Acero",
      unit: "Unidad",
      stock: 250,
      minStock: 50,
      cost: 18.75,
      price: 24.50,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_3",
      code: "MAT-003",
      name: "Arena Fina",
      description: "Arena para construcción",
      detailedDescription: "Arena fina lavada para mezcla",
      category: "Agregados",
      unit: "m³",
      stock: 50,
      minStock: 10,
      cost: 45.00,
      price: 60.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_4",
      code: "MAT-004",
      name: "Ladrillo King Kong",
      description: "Ladrillo para muros",
      detailedDescription: "Ladrillo King Kong de arcilla 24x13x9 cm",
      category: "Ladrillos",
      unit: "Millar",
      stock: 30,
      minStock: 5,
      cost: 380.00,
      price: 480.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_5",
      code: "MAT-005",
      name: "Pintura Látex Blanco",
      description: "Pintura para interiores",
      detailedDescription: "Pintura látex lavable color blanco, galón",
      category: "Pinturas",
      unit: "Galón",
      stock: 75,
      minStock: 15,
      cost: 42.00,
      price: 55.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  sales: [],
  quotes: [],
  customers: [],
  creditTransactions: [],
};
