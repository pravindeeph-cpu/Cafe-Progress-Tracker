import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'cafe_control_centre.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT DEFAULT 'General',
  task TEXT NOT NULL,
  owner TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Not Started',
  cost REAL DEFAULT 0,
  dependency TEXT,
  notes TEXT,
  rag TEXT DEFAULT 'Green',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS startup_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  estimated_cost REAL DEFAULT 0,
  actual_cost REAL DEFAULT 0,
  status TEXT DEFAULT 'Planned',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS monthly_forecast (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month_index INTEGER NOT NULL,
  month_label TEXT,
  revenue REAL DEFAULT 0,
  fixed_costs REAL DEFAULT 0,
  variable_costs REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS licences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  selling_price REAL DEFAULT 0,
  prep_time_minutes REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity REAL DEFAULT 0,
  unit TEXT,
  unit_cost REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  cost REAL DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS equipment_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item TEXT NOT NULL,
  supplier TEXT,
  price REAL DEFAULT 0,
  delivery_date TEXT,
  installation_status TEXT DEFAULT 'Not Ordered',
  warranty_expiry TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training TEXT NOT NULL,
  who TEXT,
  provider TEXT,
  status TEXT DEFAULT 'Not Started',
  cost REAL DEFAULT 0,
  certificate_expiry TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS sop_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  sop_name TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS pre_opening_checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  notes TEXT
);

CREATE TABLE IF NOT EXISTS gates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gate_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gate_id INTEGER NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  complete INTEGER DEFAULT 0,
  notes TEXT
);
`);

export default db;
