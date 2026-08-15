import express from 'express';
import { db } from './db.js';

/**
 * Builds a generic REST CRUD router for a flat SQLite table.
 * columns: array of column names writable via the API (excludes id).
 * filterColumn: optional column name allowed as a `?col=value` list filter (e.g. menu_item_id).
 */
export function createCrudRouter(table, columns, filterColumn) {
  const router = express.Router();

  router.get('/', (req, res) => {
    if (filterColumn && req.query[filterColumn] !== undefined) {
      const rows = db
        .prepare(`SELECT * FROM ${table} WHERE ${filterColumn} = ? ORDER BY id`)
        .all(req.query[filterColumn]);
      return res.json(rows);
    }
    const rows = db.prepare(`SELECT * FROM ${table} ORDER BY id`).all();
    res.json(rows);
  });

  router.post('/', (req, res) => {
    const data = pick(req.body, columns);
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const placeholders = cols.map((c) => `@${c}`).join(', ');
    const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);
    const info = stmt.run(data);
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid);
    res.status(201).json(row);
  });

  router.put('/:id', (req, res) => {
    const data = pick(req.body, columns);
    const cols = Object.keys(data);
    if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
    const setClause = cols.map((c) => `${c} = @${c}`).join(', ');
    const hasUpdatedAt = columnExists(table, 'updated_at');
    const sql = `UPDATE ${table} SET ${setClause}${hasUpdatedAt ? ', updated_at = CURRENT_TIMESTAMP' : ''} WHERE id = @id`;
    db.prepare(sql).run({ ...data, id: req.params.id });
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  router.delete('/:id', (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.status(204).end();
  });

  return router;
}

function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) out[key] = obj[key];
  }
  return out;
}

const columnCache = {};
function columnExists(table, column) {
  if (!columnCache[table]) {
    columnCache[table] = db
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((c) => c.name);
  }
  return columnCache[table].includes(column);
}
