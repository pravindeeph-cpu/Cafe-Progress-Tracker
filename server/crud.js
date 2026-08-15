import express from 'express';
import { pool } from './db.js';

const TABLES_WITH_UPDATED_AT = new Set(['tasks']);

/**
 * Builds a generic REST CRUD router for a flat Postgres table.
 * columns: array of column names writable via the API (excludes id).
 * filterColumn: optional column name allowed as a `?col=value` list filter (e.g. menu_item_id).
 */
export function createCrudRouter(table, columns, filterColumn) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      if (filterColumn && req.query[filterColumn] !== undefined) {
        const result = await pool.query(`SELECT * FROM ${table} WHERE ${filterColumn} = $1 ORDER BY id`, [
          req.query[filterColumn],
        ]);
        return res.json(result.rows);
      }
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const data = pick(req.body, columns);
      const cols = Object.keys(data);
      if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const values = cols.map((c) => data[c]);
      const result = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const data = pick(req.body, columns);
      const cols = Object.keys(data);
      if (cols.length === 0) return res.status(400).json({ error: 'No valid fields provided' });
      const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const values = cols.map((c) => data[c]);
      const updatedAtClause = TABLES_WITH_UPDATED_AT.has(table) ? ', updated_at = now()' : '';
      const sql = `UPDATE ${table} SET ${setClause}${updatedAtClause} WHERE id = $${cols.length + 1} RETURNING *`;
      const result = await pool.query(sql, [...values, req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
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
