const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const q = req.query.q;
  const rows = q
    ? db.prepare('SELECT k.*, u.name as author_name FROM kb_articles k JOIN users u ON u.id = k.author_id WHERE k.title LIKE ? OR k.body LIKE ? OR k.tags LIKE ? ORDER BY updated_at DESC').all(`%${q}%`, `%${q}%`, `%${q}%`)
    : db.prepare('SELECT k.*, u.name as author_name FROM kb_articles k JOIN users u ON u.id = k.author_id ORDER BY updated_at DESC').all();
  res.json(rows.map((r) => ({ ...r, tags: JSON.parse(r.tags || '[]'), linked_ticket_ids: JSON.parse(r.linked_ticket_ids || '[]') })));
});

router.post('/', roles('admin', 'senior_admin'), (req, res) => {
  const { title, body, category = 'Procedures', tags = [], linked_ticket_ids = [] } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title/body required' });
  const now = new Date().toISOString();
  const result = db.prepare('INSERT INTO kb_articles (title, body, category, tags, author_id, linked_ticket_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(title, body, category, JSON.stringify(tags), req.user.id, JSON.stringify(linked_ticket_ids), now, now);
  db.prepare('INSERT INTO xp_events (user_id, action_type, xp_amount, related_id) VALUES (?, ?, ?, ?)').run(req.user.id, 'write_kb', 30, result.lastInsertRowid);
  db.prepare('UPDATE users SET xp = xp + 30 WHERE id=?').run(req.user.id);
  req.app.get('io').to('general').emit('kb:new', { id: result.lastInsertRowid, title, category });
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id', roles('admin', 'senior_admin'), (req, res) => {
  const article = db.prepare('SELECT * FROM kb_articles WHERE id=?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Not found' });

  db.prepare('INSERT INTO kb_versions (article_id, body_snapshot, changed_by) VALUES (?, ?, ?)')
    .run(req.params.id, article.body, req.user.id);

  const title = req.body.title ?? article.title;
  const body = req.body.body ?? article.body;
  const category = req.body.category ?? article.category;
  const tags = req.body.tags ?? JSON.parse(article.tags || '[]');
  const linked = req.body.linked_ticket_ids ?? JSON.parse(article.linked_ticket_ids || '[]');

  db.prepare('UPDATE kb_articles SET title=?, body=?, category=?, tags=?, linked_ticket_ids=?, version=version+1, updated_at=? WHERE id=?')
    .run(title, body, category, JSON.stringify(tags), JSON.stringify(linked), new Date().toISOString(), req.params.id);

  db.prepare('INSERT INTO xp_events (user_id, action_type, xp_amount, related_id) VALUES (?, ?, ?, ?)').run(req.user.id, 'update_kb', 10, req.params.id);
  db.prepare('UPDATE users SET xp = xp + 10 WHERE id=?').run(req.user.id);

  res.json({ ok: true });
});

router.get('/:id/versions', (req, res) => {
  const rows = db.prepare('SELECT kv.*, u.name as changed_by_name FROM kb_versions kv JOIN users u ON u.id=kv.changed_by WHERE article_id=? ORDER BY changed_at DESC').all(req.params.id);
  res.json(rows);
});

module.exports = router;
