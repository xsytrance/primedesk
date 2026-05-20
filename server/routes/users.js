const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();
router.use(auth);

router.get('/', roles('admin', 'senior_admin'), (req, res) => {
  const rows = db.prepare('SELECT id,name,email,role,avatar_url,xp,level,last_seen FROM users ORDER BY name').all();
  res.json(rows);
});

router.get('/me', (req, res) => {
  const me = db.prepare('SELECT id,name,email,role,avatar_url,xp,level,last_seen FROM users WHERE id=?').get(req.user.id);
  if (!me) return res.status(404).json({ error: 'not found' });
  res.json(me);
});

router.patch('/me/avatar', (req, res) => {
  const { avatar_url } = req.body;
  if (!avatar_url || !avatar_url.startsWith('/uploads/')) return res.status(400).json({ error: 'invalid avatar_url' });
  db.prepare('UPDATE users SET avatar_url=? WHERE id=?').run(avatar_url, req.user.id);
  res.json({ ok: true, avatar_url });
});

module.exports = router;
