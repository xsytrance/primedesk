const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const channel = req.query.channel || 'general';
  const rows = db.prepare(`SELECT m.*, u.name as sender_name
    FROM messages m
    JOIN users u ON u.id=m.sender_id
    WHERE channel=?
    ORDER BY m.created_at DESC LIMIT 200`).all(channel);
  res.json(rows.reverse().map((r) => ({ ...r, reactions: JSON.parse(r.reactions || '{}') })));
});

router.post('/', roles('admin', 'senior_admin', 'msp'), (req, res) => {
  const { channel = 'general', receiver_id = null, body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'Message required' });

  const result = db.prepare('INSERT INTO messages (channel, sender_id, receiver_id, body) VALUES (?, ?, ?, ?)')
    .run(channel, req.user.id, receiver_id, body.trim());

  const msg = db.prepare('SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON u.id=m.sender_id WHERE m.id=?').get(result.lastInsertRowid);
  msg.reactions = JSON.parse(msg.reactions || '{}');
  const io = req.app.get('io');
  io.to(channel).emit('chat:new', msg);
  if (receiver_id) io.to(`user:${receiver_id}`).emit('chat:new', msg);
  res.status(201).json(msg);
});

router.patch('/:id/read', (req, res) => {
  db.prepare('UPDATE messages SET read_at=? WHERE id=?').run(new Date().toISOString(), req.params.id);
  res.json({ ok: true });
});

router.patch('/:id/react', (req, res) => {
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: 'emoji required' });

  const m = db.prepare('SELECT * FROM messages WHERE id=?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'message not found' });

  const reactions = JSON.parse(m.reactions || '{}');
  if (!reactions[emoji]) reactions[emoji] = [];
  if (!reactions[emoji].includes(req.user.id)) reactions[emoji].push(req.user.id);
  db.prepare('UPDATE messages SET reactions=? WHERE id=?').run(JSON.stringify(reactions), req.params.id);

  res.json({ ok: true, reactions });
});

module.exports = router;
