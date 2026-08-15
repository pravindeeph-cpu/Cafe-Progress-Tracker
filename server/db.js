import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    'WARNING: DATABASE_URL is not set. Set it to a Postgres connection string (e.g. from Neon or Supabase) in a .env file or your host\'s environment variables.'
  );
}

const useSsl = /neon\.tech|supabase\.co|render\.com|sslmode=require/.test(process.env.DATABASE_URL ?? '');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export async function initSchema() {
  await pool.query(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  section TEXT DEFAULT 'General',
  task TEXT NOT NULL,
  owner TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Not Started',
  cost REAL DEFAULT 0,
  dependency TEXT,
  notes TEXT,
  rag TEXT DEFAULT 'Green',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS startup_costs (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  estimated_cost REAL DEFAULT 0,
  actual_cost REAL DEFAULT 0,
  status TEXT DEFAULT 'Planned',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS monthly_forecast (
  id SERIAL PRIMARY KEY,
  month_index INTEGER NOT NULL,
  month_label TEXT,
  revenue REAL DEFAULT 0,
  fixed_costs REAL DEFAULT 0,
  variable_costs REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS licences (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  authority TEXT,
  category TEXT DEFAULT 'Mandatory',
  applicable INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Not Started',
  deadline TEXT,
  cost REAL DEFAULT 0,
  reference_no TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  selling_price REAL DEFAULT 0,
  prep_time_minutes REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity REAL DEFAULT 0,
  unit TEXT,
  unit_cost REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  contact TEXT,
  items_supplied TEXT,
  critical INTEGER DEFAULT 0,
  is_backup INTEGER DEFAULT 0,
  backup_for TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS property_checklist (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  cost REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS equipment_register (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  supplier TEXT,
  price REAL DEFAULT 0,
  delivery_date TEXT,
  installation_status TEXT DEFAULT 'Not Ordered',
  warranty_expiry TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'Vacant',
  contract_signed INTEGER DEFAULT 0,
  start_date TEXT,
  salary REAL DEFAULT 0,
  epf_socso_registered INTEGER DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS skill_prep (
  id SERIAL PRIMARY KEY,
  training TEXT NOT NULL,
  who TEXT,
  provider TEXT,
  status TEXT DEFAULT 'Not Started',
  cost REAL DEFAULT 0,
  certificate_expiry TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sop_library (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  sop_name TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pre_opening_checklist (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS gates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gate_items (
  id SERIAL PRIMARY KEY,
  gate_id INTEGER NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  complete INTEGER DEFAULT 0,
  notes TEXT
);
`);
}

export default pool;
