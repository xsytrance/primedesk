const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const myOpen = db.prepare("SELECT COUNT(*) c FROM tickets WHERE assignee_id=? AND status IN ('Open','In Progress','Pending')").get(req.user.id).c;
  const allOpen = db.prepare("SELECT COUNT(*) c FROM tickets WHERE status IN ('Open','In Progress','Pending')").get().c;
  const activeLoad = allOpen;
  const openedToday = db.prepare("SELECT COUNT(*) c FROM tickets WHERE date(created_at)=date('now')").get().c;
  const closedToday = db.prepare("SELECT COUNT(*) c FROM tickets WHERE status='Closed' AND date(updated_at)=date('now')").get().c;
  const recent = db.prepare('SELECT * FROM ticket_activity ORDER BY created_at DESC LIMIT 10').all();
  const msp = db.prepare('SELECT * FROM rotation_log ORDER BY start_date DESC LIMIT 1').get();
  const leaderboard = db.prepare('SELECT id,name,xp,level FROM users WHERE role IN (\'admin\',\'senior_admin\') ORDER BY xp DESC LIMIT 5').all();
  res.json({ myOpen, allOpen, activeLoad, openedToday, closedToday, recent, msp, leaderboard });
});

module.exports = router;
