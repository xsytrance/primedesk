let token = localStorage.getItem('pd_token') || '';
let user = null;
let socket = null;
let activeTab = 'home';
let activeTicketId = null;
let notifCount = 0;
let jamTracks = [];
let jamIndex = -1;
const LOGIN_TELEMETRY_KEY = 'pd_login_telemetry_v1';
let eyeLines = [
  'I SEE EVERYTHING.',
  'YOUR QUEUE CONFESSES TO ME.',
  'SLA DEBT ACCRUES IN BLOOD.'
];
let lastContextTauntAt = 0;

function getRivalName() {
  const me = (user?.name || '').toLowerCase();
  if (me.includes('egi')) return 'Patrick';
  if (me.includes('patrick')) return 'Egi';
  return 'your rival';
}

function refreshEyeLines() {
  const me = user?.name || 'Operator';
  const rival = getRivalName();
  eyeLines = [
    `${me}, I WATCH YOUR OPEN TICKETS.`,
    `${me}, YOUR SLA CLOCK IS BLEEDING.`,
    `${rival} IS HUNTING YOUR XP.`,
    `${me}, I SAW THAT MISSED UPDATE.`,
    `NOTHING HIDES FROM ME, ${me}.`,
    `${rival} WILL PASS YOU IF YOU STALL.`
  ];
}

function maybeContextTaunt(lines) {
  const now = Date.now();
  if (now - lastContextTauntAt < 12000) return;
  if (!lines || !lines.length) return;
  lastContextTauntAt = now;
  eyeSpeak(lines[Math.floor(Math.random() * lines.length)]);
}

function handleLoginEnter(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    login();
  }
}

function safeReadTelemetry() {
  try { return JSON.parse(localStorage.getItem(LOGIN_TELEMETRY_KEY) || '{}') || {}; }
  catch { return {}; }
}

function safeWriteTelemetry(data) {
  localStorage.setItem(LOGIN_TELEMETRY_KEY, JSON.stringify(data));
}

function seedMiniMapForName(name) {
  const base = (name || 'operator').toLowerCase();
  let n = 0;
  for (let i = 0; i < base.length; i += 1) n += base.charCodeAt(i) * (i + 3);
  return { x: 10 + (n % 80), y: 18 + ((n * 7) % 62) };
}

function formatLoc(entry) {
  if (!entry) return 'NODE PRIME';
  if (entry.lat != null && entry.lon != null) return `LAT ${Number(entry.lat).toFixed(2)} / LON ${Number(entry.lon).toFixed(2)}`;
  return entry.lastLoc || 'NODE PRIME';
}

function renderOpsFooter() {
  const box = document.getElementById('opsFooter');
  if (!box || !user) return;
  const db = safeReadTelemetry();
  const me = (user.name || '').toLowerCase();
  const egi = db.egi || { count: 0, lastLoc: 'NODE PRIME' };
  const patrick = db.patrick || { count: 0, lastLoc: 'NODE PRIME' };
  const meEntry = db[me] || seedMiniMapForName(me);
  const mapX = meEntry.lat != null ? ((Number(meEntry.lon) + 180) / 360 * 100) : meEntry.x;
  const mapY = meEntry.lat != null ? ((90 - Number(meEntry.lat)) / 180 * 100) : meEntry.y;
  box.classList.remove('hidden');
  box.innerHTML = `<div class='ops-lines'><div class='ops-head'>// ACCESS LOG</div><div>egi :: logins ${egi.count} :: ${formatLoc(egi)}</div><div>patrick :: logins ${patrick.count} :: ${formatLoc(patrick)}</div></div><div class='ops-mini-map' aria-hidden='true'><span class='ops-dot' style='left:${Math.max(6, Math.min(94, mapX))}%; top:${Math.max(8, Math.min(92, mapY))}%;'></span></div>`;
}

function updateMyGeoTelemetry() {
  if (!user || !navigator.geolocation) return;
  const key = (user.name || '').toLowerCase();
  navigator.geolocation.getCurrentPosition((pos) => {
    const db = safeReadTelemetry();
    const old = db[key] || { count: 0 };
    db[key] = { ...old, lat: pos.coords.latitude, lon: pos.coords.longitude, lastLoc: 'LIVE GEOLOCK', lastSeen: new Date().toISOString() };
    safeWriteTelemetry(db);
    renderOpsFooter();
  }, () => {}, { enableHighAccuracy: false, timeout: 3500, maximumAge: 3600000 });
}

function recordLoginTelemetry() {
  if (!user) return;
  const key = (user.name || '').toLowerCase();
  const db = safeReadTelemetry();
  const old = db[key] || { count: 0, ...seedMiniMapForName(key) };
  db[key] = { ...old, count: Number(old.count || 0) + 1, lastSeen: new Date().toISOString(), lastLoc: Intl.DateTimeFormat().resolvedOptions().timeZone || 'NODE PRIME' };
  safeWriteTelemetry(db);
  renderOpsFooter();
  updateMyGeoTelemetry();
}

async function bootstrapSession() {
  if (!token) return;
  try {
    const data = await api('/api/auth/me');
    user = data.user;
    refreshEyeLines();
    renderMe();
    document.getElementById('loginCard').classList.add('hidden');
    if (user.must_change_password) {
      document.getElementById('forcePwCard').classList.remove('hidden');
      document.body.classList.remove('logged-out');
      return;
    }
    startApp();
  } catch {
    token = '';
    localStorage.removeItem('pd_token');
  }
}

function getXpStatusLine(d) {
  const me = user?.name || 'Operator';
  const rival = getRivalName();
  if (!Array.isArray(d?.leaderboard) || !d.leaderboard.length) return null;
  const mine = d.leaderboard.find((x) => Number(x.id) === Number(user?.id));
  const top = d.leaderboard[0];
  if (!mine || !top) return null;
  if (Number(top.id) === Number(mine.id)) return `YOU LEAD XP, ${me}. DO NOT GET COMPLACENT.`;
  return `${rival} OR SOMEONE ELSE LEADS XP. YOU TRAIL AT ${mine.xp}.`;
}

function updateEyeContextFromDashboard(d) {
  const me = user?.name || 'Operator';
  const lines = [];
  if (d.p1p2 > 0) lines.push(`ALERT, ${me}: ${d.p1p2} CRITICAL FIRES ARE STILL BURNING.`);
  if (d.myOpen >= 5) lines.push(`${me}, YOUR QUEUE IS STACKING AT ${d.myOpen}. MOVE.`);
  if (d.openedToday > d.closedToday) lines.push(`INTAKE OUTPACES CLOSURE. THIS IS HOW BACKLOGS ARE BORN.`);
  const xpLine = getXpStatusLine(d);
  if (xpLine) lines.push(xpLine);
  maybeContextTaunt(lines);
}

async function api(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function renderNotif() { const el = document.getElementById('notif'); if (el) el.textContent = `🔔 ${notifCount}`; }
function bumpNotif() { notifCount += 1; renderNotif(); eyeSpeak('A NEW SIGNAL ARRIVES.'); }
function clearNotif() { notifCount = 0; renderNotif(); }

function setTab(name) {
  activeTab = name;
  if (['home', 'tickets', 'chat', 'kb'].includes(name)) clearNotif();
  document.querySelectorAll('.tab').forEach((t) => t.classList.add('hidden'));
  document.getElementById(`tab-${name}`).classList.remove('hidden');
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('active'));
  const btn = document.querySelector(`.tabs button[onclick="setTab('${name}')"]`);
  if (btn) btn.classList.add('active');
  if (name === 'home') loadHome();
  if (name === 'tickets') loadTickets();
  if (name === 'chat') loadChat();
  if (name === 'kb') loadKb();
  if (name === 'xp') loadXp();
}

async function login() {
  try {
    const identifier = document.getElementById('identifier')?.value || document.getElementById('operator')?.value || '';
    const password = document.getElementById('password').value;
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
    token = data.token;
    user = data.user;
    refreshEyeLines();
    recordLoginTelemetry();
    localStorage.setItem('pd_token', token);
    renderMe();
    document.getElementById('loginCard').classList.add('hidden');
    if (user.must_change_password) { document.getElementById('forcePwCard').classList.remove('hidden'); return; }
    startApp();
    eyeSpeak(`WELCOME, ${user.name.toUpperCase()}. I SEE ALL FLOWS.`);
  } catch (err) {
    alert('Login failed. Check username/password.');
    console.error(err);
  }
}

function renderMe() {
  const me = document.getElementById('me');
  const av = user?.avatar_url ? `<img src='${user.avatar_url}' class='avatar'>` : `<span class='avatar ph blank' aria-label='blank avatar'></span>`;
  me.innerHTML = `${av}<span>${user.name} (${user.role}) L${user.level}</span>`;
}

function startApp() {
  document.body.classList.remove('logged-out');
  document.getElementById('forcePwCard').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderOpsFooter();
  startEyeMotion();
  if (!socket) {
    socket = io({ auth: { token } });
    socket.on('chat:new', () => { if (activeTab === 'chat') loadChat(); else bumpNotif(); });
    socket.on('ticket:new', () => { if (activeTab === 'tickets') loadTickets(); else bumpNotif(); if (activeTab === 'home') loadHome(); });
    socket.on('ticket:updated', () => { if (activeTab === 'tickets') loadTickets(); else bumpNotif(); if (activeTab === 'home') loadHome(); });
    socket.on('ticket:comment', (payload) => { if (activeTicketId && Number(payload.ticket_id) === Number(activeTicketId)) viewTicket(activeTicketId); else bumpNotif(); });
    socket.on('kb:new', () => { if (activeTab === 'kb') loadKb(); else bumpNotif(); });
  }
  renderNotif();
  setTab(activeTab);
}

async function changePassword() {
  const newPassword = document.getElementById('newPassword').value;
  await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ newPassword }) });
  user.must_change_password = false;
  startApp();
}

async function loadHome() {
  const d = await api('/api/dashboard');
  updateEyeContextFromDashboard(d);
  document.getElementById('tab-home').innerHTML = `
    <h2>Main Ops Board</h2>
    <div class='hero-sub'>War-room telemetry and operator controls</div>
    <div class='kpis'>
      <div class='pill'>My Open: ${d.myOpen}</div><div class='pill'>All Open: ${d.allOpen}</div>
      <div class='pill ${d.p1p2 > 0 ? 'p1' : 'ok'}'>P1/P2: ${d.p1p2}</div>
      <div class='pill'>Opened today: ${d.openedToday}</div><div class='pill'>Closed today: ${d.closedToday}</div>
    </div>
    <div class='home-compact'>
      <div class='card'>
        <h3>Profile picture</h3>
        <input id='avatarFile' type='file' accept='image/*' />
        <button onclick='uploadAvatar()'>Upload Avatar</button>
      </div>
      <div class='card'><h3>MSP On Duty</h3><div>${d.msp ? `${d.msp.msp_name} — ${d.msp.contact_info || 'n/a'}` : 'Not set'}</div></div>
      <div class='card music-dock'>
        <h3>Jamendo Player</h3>
        <div class='row'>
          <input id='jamQ' placeholder='search vibe' value='dark synthwave'/>
          <button onclick='loadTrack()'>Load</button>
        </div>
        <div class='row music-controls'>
          <button onclick='prevTrack()'>◀ Prev</button>
          <button onclick='toggleTrack()'>Play / Pause</button>
          <button onclick='nextTrack()'>Next ▶</button>
        </div>
        <div id='jamNow' class='hero-sub'>Paused by default.</div>
        <audio id='jamPlayer' controls preload='none'></audio>
      </div>
    </div>`;
  await loadTrack();
}

async function loadTrack() {
  const q = document.getElementById('jamQ')?.value?.trim() || 'dark synthwave';
  const data = await api(`/api/media/jamendo/tracks?q=${encodeURIComponent(q)}&limit=8`);
  jamTracks = data.results || [];
  jamIndex = jamTracks.length ? 0 : -1;
  const t = jamTracks[jamIndex];
  const now = document.getElementById('jamNow');
  if (!t) {
    if (now) now.textContent = 'No track found. Paused by default.';
    return;
  }
  setTrack(t.audio, `${t.name} - ${t.artist_name}`);
}
function setTrack(url, name) {
  const p = document.getElementById('jamPlayer');
  const now = document.getElementById('jamNow');
  p.src = url;
  p.pause();
  if (now) now.textContent = `READY: ${name}`;
  eyeSpeak(`TRACK READY: ${name.toUpperCase()}`);
}
function nextTrack() {
  if (!jamTracks.length) return;
  jamIndex = (jamIndex + 1) % jamTracks.length;
  const t = jamTracks[jamIndex];
  setTrack(t.audio, `${t.name} - ${t.artist_name}`);
}
function prevTrack() {
  if (!jamTracks.length) return;
  jamIndex = (jamIndex - 1 + jamTracks.length) % jamTracks.length;
  const t = jamTracks[jamIndex];
  setTrack(t.audio, `${t.name} - ${t.artist_name}`);
}
function toggleTrack() {
  const p = document.getElementById('jamPlayer');
  if (!p) return;
  if (p.paused) p.play(); else p.pause();
}

async function uploadAvatar() {
  const file = document.getElementById('avatarFile').files[0];
  if (!file) return;
  const fd = new FormData(); fd.append('file', file);
  const up = await api('/api/upload', { method: 'POST', body: fd });
  await api('/api/users/me/avatar', { method: 'PATCH', body: JSON.stringify({ avatar_url: up.file }) });
  user.avatar_url = up.file;
  renderMe();
  eyeSpeak('YOUR VISAGE IS SAVED.');
}

async function loadTickets() {
  const q = document.getElementById('ticketSearch').value.trim();
  const status = document.getElementById('statusFilter').value;
  const params = new URLSearchParams(); if (q) params.set('q', q); if (status) params.set('status', status);
  const rows = await api(`/api/tickets?${params.toString()}`);
  document.getElementById('tickets').innerHTML = rows.map((t) => `<div class='ticket'><div><b>${t.ticket_code || 'TKT-????'} — ${t.title}</b></div><div class='row'><span class='pill ${t.priority.toLowerCase()}'>${t.priority}</span><select onchange="updateTicketStatus(${t.id}, this.value)">${['Open','In Progress','Pending','Resolved','Closed'].map(s => `<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select><button onclick="viewTicket(${t.id})">View</button></div><div id='ticket-detail-${t.id}' class='hidden'></div></div>`).join('');
}
async function createTicket() { const title = document.getElementById('title').value.trim(); const priority = document.getElementById('priority').value; if (!title) return; await api('/api/tickets', { method: 'POST', body: JSON.stringify({ title, description: '', priority }) }); document.getElementById('title').value = ''; await loadTickets(); await loadHome(); }
async function updateTicketStatus(id, status) {
  await api(`/api/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
  if (status === 'Closed' || status === 'Resolved') {
    eyeSpeak(`GOOD. TICKET ${status.toUpperCase()}. KEEP THE PRESSURE.`);
  } else if (status === 'Pending') {
    eyeSpeak('PENDING IS A TIMER, NOT A RESTING PLACE.');
  } else if (status === 'In Progress') {
    eyeSpeak('EXECUTION ACKNOWLEDGED. FINISH THE KILL.');
  }
  await loadTickets();
  await loadHome();
}
async function viewTicket(id) { activeTicketId = id; if (socket) socket.emit('join', `ticket:${id}`); const d = await api(`/api/tickets/${id}`); const el = document.getElementById(`ticket-detail-${id}`); el.classList.remove('hidden'); el.innerHTML = `<div class='msg'>${d.description || 'No description'}</div><div><b>Comments</b></div>${(d.comments || []).map(c => `<div class='msg'>${c.user_name}: ${c.body}</div>`).join('') || '<div class="msg">No comments</div>'}<div class='row'><input id='comment-${id}' placeholder='Add comment' /><button onclick='addComment(${id})'>Post</button></div>`; }
async function addComment(id) { const el = document.getElementById(`comment-${id}`); const body = el.value.trim(); if (!body) return; await api(`/api/tickets/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) }); await viewTicket(id); }
async function loadChat() { const rows = await api('/api/messages?channel=general'); document.getElementById('chat').innerHTML = rows.map((m) => `<div class='msg'><b>${m.sender_name}:</b> ${m.body}</div>`).join(''); }
async function sendMessage() { const body = document.getElementById('chatBody').value.trim(); if (!body) return; await api('/api/messages', { method: 'POST', body: JSON.stringify({ channel: 'general', body }) }); document.getElementById('chatBody').value = ''; await loadChat(); }
async function loadKb() { const q = document.getElementById('kbSearch').value.trim(); const rows = await api(`/api/kb${q ? `?q=${encodeURIComponent(q)}` : ''}`); document.getElementById('kb').innerHTML = rows.map((k) => `<div class='ticket'><b>${k.title}</b><div>${k.category}</div></div>`).join(''); }
async function createKb() { const title = document.getElementById('kbTitle').value.trim(); const body = document.getElementById('kbBody').value.trim(); if (!title || !body) return; await api('/api/kb', { method: 'POST', body: JSON.stringify({ title, body }) }); document.getElementById('kbTitle').value = ''; document.getElementById('kbBody').value = ''; await loadKb(); }
async function loadXp() {
  const [meData, dash] = await Promise.all([
    api('/api/xp/me'),
    api('/api/dashboard')
  ]);
  const xpLine = getXpStatusLine(dash);
  if (xpLine) maybeContextTaunt([xpLine]);
  document.getElementById('xp').innerHTML = `<div class='pill'>XP: ${meData.user.xp}</div><div class='pill'>Level: ${meData.user.level}</div><h3>Recent XP</h3>${(meData.events || []).slice(0, 20).map((e) => `<div class='msg'>+${e.xp_amount} ${e.action_type}</div>`).join('')}`;
}

function eyeSpeak(text) {
  const bubble = document.getElementById('eye-bubble');
  if (!bubble) return;
  bubble.classList.remove('hidden');
  bubble.textContent = '';
  let i = 0;
  const t = setInterval(() => {
    bubble.textContent += text[i++] || '';
    if (i > text.length) clearInterval(t);
  }, 22);
  setTimeout(() => bubble.classList.add('hidden'), 4200);
}
function startEyeMotion() {
  const eye = document.querySelector('.sauron-eye');
  if (!eye || eye.dataset.live) return;
  eye.dataset.live = '1';
  const bubble = document.createElement('div');
  bubble.id = 'eye-bubble';
  bubble.className = 'eye-bubble hidden';
  document.body.appendChild(bubble);
  setInterval(() => {
    const x = Math.max(8, Math.min(window.innerWidth - 80, Math.random() * window.innerWidth));
    const y = Math.max(120, Math.min(window.innerHeight - 120, 80 + Math.random() * (window.innerHeight - 220)));
    eye.style.left = `${x}px`; eye.style.top = `${y}px`; eye.style.right = 'auto'; eye.style.bottom = 'auto';
    bubble.style.left = `${x - 180}px`; bubble.style.top = `${y - 80}px`;
  }, 5200);
  setInterval(() => eyeSpeak(eyeLines[Math.floor(Math.random() * eyeLines.length)]), 14000);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))))
    .catch(() => {});
}

bootstrapSession();
