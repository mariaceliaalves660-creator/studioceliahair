-- Studio Célia Hair - Database Schema
-- Execute este SQL no Supabase SQL Editor para criar todas as tabelas

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  image TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]',
  origin TEXT DEFAULT 'store',
  is_online BOOLEAN DEFAULT false,
  hair_quote_id TEXT,
  location TEXT,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  birthday TEXT,
  cpf TEXT,
  city TEXT,
  state TEXT,
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  customer_cpf TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  mixed_payment JSONB,
  business_unit TEXT,
  created_by TEXT,
  created_by_name TEXT,
  has_maintenance_service BOOLEAN DEFAULT false,
  maintenance_date TIMESTAMP WITH TIME ZONE,
  next_maintenance_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ============================================
-- APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_ids JSONB NOT NULL,
  staff_id JSONB NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by TEXT,
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL,
  business_unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CASHIER SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cashier_sessions (
  id TEXT PRIMARY KEY,
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  opening_balance DECIMAL(10,2) NOT NULL,
  total_income DECIMAL(10,2),
  total_expenses DECIMAL(10,2),
  calculated_balance DECIMAL(10,2),
  withdrawn_amount DECIMAL(10,2),
  final_balance DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE (Online Shopping)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_cpf TEXT,
  client_id TEXT,
  delivery_type TEXT NOT NULL,
  address TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  workload TEXT,
  duration TEXT,
  format TEXT,
  certificate TEXT,
  materials TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  instructor TEXT,
  max_students INTEGER,
  modules JSONB DEFAULT '[]',
  students JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enrolled_course_ids JSONB DEFAULT '[]',
  courses JSONB DEFAULT '[]',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HAIR QUOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hair_quotes (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  location TEXT,
  age_group TEXT,
  hair_type TEXT,
  quantity INTEGER,
  total_price DECIMAL(10,2),
  options JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LOYALTY REWARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loyalty_rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  description TEXT,
  discount DECIMAL(10,2),
  stock INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- POINT REDEMPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS point_redemptions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  reward_id TEXT NOT NULL,
  reward_title TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (reward_id) REFERENCES loyalty_rewards(id)
);

-- ============================================
-- ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE CATEGORIES TABLE (Custom)
-- ============================================
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_maintenance ON sales(next_maintenance_date) WHERE has_maintenance_service = true;
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_cashier_sessions_status ON cashier_sessions(status);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashier_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow all for now - customize later)
-- ============================================

-- Products policies
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);

-- Services policies
CREATE POLICY "Allow all operations on services" ON services FOR ALL USING (true);

-- Clients policies
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);

-- Staff policies
CREATE POLICY "Allow all operations on staff" ON staff FOR ALL USING (true);

-- Sales policies
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);

-- Appointments policies
CREATE POLICY "Allow all operations on appointments" ON appointments FOR ALL USING (true);

-- Expenses policies
CREATE POLICY "Allow all operations on expenses" ON expenses FOR ALL USING (true);

-- Cashier sessions policies
CREATE POLICY "Allow all operations on cashier_sessions" ON cashier_sessions FOR ALL USING (true);

-- Orders policies
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);

-- Courses policies
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true);

-- Students policies
CREATE POLICY "Allow all operations on students" ON students FOR ALL USING (true);

-- Hair quotes policies
CREATE POLICY "Allow all operations on hair_quotes" ON hair_quotes FOR ALL USING (true);

-- Loyalty rewards policies
CREATE POLICY "Allow all operations on loyalty_rewards" ON loyalty_rewards FOR ALL USING (true);

-- Point redemptions policies
CREATE POLICY "Allow all operations on point_redemptions" ON point_redemptions FOR ALL USING (true);

-- Admins policies
CREATE POLICY "Allow all operations on admins" ON admins FOR ALL USING (true);

-- Service categories policies
CREATE POLICY "Allow all operations on service_categories" ON service_categories FOR ALL USING (true);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for all tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE staff;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE cashier_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE hair_quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_rewards;
ALTER PUBLICATION supabase_realtime ADD TABLE point_redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE service_categories;

-- ============================================
-- MAINTENANCE ALERTS SYSTEM
-- ============================================
-- O sistema detecta automaticamente serviços de manutenção
-- baseado em palavras-chave no nome do serviço:
-- - manutenção, manutencao, retoque, reparo, revisão, revisao
-- - mega hair, megahair, aplique, extensão, extensao
--
-- Quando um serviço de manutenção é realizado:
-- 1. has_maintenance_service é marcado como true
-- 2. maintenance_date recebe a data da venda
-- 3. next_maintenance_date é calculada como +3 meses
--
-- Alertas são gerados automaticamente:
-- - 5 dias antes da data de manutenção
-- - Clientes com manutenção atrasada
-- - Visível na HomeScreen e no perfil do cliente

-- ============================================
-- DONE! Your database is ready for real-time sync
-- ============================================
