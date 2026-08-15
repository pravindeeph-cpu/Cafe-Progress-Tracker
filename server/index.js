import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import './seed.js';
import { createCrudRouter } from './crud.js';
import { computeDashboard, computeFinancialSummary, computeGatesWithStatus } from './dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// ---------- Generic CRUD resources ----------
app.use('/api/tasks', createCrudRouter('tasks', [
  'section', 'task', 'owner', 'deadline', 'status', 'cost', 'dependency', 'notes', 'rag',
]));

app.use('/api/startup-costs', createCrudRouter('startup_costs', [
  'category', 'item', 'estimated_cost', 'actual_cost', 'status', 'notes',
]));

app.use('/api/monthly-forecast', createCrudRouter('monthly_forecast', [
  'month_index', 'month_label', 'revenue', 'fixed_costs', 'variable_costs', 'notes',
]));

app.use('/api/licences', createCrudRouter('licences', [
  'name', 'authority', 'category', 'applicable', 'status', 'deadline', 'cost', 'reference_no', 'notes',
]));

app.use('/api/menu-items', createCrudRouter('menu_items', [
  'name', 'category', 'selling_price', 'prep_time_minutes', 'notes',
]));

app.use('/api/recipe-ingredients', createCrudRouter('recipe_ingredients', [
  'menu_item_id', 'ingredient_name', 'quantity', 'unit', 'unit_cost',
], 'menu_item_id'));

app.use('/api/suppliers', createCrudRouter('suppliers', [
  'name', 'category', 'contact', 'items_supplied', 'critical', 'is_backup', 'backup_for', 'notes',
]));

app.use('/api/property-checklist', createCrudRouter('property_checklist', [
  'category', 'item', 'status', 'cost', 'notes',
]));

app.use('/api/equipment-register', createCrudRouter('equipment_register', [
  'item', 'supplier', 'price', 'delivery_date', 'installation_status', 'warranty_expiry', 'notes',
]));

app.use('/api/people', createCrudRouter('people', [
  'role', 'name', 'status', 'contract_signed', 'start_date', 'salary', 'epf_socso_registered', 'notes',
]));

app.use('/api/skill-prep', createCrudRouter('skill_prep', [
  'training', 'who', 'provider', 'status', 'cost', 'certificate_expiry', 'notes',
]));

app.use('/api/sop-library', createCrudRouter('sop_library', [
  'category', 'sop_name', 'status', 'notes',
]));

app.use('/api/pre-opening', createCrudRouter('pre_opening_checklist', [
  'category', 'item', 'status', 'notes',
]));

app.use('/api/gate-items', createCrudRouter('gate_items', [
  'gate_id', 'item', 'complete', 'notes',
], 'gate_id'));

// ---------- Gates (read: nested with items + computed status) ----------
app.get('/api/gates', (req, res) => {
  res.json(computeGatesWithStatus());
});

// ---------- Settings ----------
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const stmt = db.prepare(
    `INSERT INTO settings (key, value) VALUES (@key, @value)
     ON CONFLICT(key) DO UPDATE SET value = @value`
  );
  const insertMany = db.transaction((entries) => {
    for (const [key, value] of entries) stmt.run({ key, value: String(value) });
  });
  insertMany(Object.entries(req.body || {}));
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  for (const r of rows) settings[r.key] = r.value;
  res.json(settings);
});

// ---------- Computed endpoints ----------
app.get('/api/dashboard', (req, res) => {
  res.json(computeDashboard());
});

app.get('/api/financial/summary', (req, res) => {
  res.json(computeFinancialSummary());
});

// ---------- Serve built client in production ----------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Cafe Launch Control Centre API listening on http://localhost:${PORT}`);
});
