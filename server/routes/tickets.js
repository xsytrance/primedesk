const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();
router.use(auth);

const VALID_TIMINGS = new Set(['soon', 'later', 'whenever']);
const VALID_STATUS = new Set(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed']);

function addActivity(ticketId, userId, action, oldValue, newValue) {
  db.prepare('INSERT INTO ticket_activity (ticket_id, user_id, action, old_value, new_value) VALUES (?, ?, ?, ?, ?)')
    .run(ticketId, userId || null, action, oldValue || null, newValue || null);
}

router.get('/', (req, res) => {
  const { status, assignee_id, category, q } = req.query;
  const where = [];
  const params = [];

  if (status) { where.push('t.status = ?'); params.push(status); }
  if (assignee_id) { where.push('t.assignee_id = ?'); params.push(Number(assignee_id)); }
  if (category) { where.push('t.category = ?'); params.push(category); }
  if (q) {
    where.push('(t.title LIKE ? OR t.description LIKE ? OR t.ticket_code LIKE ? OR t.tags LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }

  const sql = `SELECT t.*, u.name AS assignee_name, c.name AS created_by_name
               FROM tickets t
               LEFT JOIN users u ON u.id=t.assignee_id
               LEFT JOIN users c ON c.id=t.created_by
               ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY t.updated_at DESC`;

  const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, timing: r.priority || 'later', tags: JSON.parse(r.tags || '[]') }));
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM tickets WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const comments = db.prepare('SELECT tc.*, u.name user_name FROM ticket_comments tc JOIN users u ON u.id=tc.user_id WHERE ticket_id=? ORDER BY tc.created_at ASC').all(req.params.id);
  const activity = db.prepare('SELECT ta.*, u.name user_name FROM ticket_activity ta LEFT JOIN users u ON u.id=ta.user_id WHERE ticket_id=? ORDER BY ta.created_at DESC LIMIT 200').all(req.params.id);
  res.json({ ...t, timing: t.priority || 'later', tags: JSON.parse(t.tags || '[]'), comments, activity });
});

router.post('/', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const {
    title,
    description = '',
    timing = 'later',
    category = 'Other',
    assignee_id = null,
    requester_name = '',
    tags = [],
    due_date = null,
  } = req.body;

  if (!title || !title.trim()) return res.status(400).json({ error: 'Title required' });
  if (!VALID_TIMINGS.has(String(timing))) return res.status(400).json({ error: 'Invalid timing' });
  const dupe = db.prepare(`SELECT id, ticket_code, title FROM tickets WHERE status IN ('Open','In Progress','Pending') AND title LIKE ? ORDER BY updated_at DESC LIMIT 3`).all(`%${title.trim().slice(0, 20)}%`);

  const now = new Date().toISOString();
  const result = db.prepare(`INSERT INTO tickets (title, description, priority, category, status, assignee_id, requester_name, due_date, tags, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?, ?, ?)`)
    .run(title.trim(), description, timing, category, assignee_id, requester_name, due_date, JSON.stringify(tags), req.user.id, now, now);

  const id = result.lastInsertRowid;
  const code = `TKT-${String(id).padStart(4, '0')}`;
  db.prepare('UPDATE tickets SET ticket_code=? WHERE id=?').run(code, id);

  addActivity(id, req.user.id, 'created', null, `Ticket ${code} created`);
  req.app.get('io').to('general').emit('ticket:new', { id, ticket_code: code, title: title.trim(), status: 'Open' });

  db.prepare('INSERT INTO xp_events (user_id, action_type, xp_amount, related_id) VALUES (?, ?, ?, ?)').run(req.user.id, 'create_ticket', 5, id);
  db.prepare('UPDATE users SET xp = xp + 5 WHERE id=?').run(req.user.id);

  res.status(201).json({ id, ticket_code: code, duplicate_candidates: dupe });
});

router.patch('/:id', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const t = db.prepare('SELECT * FROM tickets WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });

  const updates = [];
  const params = [];
  const allowed = ['title', 'description', 'category', 'status', 'assignee_id', 'requester_name', 'due_date', 'linked_kb_id'];

  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, k)) {
      if (k === 'status' && !VALID_STATUS.has(req.body[k])) return res.status(400).json({ error: 'Invalid status' });
      updates.push(`${k}=?`);
      params.push(req.body[k]);
      if (String(t[k] ?? '') !== String(req.body[k] ?? '')) addActivity(req.params.id, req.user.id, `${k}_changed`, String(t[k] ?? ''), String(req.body[k] ?? ''));
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) {
    updates.push('tags=?');
    params.push(JSON.stringify(req.body.tags || []));
  }

  if (!updates.length) return res.json({ ok: true, unchanged: true });

  updates.push('updated_at=?');
  params.push(new Date().toISOString());

  if (req.body.status === 'Resolved') {
    updates.push('resolved_at=?');
    params.push(new Date().toISOString());
  }

  params.push(req.params.id);
  db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id=?`).run(...params);
  const fresh = db.prepare('SELECT * FROM tickets WHERE id=?').get(req.params.id);
  req.app.get('io').to('general').emit('ticket:updated', fresh);
  res.json({ ok: true });
});

router.post('/:id/comments', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'Comment required' });

  const t = db.prepare('SELECT id FROM tickets WHERE id=?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Ticket not found' });

  const result = db.prepare('INSERT INTO ticket_comments (ticket_id, user_id, body) VALUES (?, ?, ?)')
    .run(req.params.id, req.user.id, body.trim());

  addActivity(req.params.id, req.user.id, 'commented', null, body.trim().slice(0, 120));

  const row = db.prepare('SELECT tc.*, u.name user_name FROM ticket_comments tc JOIN users u ON u.id=tc.user_id WHERE tc.id=?').get(result.lastInsertRowid);
  const io = req.app.get('io');
  io.to(`ticket:${req.params.id}`).emit('ticket:comment', { ticket_id: Number(req.params.id), comment: row });
  io.to('general').emit('ticket:comment', { ticket_id: Number(req.params.id), comment: row });
  res.status(201).json(row);
});

router.get('/:id/comments', (req, res) => {
  const rows = db.prepare('SELECT tc.*, u.name user_name FROM ticket_comments tc JOIN users u ON u.id=tc.user_id WHERE ticket_id=? ORDER BY tc.created_at ASC').all(req.params.id);
  res.json(rows);
});

module.exports = router;
