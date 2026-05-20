const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const levels = [
  { level: 1, xp: 0, title: 'Helpdesk Grunt' },
  { level: 2, xp: 100, title: 'Cable Monkey' },
  { level: 3, xp: 250, title: 'Ping Jockey' },
  { level: 4, xp: 500, title: 'Break-Fix Tech' },
  { level: 5, xp: 900, title: 'Access Guardian' },
  { level: 6, xp: 1400, title: 'Network Wrangler' },
  { level: 7, xp: 2000, title: 'Systems Operator' },
  { level: 8, xp: 3000, title: 'Infrastructure Pro' },
  { level: 9, xp: 4500, title: 'Senior Architect' },
  { level: 10, xp: 6500, title: 'Prime Admin' },
];

router.get('/me', (req, res) => {
  const user = db.prepare('SELECT id,name,xp,level FROM users WHERE id=?').get(req.user.id);
  const events = db.prepare('SELECT * FROM xp_events WHERE user_id=? ORDER BY created_at DESC LIMIT 100').all(req.user.id);
  res.json({ user, levels, events });
});

module.exports = router;
