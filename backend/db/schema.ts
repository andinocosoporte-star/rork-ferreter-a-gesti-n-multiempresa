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

export type Company = {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Branch = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  roleId: string;
  companyId: string;
  branchId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthSession = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

export type InMemoryDB = {
  products: Product[];
  sales: Sale[];
  quotes: Quote[];
  customers: Customer[];
  creditTransactions: CreditTransaction[];
  companies: Company[];
  branches: Branch[];
  roles: Role[];
  users: User[];
  authSessions: AuthSession[];
};

export const db: InMemoryDB = {
  products: [
    {
      id: "product_1",
      code: "MAT-0001",
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
      code: "MAT-0002",
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
      code: "MAT-0003",
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
      code: "MAT-0004",
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
      code: "MAT-0005",
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
    {
      id: "product_6",
      code: "MAT-0006",
      name: "Grava Triturada",
      description: "Grava para concreto",
      detailedDescription: "Grava triturada de 3/4 pulgada para mezcla de concreto",
      category: "Agregados",
      unit: "m³",
      stock: 40,
      minStock: 8,
      cost: 50.00,
      price: 65.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_7",
      code: "MAT-0007",
      name: "Varilla de Acero 3/8\"",
      description: "Varilla corrugada",
      detailedDescription: "Varilla de acero corrugada de 3/8 pulgada x 9 metros",
      category: "Acero",
      unit: "Unidad",
      stock: 300,
      minStock: 60,
      cost: 12.50,
      price: 16.75,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_8",
      code: "MAT-0008",
      name: "Bloque de Concreto 15x20x40",
      description: "Bloque para construcción",
      detailedDescription: "Bloque de concreto hueco 15x20x40 cm",
      category: "Bloques",
      unit: "Unidad",
      stock: 500,
      minStock: 100,
      cost: 1.20,
      price: 1.65,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_9",
      code: "MAT-0009",
      name: "Alambre de Amarre #16",
      description: "Alambre para construcción",
      detailedDescription: "Alambre de amarre calibre 16, rollo de 1 kg",
      category: "Acero",
      unit: "Rollo",
      stock: 150,
      minStock: 30,
      cost: 3.50,
      price: 4.75,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_10",
      code: "MAT-0010",
      name: "Pintura Esmalte Azul",
      description: "Pintura para exteriores",
      detailedDescription: "Pintura esmalte sintético color azul, galón",
      category: "Pinturas",
      unit: "Galón",
      stock: 45,
      minStock: 10,
      cost: 48.00,
      price: 62.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_11",
      code: "MAT-0011",
      name: "Tubo PVC 1/2\" x 6m",
      description: "Tubería para agua",
      detailedDescription: "Tubo PVC presión 1/2 pulgada x 6 metros",
      category: "Plomería",
      unit: "Unidad",
      stock: 120,
      minStock: 25,
      cost: 8.50,
      price: 11.50,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_12",
      code: "MAT-0012",
      name: "Codo PVC 1/2\"",
      description: "Accesorio de plomería",
      detailedDescription: "Codo PVC 90 grados de 1/2 pulgada",
      category: "Plomería",
      unit: "Unidad",
      stock: 200,
      minStock: 40,
      cost: 0.45,
      price: 0.75,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_13",
      code: "MAT-0013",
      name: "Cable Eléctrico #12 AWG",
      description: "Cable para instalaciones eléctricas",
      detailedDescription: "Cable eléctrico calibre 12 AWG, rollo de 100 metros",
      category: "Electricidad",
      unit: "Rollo",
      stock: 60,
      minStock: 12,
      cost: 85.00,
      price: 110.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_14",
      code: "MAT-0014",
      name: "Interruptor Simple",
      description: "Interruptor eléctrico",
      detailedDescription: "Interruptor simple 15A 120V color blanco",
      category: "Electricidad",
      unit: "Unidad",
      stock: 180,
      minStock: 35,
      cost: 2.80,
      price: 4.20,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "product_15",
      code: "MAT-0015",
      name: "Cerámica Piso 45x45",
      description: "Cerámica para pisos",
      detailedDescription: "Cerámica para piso 45x45 cm color beige",
      category: "Acabados",
      unit: "m²",
      stock: 85,
      minStock: 20,
      cost: 18.00,
      price: 25.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  customers: [
    {
      id: "customer_1",
      code: "CLI-0001",
      name: "Constructora El Salvador S.A. de C.V.",
      email: "contacto@constructoraelsalvador.com",
      phone: "2250-1234",
      address: "Col. Escalón, San Salvador",
      creditLimit: 50000.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date("2025-01-15"),
      updatedAt: new Date("2025-01-15"),
    },
    {
      id: "customer_2",
      code: "CLI-0002",
      name: "Inversiones García Ltda.",
      email: "ventas@inversionesgarcia.com",
      phone: "2260-5678",
      address: "Col. San Benito, San Salvador",
      creditLimit: 30000.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date("2025-01-20"),
      updatedAt: new Date("2025-01-20"),
    },
    {
      id: "customer_3",
      code: "CLI-0003",
      name: "Desarrollos Inmobiliarios Martínez",
      email: "info@dimartinez.com",
      phone: "2270-9012",
      address: "Santa Tecla, La Libertad",
      creditLimit: 75000.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date("2025-02-01"),
      updatedAt: new Date("2025-02-01"),
    },
    {
      id: "customer_4",
      code: "CLI-0004",
      name: "Ferretería Los Ángeles",
      email: "ferreteria.losangeles@gmail.com",
      phone: "2280-3456",
      address: "Soyapango, San Salvador",
      creditLimit: 15000.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date("2025-02-10"),
      updatedAt: new Date("2025-02-10"),
    },
    {
      id: "customer_5",
      code: "CLI-0005",
      name: "Obras Civiles Hernández",
      email: "obras.hernandez@outlook.com",
      phone: "2290-7890",
      address: "Antiguo Cuscatlán, La Libertad",
      creditLimit: 40000.00,
      companyId: "company_1",
      branchId: "branch_1",
      createdAt: new Date("2025-02-15"),
      updatedAt: new Date("2025-02-15"),
    },
  ],
  sales: [
    {
      id: "sale_1",
      saleNumber: "DTE-01-00000001-00000000-00000001",
      date: new Date("2025-03-01T10:30:00"),
      customerId: "customer_1",
      customerName: "Constructora El Salvador S.A. de C.V.",
      customerDocument: "0614-150289-101-5",
      customerPhone: "2250-1234",
      customerEmail: "contacto@constructoraelsalvador.com",
      items: [
        {
          productId: "product_1",
          productCode: "MAT-0001",
          productName: "Cemento Portland Tipo I",
          quantity: 50,
          unit: "Bolsa",
          unitPrice: 32.00,
          discount: 5,
          subtotal: 1520.00,
        },
        {
          productId: "product_2",
          productCode: "MAT-0002",
          productName: "Varilla de Acero 1/2\"",
          quantity: 100,
          unit: "Unidad",
          unitPrice: 24.50,
          discount: 0,
          subtotal: 2450.00,
        },
      ],
      subtotal: 3970.00,
      discount: 80.00,
      tax: 515.70,
      total: 4405.70,
      paymentMethod: "Transferencia",
      paymentType: "credit",
      status: "completed",
      notes: "Entrega programada para el 5 de marzo",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-01T10:30:00"),
    },
    {
      id: "sale_2",
      saleNumber: "DTE-01-00000001-00000000-00000002",
      date: new Date("2025-03-05T14:15:00"),
      customerName: "Juan Carlos Pérez",
      customerDocument: "03051234-5",
      customerPhone: "7890-1234",
      customerEmail: "jcperez@gmail.com",
      items: [
        {
          productId: "product_5",
          productCode: "MAT-0005",
          productName: "Pintura Látex Blanco",
          quantity: 5,
          unit: "Galón",
          unitPrice: 55.00,
          discount: 0,
          subtotal: 275.00,
        },
        {
          productId: "product_12",
          productCode: "MAT-0012",
          productName: "Codo PVC 1/2\"",
          quantity: 20,
          unit: "Unidad",
          unitPrice: 0.75,
          discount: 0,
          subtotal: 15.00,
        },
      ],
      subtotal: 290.00,
      discount: 0,
      tax: 37.70,
      total: 327.70,
      paymentMethod: "Efectivo",
      paymentType: "cash",
      status: "completed",
      notes: "",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-05T14:15:00"),
    },
    {
      id: "sale_3",
      saleNumber: "DTE-01-00000001-00000000-00000003",
      date: new Date("2025-03-10T09:45:00"),
      customerId: "customer_2",
      customerName: "Inversiones García Ltda.",
      customerDocument: "0614-280395-102-3",
      customerPhone: "2260-5678",
      customerEmail: "ventas@inversionesgarcia.com",
      items: [
        {
          productId: "product_8",
          productCode: "MAT-0008",
          productName: "Bloque de Concreto 15x20x40",
          quantity: 300,
          unit: "Unidad",
          unitPrice: 1.65,
          discount: 10,
          subtotal: 445.50,
        },
        {
          productId: "product_9",
          productCode: "MAT-0009",
          productName: "Alambre de Amarre #16",
          quantity: 25,
          unit: "Rollo",
          unitPrice: 4.75,
          discount: 0,
          subtotal: 118.75,
        },
      ],
      subtotal: 564.25,
      discount: 49.50,
      tax: 73.27,
      total: 588.02,
      paymentMethod: "Cheque",
      paymentType: "credit",
      status: "completed",
      notes: "Cliente frecuente - descuento aplicado",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-10T09:45:00"),
    },
    {
      id: "sale_4",
      saleNumber: "DTE-01-00000001-00000000-00000004",
      date: new Date("2025-03-15T11:20:00"),
      customerId: "customer_3",
      customerName: "Desarrollos Inmobiliarios Martínez",
      customerDocument: "0614-190488-103-7",
      customerPhone: "2270-9012",
      customerEmail: "info@dimartinez.com",
      items: [
        {
          productId: "product_1",
          productCode: "MAT-0001",
          productName: "Cemento Portland Tipo I",
          quantity: 80,
          unit: "Bolsa",
          unitPrice: 32.00,
          discount: 8,
          subtotal: 2355.20,
        },
        {
          productId: "product_3",
          productCode: "MAT-0003",
          productName: "Arena Fina",
          quantity: 10,
          unit: "m³",
          unitPrice: 60.00,
          discount: 5,
          subtotal: 570.00,
        },
        {
          productId: "product_6",
          productCode: "MAT-0006",
          productName: "Grava Triturada",
          quantity: 10,
          unit: "m³",
          unitPrice: 65.00,
          discount: 5,
          subtotal: 617.50,
        },
      ],
      subtotal: 3542.70,
      discount: 260.30,
      tax: 460.55,
      total: 3742.95,
      paymentMethod: "Transferencia",
      paymentType: "credit",
      status: "completed",
      notes: "Proyecto Residencial Las Palmas",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-15T11:20:00"),
    },
    {
      id: "sale_5",
      saleNumber: "DTE-01-00000001-00000000-00000005",
      date: new Date("2025-03-20T16:00:00"),
      customerName: "María Elena Rodríguez",
      customerDocument: "04120567-8",
      customerPhone: "7123-4567",
      customerEmail: "mrodriguez@hotmail.com",
      items: [
        {
          productId: "product_15",
          productCode: "MAT-0015",
          productName: "Cerámica Piso 45x45",
          quantity: 30,
          unit: "m²",
          unitPrice: 25.00,
          discount: 0,
          subtotal: 750.00,
        },
        {
          productId: "product_11",
          productCode: "MAT-0011",
          productName: "Tubo PVC 1/2\" x 6m",
          quantity: 15,
          unit: "Unidad",
          unitPrice: 11.50,
          discount: 0,
          subtotal: 172.50,
        },
      ],
      subtotal: 922.50,
      discount: 0,
      tax: 119.93,
      total: 1042.43,
      paymentMethod: "Tarjeta",
      paymentType: "cash",
      status: "completed",
      notes: "Remodelación de baño",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-20T16:00:00"),
    },
  ],
  quotes: [
    {
      id: "quote_1",
      quoteNumber: "COT-00000001",
      date: new Date("2025-02-25T10:00:00"),
      validUntil: new Date("2025-03-25T23:59:59"),
      customerName: "Constructora El Salvador S.A. de C.V.",
      customerDocument: "0614-150289-101-5",
      customerPhone: "2250-1234",
      customerEmail: "contacto@constructoraelsalvador.com",
      items: [
        {
          productId: "product_1",
          productCode: "MAT-0001",
          productName: "Cemento Portland Tipo I",
          quantity: 50,
          unit: "Bolsa",
          unitPrice: 32.00,
          discount: 5,
          subtotal: 1520.00,
        },
        {
          productId: "product_2",
          productCode: "MAT-0002",
          productName: "Varilla de Acero 1/2\"",
          quantity: 100,
          unit: "Unidad",
          unitPrice: 24.50,
          discount: 0,
          subtotal: 2450.00,
        },
      ],
      subtotal: 3970.00,
      discount: 80.00,
      tax: 515.70,
      total: 4405.70,
      status: "approved",
      notes: "Cotización para proyecto de vivienda",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-02-25T10:00:00"),
    },
    {
      id: "quote_2",
      quoteNumber: "COT-00000002",
      date: new Date("2025-03-08T14:30:00"),
      validUntil: new Date("2025-04-08T23:59:59"),
      customerName: "Inversiones García Ltda.",
      customerDocument: "0614-280395-102-3",
      customerPhone: "2260-5678",
      customerEmail: "ventas@inversionesgarcia.com",
      items: [
        {
          productId: "product_8",
          productCode: "MAT-0008",
          productName: "Bloque de Concreto 15x20x40",
          quantity: 300,
          unit: "Unidad",
          unitPrice: 1.65,
          discount: 10,
          subtotal: 445.50,
        },
        {
          productId: "product_9",
          productCode: "MAT-0009",
          productName: "Alambre de Amarre #16",
          quantity: 25,
          unit: "Rollo",
          unitPrice: 4.75,
          discount: 0,
          subtotal: 118.75,
        },
      ],
      subtotal: 564.25,
      discount: 49.50,
      tax: 73.27,
      total: 588.02,
      status: "approved",
      notes: "Cotización aprobada - convertida a venta",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-08T14:30:00"),
    },
    {
      id: "quote_3",
      quoteNumber: "COT-00000003",
      date: new Date("2025-03-12T09:15:00"),
      validUntil: new Date("2025-04-12T23:59:59"),
      customerName: "Desarrollos Inmobiliarios Martínez",
      customerDocument: "0614-190488-103-7",
      customerPhone: "2270-9012",
      customerEmail: "info@dimartinez.com",
      items: [
        {
          productId: "product_1",
          productCode: "MAT-0001",
          productName: "Cemento Portland Tipo I",
          quantity: 80,
          unit: "Bolsa",
          unitPrice: 32.00,
          discount: 8,
          subtotal: 2355.20,
        },
        {
          productId: "product_3",
          productCode: "MAT-0003",
          productName: "Arena Fina",
          quantity: 10,
          unit: "m³",
          unitPrice: 60.00,
          discount: 5,
          subtotal: 570.00,
        },
        {
          productId: "product_6",
          productCode: "MAT-0006",
          productName: "Grava Triturada",
          quantity: 10,
          unit: "m³",
          unitPrice: 65.00,
          discount: 5,
          subtotal: 617.50,
        },
      ],
      subtotal: 3542.70,
      discount: 260.30,
      tax: 460.55,
      total: 3742.95,
      status: "approved",
      notes: "Proyecto Residencial Las Palmas - Fase 1",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-12T09:15:00"),
    },
    {
      id: "quote_4",
      quoteNumber: "COT-00000004",
      date: new Date("2025-03-18T11:45:00"),
      validUntil: new Date("2025-04-18T23:59:59"),
      customerName: "Ferretería Los Ángeles",
      customerDocument: "0614-051290-104-2",
      customerPhone: "2280-3456",
      customerEmail: "ferreteria.losangeles@gmail.com",
      items: [
        {
          productId: "product_13",
          productCode: "MAT-0013",
          productName: "Cable Eléctrico #12 AWG",
          quantity: 20,
          unit: "Rollo",
          unitPrice: 110.00,
          discount: 15,
          subtotal: 1870.00,
        },
        {
          productId: "product_14",
          productCode: "MAT-0014",
          productName: "Interruptor Simple",
          quantity: 50,
          unit: "Unidad",
          unitPrice: 4.20,
          discount: 10,
          subtotal: 189.00,
        },
      ],
      subtotal: 2059.00,
      discount: 359.00,
      tax: 267.67,
      total: 1967.67,
      status: "pending",
      notes: "Cotización para proyecto eléctrico - esperando aprobación",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-18T11:45:00"),
    },
    {
      id: "quote_5",
      quoteNumber: "COT-00000005",
      date: new Date("2025-03-22T15:30:00"),
      validUntil: new Date("2025-04-22T23:59:59"),
      customerName: "Obras Civiles Hernández",
      customerDocument: "0614-220592-105-8",
      customerPhone: "2290-7890",
      customerEmail: "obras.hernandez@outlook.com",
      items: [
        {
          productId: "product_4",
          productCode: "MAT-0004",
          productName: "Ladrillo King Kong",
          quantity: 5,
          unit: "Millar",
          unitPrice: 480.00,
          discount: 5,
          subtotal: 2280.00,
        },
        {
          productId: "product_7",
          productCode: "MAT-0007",
          productName: "Varilla de Acero 3/8\"",
          quantity: 150,
          unit: "Unidad",
          unitPrice: 16.75,
          discount: 0,
          subtotal: 2512.50,
        },
      ],
      subtotal: 4792.50,
      discount: 120.00,
      tax: 622.82,
      total: 5295.32,
      status: "pending",
      notes: "Cotización para construcción de muro perimetral",
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-22T15:30:00"),
    },
  ],
  creditTransactions: [
    {
      id: "transaction_1",
      customerId: "customer_1",
      type: "sale",
      saleId: "sale_1",
      amount: 4405.70,
      balance: 4405.70,
      description: "Venta DTE-01-00000001-00000000-00000001",
      date: new Date("2025-03-01T10:30:00"),
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-01T10:30:00"),
    },
    {
      id: "transaction_2",
      customerId: "customer_1",
      type: "payment",
      amount: -2000.00,
      balance: 2405.70,
      description: "Abono a cuenta",
      date: new Date("2025-03-08T14:00:00"),
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-08T14:00:00"),
    },
    {
      id: "transaction_3",
      customerId: "customer_2",
      type: "sale",
      saleId: "sale_3",
      amount: 588.02,
      balance: 588.02,
      description: "Venta DTE-01-00000001-00000000-00000003",
      date: new Date("2025-03-10T09:45:00"),
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-10T09:45:00"),
    },
    {
      id: "transaction_4",
      customerId: "customer_3",
      type: "sale",
      saleId: "sale_4",
      amount: 3742.95,
      balance: 3742.95,
      description: "Venta DTE-01-00000001-00000000-00000004",
      date: new Date("2025-03-15T11:20:00"),
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-15T11:20:00"),
    },
    {
      id: "transaction_5",
      customerId: "customer_3",
      type: "payment",
      amount: -1500.00,
      balance: 2242.95,
      description: "Abono a cuenta - Cheque #12345",
      date: new Date("2025-03-18T10:00:00"),
      companyId: "company_1",
      branchId: "branch_1",
      createdBy: "user_1",
      createdAt: new Date("2025-03-18T10:00:00"),
    },
  ],
  companies: [
    {
      id: "company_1",
      name: "Ferretería El Tornillo",
      legalName: "Ferretería El Tornillo S.A. de C.V.",
      taxId: "0614-123456-101-2",
      email: "info@ferreteriaeltornillo.com",
      phone: "2200-1234",
      address: "Av. Principal #123",
      city: "San Salvador",
      country: "El Salvador",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  branches: [
    {
      id: "branch_1",
      companyId: "company_1",
      code: "SUC-001",
      name: "Sucursal Centro",
      email: "centro@ferreteriaeltornillo.com",
      phone: "2200-1234",
      address: "Av. Principal #123, Centro Histórico",
      city: "San Salvador",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "branch_2",
      companyId: "company_1",
      code: "SUC-002",
      name: "Sucursal Santa Tecla",
      email: "santatecla@ferreteriaeltornillo.com",
      phone: "2200-5678",
      address: "Calle Los Almendros #456",
      city: "Santa Tecla",
      isActive: true,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
    {
      id: "branch_3",
      companyId: "company_1",
      code: "SUC-003",
      name: "Sucursal Soyapango",
      email: "soyapango@ferreteriaeltornillo.com",
      phone: "2200-9012",
      address: "Boulevard del Ejército #789",
      city: "Soyapango",
      isActive: true,
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-01"),
    },
  ],
  roles: [
    {
      id: "role_1",
      name: "Administrador",
      description: "Acceso completo al sistema",
      permissions: ["all"],
      companyId: "company_1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "role_2",
      name: "Vendedor",
      description: "Puede crear ventas y cotizaciones",
      permissions: ["sales.create", "sales.read", "quotes.create", "quotes.read", "inventory.read", "customers.read"],
      companyId: "company_1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "role_3",
      name: "Almacenista",
      description: "Gestiona inventario",
      permissions: ["inventory.create", "inventory.read", "inventory.update", "inventory.delete"],
      companyId: "company_1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
  users: [
    {
      id: "user_1",
      email: "admin@ferreteriaeltornillo.com",
      password: "admin123",
      name: "Carlos Martínez",
      phone: "7890-1234",
      roleId: "role_1",
      companyId: "company_1",
      branchId: "branch_1",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "user_2",
      email: "vendedor1@ferreteriaeltornillo.com",
      password: "vendedor123",
      name: "María González",
      phone: "7890-5678",
      roleId: "role_2",
      companyId: "company_1",
      branchId: "branch_1",
      isActive: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "user_3",
      email: "almacen@ferreteriaeltornillo.com",
      password: "almacen123",
      name: "José Ramírez",
      phone: "7890-9012",
      roleId: "role_3",
      companyId: "company_1",
      branchId: "branch_2",
      isActive: true,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
  ],
  authSessions: [],
};
