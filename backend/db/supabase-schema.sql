-- Supabase Schema for Ferretería Management System
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  tax_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auth sessions table
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  stock NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, company_id, branch_id)
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, company_id, branch_id)
);

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_number TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_document TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'credit')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled')),
  notes TEXT NOT NULL DEFAULT '',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sale_number, company_id)
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  customer_name TEXT NOT NULL,
  customer_document TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  tax NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT NOT NULL DEFAULT '',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quote_number, company_id)
);

-- Credit transactions table
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'payment')),
  sale_id UUID REFERENCES sales(id),
  amount NUMERIC NOT NULL,
  balance NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_company_branch ON products(company_id, branch_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_customers_company_branch ON customers(company_id, branch_id);
CREATE INDEX idx_customers_code ON customers(code);
CREATE INDEX idx_sales_company_branch ON sales(company_id, branch_id);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_quotes_company_branch ON quotes(company_id, branch_id);
CREATE INDEX idx_quotes_date ON quotes(date);
CREATE INDEX idx_credit_transactions_customer ON credit_transactions(customer_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- For now, allow service role to access everything
-- You can add more granular policies based on your needs
CREATE POLICY "Service role can do everything" ON companies FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON branches FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON roles FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON users FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON auth_sessions FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON products FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON customers FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON sales FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON quotes FOR ALL USING (true);
CREATE POLICY "Service role can do everything" ON credit_transactions FOR ALL USING (true);

-- Insert default data
-- Company
INSERT INTO companies (id, name, legal_name, tax_id, email, phone, address, city, country)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Ferretería El Tornillo',
  'Ferretería El Tornillo S.A. de C.V.',
  '0614-123456-101-2',
  'info@ferreteriaeltornillo.com',
  '2200-1234',
  'Av. Principal #123',
  'San Salvador',
  'El Salvador'
);

-- Branches
INSERT INTO branches (id, company_id, code, name, email, phone, address, city, is_active)
VALUES 
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SUC-001',
    'Sucursal Centro',
    'centro@ferreteriaeltornillo.com',
    '2200-1234',
    'Av. Principal #123, Centro Histórico',
    'San Salvador',
    true
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SUC-002',
    'Sucursal Santa Tecla',
    'santatecla@ferreteriaeltornillo.com',
    '2200-5678',
    'Calle Los Almendros #456',
    'Santa Tecla',
    true
  ),
  (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SUC-003',
    'Sucursal Soyapango',
    'soyapango@ferreteriaeltornillo.com',
    '2200-9012',
    'Boulevard del Ejército #789',
    'Soyapango',
    true
  );

-- Roles
INSERT INTO roles (id, name, description, permissions, company_id)
VALUES 
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Administrador',
    'Acceso completo al sistema',
    '["all"]',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Vendedor',
    'Puede crear ventas y cotizaciones',
    '["sales.create", "sales.read", "quotes.create", "quotes.read", "inventory.read", "customers.read"]',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  ),
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'Almacenista',
    'Gestiona inventario',
    '["inventory.create", "inventory.read", "inventory.update", "inventory.delete"]',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  );

-- Users (password is plain text for demo, you should hash it in production)
INSERT INTO users (id, email, password, name, phone, role_id, company_id, branch_id, is_active)
VALUES 
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@ferreteriaeltornillo.com',
    'admin123',
    'Carlos Martínez',
    '7890-1234',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    true
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'vendedor1@ferreteriaeltornillo.com',
    'vendedor123',
    'María González',
    '7890-5678',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    true
  ),
  (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'almacen@ferreteriaeltornillo.com',
    'almacen123',
    'José Ramírez',
    '7890-9012',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    true
  );
