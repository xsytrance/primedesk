const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const row = db.prepare('SELECT id,name,role,avatar_url,xp,level,must_change_password FROM users WHERE id=?').get(payload.id);
  if (!row) return res.status(401).json({ error: 'User not found' });
  return res.json({ user: { ...row, must_change_password: !!row.must_change_password } });
});

router.post('/login', (req, res) => {
  const { identifier, email, password } = req.body;
  const loginId = (identifier || email || '').trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE lower(email) = ? OR lower(name) = ?').get(loginId, loginId);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, avatar_url: user.avatar_url || null, xp: user.xp, level: user.level, must_change_password: !!user.must_change_password } });
});

router.post('/change-password', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 chars' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash=?, must_change_password=0 WHERE id=?').run(hash, payload.id);
  res.json({ ok: true });
});

module.exports = router;
