const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();
router.use(auth);

const VALID_ACTIONS = new Set(['send', 'setup']);
const VALID_STATUS = new Set(['Open', 'Completed']);
const VALID_OFFICES = new Set(['New York City', 'San Francisco', 'Washington DC']);

router.get('/', (req, res) => {
  const { month, status } = req.query;
  const where = [];
  const params = [];

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    where.push("substr(due_date,1,7)=?");
    params.push(month);
  }
  if (status && VALID_STATUS.has(status)) {
    where.push('status=?');
    params.push(status);
  }

  const sql = `SELECT l.*, u.name as created_by_name
               FROM outgoing_laptops l
               LEFT JOIN users u ON u.id=l.created_by
               ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY l.due_date ASC, l.created_at DESC`;

  res.json(db.prepare(sql).all(...params));
});

router.post('/', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const {
    laptop_tag = '',
    assignee_name = '',
    office = 'New York City',
    action_type = 'send',
    due_date,
    notes = ''
  } = req.body;

  if (!due_date || !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) return res.status(400).json({ error: 'due_date must be YYYY-MM-DD' });
  if (!VALID_ACTIONS.has(action_type)) return res.status(400).json({ error: 'Invalid action_type' });
  const normalizedOffice = VALID_OFFICES.has(String(office).trim()) ? String(office).trim() : 'New York City';

  const now = new Date().toISOString();
  const result = db.prepare(`INSERT INTO outgoing_laptops (laptop_tag, assignee_name, office, action_type, due_date, notes, status, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?)`)
    .run(String(laptop_tag).trim(), String(assignee_name).trim(), normalizedOffice, action_type, due_date, String(notes).trim(), req.user.id, now, now);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const row = db.prepare('SELECT * FROM outgoing_laptops WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  const updates = [];
  const params = [];
  const allowed = ['laptop_tag', 'assignee_name', 'office', 'action_type', 'due_date', 'notes', 'status'];

  for (const k of allowed) {
    if (!Object.prototype.hasOwnProperty.call(req.body, k)) continue;
    const v = req.body[k];
    if (k === 'action_type' && !VALID_ACTIONS.has(v)) return res.status(400).json({ error: 'Invalid action_type' });
    if (k === 'office' && !VALID_OFFICES.has(String(v || '').trim())) return res.status(400).json({ error: 'Invalid office' });
    if (k === 'status' && !VALID_STATUS.has(v)) return res.status(400).json({ error: 'Invalid status' });
    if (k === 'due_date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(v || ''))) return res.status(400).json({ error: 'due_date must be YYYY-MM-DD' });
    updates.push(`${k}=?`);
    params.push(typeof v === 'string' ? v.trim() : v);
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
    updates.push('completed_at=?');
    params.push(req.body.status === 'Completed' ? new Date().toISOString() : null);
  }

  if (!updates.length) return res.json({ ok: true, unchanged: true });

  updates.push('updated_at=?');
  params.push(new Date().toISOString());
  params.push(req.params.id);

  db.prepare(`UPDATE outgoing_laptops SET ${updates.join(', ')} WHERE id=?`).run(...params);
  res.json({ ok: true });
});

router.delete('/:id', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const result = db.prepare('DELETE FROM outgoing_laptops WHERE id=?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

module.exports = router;
