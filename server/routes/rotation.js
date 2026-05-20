const express = require('express');
const db = require('../db/database');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();
router.use(auth);

router.get('/', (_, res) => {
  const rows = db.prepare('SELECT * FROM rotation_log ORDER BY start_date DESC LIMIT 50').all();
  res.json(rows);
});

router.post('/', roles('admin', 'senior_admin'), (req, res) => {
  const { msp_name, contact_info = '', start_date, end_date = null, notes = '' } = req.body;
  if (!msp_name || !start_date) return res.status(400).json({ error: 'msp_name/start_date required' });
  const result = db.prepare('INSERT INTO rotation_log (msp_name, contact_info, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)')
    .run(msp_name, contact_info, start_date, end_date, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

module.exports = router;
