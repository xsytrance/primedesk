const express = require('express');

const router = express.Router();

router.get('/jamendo/tracks', async (req, res) => {
  try {
    const clientId = process.env.JAMENDO_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'Jamendo not configured' });

    const q = (req.query.q || 'cyberpunk synthwave').toString();
    const limit = Math.min(20, Math.max(1, Number(req.query.limit || 10)));

    const url = new URL('https://api.jamendo.com/v3.0/tracks/');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('search', q);
    url.searchParams.set('audioformat', 'mp31');
    url.searchParams.set('include', 'musicinfo');

    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Jamendo upstream error' });
    const data = await r.json();

    const results = (data.results || []).map((t) => ({
      id: t.id,
      name: t.name,
      artist_name: t.artist_name,
      audio: t.audio,
      image: t.image,
      duration: t.duration
    }));
    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load tracks' });
  }
});

module.exports = router;
