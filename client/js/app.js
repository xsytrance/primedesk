let token = localStorage.getItem('pd_token') || '';
let user = null;
let socket = null;
let activeTab = 'home';
let activeTicketId = null;
let notifCount = 0;
let jamTracks = [];
let jamIndex = -1;
let avatarDraftUrl = '';
let avatarZoom = 1;
const LOGIN_TELEMETRY_KEY = 'pd_login_telemetry_v1';
const THEME_STORE_KEY = 'pd_theme_store_v1';
let eyeLines = [
  'I SEE EVERYTHING.',
  'YOUR QUEUE CONFESSES TO ME.',
  'SLA DEBT ACCRUES IN BLOOD.'
];
let lastContextTauntAt = 0;

const OFFICE_LOCATIONS = [
  {
    key: 'New York City',
    icon: '🗽',
    label: 'New York City',
    short: 'NYC',
    blurb: 'Main HQ · finance + media velocity'
  },
  {
    key: 'San Francisco',
    icon: '🌉',
    label: 'San Francisco',
    short: 'SF',
    blurb: 'Innovation node · product + engineering'
  },
  {
    key: 'Washington DC',
    icon: '🏛️',
    label: 'Washington DC',
    short: 'DC',
    blurb: 'Policy node · gov + enterprise'
  }
];

function getOfficeMeta(name) {
  return OFFICE_LOCATIONS.find((o) => o.key === name) || OFFICE_LOCATIONS[0];
}

function renderOfficeStrip() {
  const el = document.getElementById('officeStrip');
  if (!el) return;
  el.innerHTML = OFFICE_LOCATIONS
    .map((o) => `<span class='office-chip office-${o.short.toLowerCase()}' title='${o.blurb}'>${o.icon} ${o.short}</span>`)
    .join('');
}

function officeBadgeHtml(name) {
  const o = getOfficeMeta(name);
  return `<span class='pill office-badge office-${o.short.toLowerCase()}' title='${o.blurb}'>${o.icon} ${o.label}</span>`;
}

function getRivalName() {
  const me = (user?.name || '').toLowerCase();
  if (me.includes('operator1')) return 'Operator2';
  if (me.includes('operator2')) return 'Operator1';
  return 'your rival';
}

function refreshEyeLines() {
  const me = user?.name || 'Operator';
  const rival = getRivalName();
  const meLc = String(me).toLowerCase();
  const isOperator1 = meLc.includes('operator1');
  const isOperator2 = meLc.includes('operator2');
  eyeLines = [
    `${me}, ONE DOES NOT SIMPLY LET TICKETS ROT IN THE SHIRE.`,
    `${me}, THE PALANTÍR SEES EVERY STALE UPDATE.`,
    `EVEN THE SMALLEST TICKET CAN CHANGE THE COURSE OF THE SPRINT.`,
    `${rival} IS HUNTING YOUR XP. OUTPACE THEM.`,
    `${me}, KEEP PRIME DESK CLEAN OR SHADOW CLAIMS THE BOARD.`,
    `ASK BETTER QUESTIONS. CLOSE BETTER TICKETS.`,
    ...(isOperator1 ? [
      `OPERATOR1, BE SHARPER THAN OPERATOR2 TODAY. LEAD THE WAR-ROOM.`,
      `OPERATOR1, SHOW YOUR WORK SO OPERATOR2 CAN LEVEL UP FAST.`
    ] : []),
    ...(isOperator2 ? [
      `OPERATOR2, SEEK OPERATOR1'S WISDOM. ASK QUESTIONS EARLY, NOT LATE.`,
      `OPERATOR2, BRING IDEAS TO PRIME DESK: PROPOSE, TEST, IMPROVE.`,
      `OPERATOR2, LEARN THE CRAFT. ASK OPERATOR1 WHY, NOT JUST WHAT.`
    ] : [])
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

function safeReadThemeStore() {
  try {
    const raw = JSON.parse(localStorage.getItem(THEME_STORE_KEY) || '{}') || {};
    return {
      defaults: raw.defaults || null,
      customs: Array.isArray(raw.customs) ? raw.customs : [],
      active: raw.active || null
    };
  } catch {
    return { defaults: null, customs: [], active: null };
  }
}

function safeWriteThemeStore(data) {
  localStorage.setItem(THEME_STORE_KEY, JSON.stringify(data));
}

function ensureDefaultThemeSaved() {
  const s = safeReadThemeStore();
  if (s.defaults) return;
  const style = getComputedStyle(document.documentElement);
  s.defaults = {
    id: 'default',
    tokens: {
      '--bg': style.getPropertyValue('--bg').trim(),
      '--panel': style.getPropertyValue('--panel').trim(),
      '--txt': style.getPropertyValue('--txt').trim(),
      '--muted': style.getPropertyValue('--muted').trim(),
      '--line': style.getPropertyValue('--line').trim(),
      '--atlas-primary': style.getPropertyValue('--atlas-primary').trim(),
      '--atlas-primary-hover': style.getPropertyValue('--atlas-primary-hover').trim(),
      '--atlas-blue': style.getPropertyValue('--atlas-blue').trim(),
      '--ok': style.getPropertyValue('--ok').trim(),
      '--warn': style.getPropertyValue('--warn').trim(),
      '--danger': style.getPropertyValue('--danger').trim()
    }
  };
  safeWriteThemeStore(s);
}

function applyThemeTokens(tokens, scope = 'global') {
  const target = scope === 'home' ? document.getElementById('tab-home') : document.documentElement;
  if (!target || !tokens) return;
  Object.entries(tokens).forEach(([k, v]) => target.style.setProperty(k, v));
}

function applyActiveThemeFromStore() {
  ensureDefaultThemeSaved();
  const s = safeReadThemeStore();
  if (!s.active?.id) return;
  const theme = s.active.id === 'default'
    ? s.defaults
    : s.customs.find((c) => c.id === s.active.id);
  if (!theme?.tokens) return;
  applyThemeTokens(theme.tokens, s.active.scope || 'global');
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')}`;
}

function mix(a, b, t) {
  const ar = hexToRgb(a); const br = hexToRgb(b);
  return rgbToHex(ar.r + (br.r - ar.r) * t, ar.g + (br.g - ar.g) * t, ar.b + (br.b - ar.b) * t);
}

function analyzeAvatarColors(img) {
  const c = document.createElement('canvas');
  c.width = 48; c.height = 48;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, 48, 48);
  const data = ctx.getImageData(0, 0, 48, 48).data;
  let r = 0; let g = 0; let b = 0; let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 10) continue;
    r += data[i]; g += data[i + 1]; b += data[i + 2]; n += 1;
  }
  if (!n) return null;
  const base = rgbToHex(r / n, g / n, b / n);
  return {
    base,
    dark: mix(base, '#05070a', 0.78),
    panel: mix(base, '#101826', 0.68),
    line: mix(base, '#22324a', 0.52),
    accent: mix(base, '#7affd0', 0.35),
    accentHover: mix(base, '#5ef0bf', 0.45),
    text: '#e9f4ff',
    muted: mix(base, '#9fb4cc', 0.62)
  };
}

function buildThemeFromPalette(p) {
  return {
    '--bg': p.dark,
    '--panel': p.panel,
    '--txt': p.text,
    '--muted': p.muted,
    '--line': p.line,
    '--atlas-primary': p.accent,
    '--atlas-primary-hover': p.accentHover,
    '--atlas-blue': mix(p.accent, '#4f83ff', 0.45),
    '--ok': mix(p.accent, '#32d399', 0.35),
    '--warn': '#f59e0b',
    '--danger': '#ef4444'
  };
}

function saveCustomTheme(tokens, scope, label) {
  const s = safeReadThemeStore();
  const id = `${label}-${Date.now()}`;
  s.customs.unshift({ id, label, tokens, scope, createdAt: new Date().toISOString() });
  s.active = { id, scope };
  safeWriteThemeStore(s);
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
  ensureDefaultThemeSaved();
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
  const meLc = String(me).toLowerCase();
  const isEgi = meLc.includes('egi');
  const isPatrick = meLc.includes('patrick');
  const lines = [];
  if (d.activeLoad > 0) lines.push(`ALERT, ${me}: ${d.activeLoad} ACTIVE TICKETS STILL BURN.`);
  if (d.myOpen >= 5) lines.push(`${me}, YOUR QUEUE IS STACKING AT ${d.myOpen}. MOVE.`);
  if (d.openedToday > d.closedToday) lines.push(`INTAKE OUTPACES CLOSURE. THIS IS HOW BACKLOGS ARE BORN.`);
  if (isEgi) lines.push('EGI: TEACH, CHALLENGE, AND STAY 2 STEPS AHEAD OF PATRICK.');
  if (isPatrick) lines.push('PATRICK: ASK EGI MORE QUESTIONS. LEARN, SUGGEST, ITERATE.');
  if (isPatrick) lines.push('PATRICK: BRING ONE NEW IDEA TO PRIME DESK EACH SESSION.');
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
  if (['home', 'tickets', 'laptops', 'chat', 'kb'].includes(name)) clearNotif();
  document.querySelectorAll('.tab').forEach((t) => t.classList.add('hidden'));
  document.getElementById(`tab-${name}`).classList.remove('hidden');
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('active'));
  const btn = document.querySelector(`.tabs button[onclick="setTab('${name}')"]`);
  if (btn) btn.classList.add('active');
  if (name === 'home') loadHome();
  if (name === 'tickets') loadTickets();
  if (name === 'laptops') loadLaptops();
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
  const av = user?.avatar_url ? `<img src='${user.avatar_url}' class='avatar avatar-lg'>` : `<span class='avatar ph blank avatar-lg' aria-label='blank avatar'></span>`;
  me.innerHTML = `${av}<span>${user.name} (${user.role}) L${user.level}</span>`;
}

function startApp() {
  document.body.classList.remove('logged-out');
  document.getElementById('forcePwCard').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  applyActiveThemeFromStore();
  renderOfficeStrip();
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
    <div class='office-grid'>
      ${OFFICE_LOCATIONS.map((o) => `<div class='office-panel office-${o.short.toLowerCase()}'><div class='office-icon'>${o.icon}</div><div><b>${o.label}</b><div class='hero-sub'>${o.blurb}</div></div></div>`).join('')}
    </div>
    <div class='kpis'>
      <div class='pill'>My Open: ${d.myOpen}</div><div class='pill'>All Open: ${d.allOpen}</div>
      <div class='pill ${d.activeLoad > 0 ? 'p1' : 'ok'}'>Active Load: ${d.activeLoad}</div>
      <div class='pill'>Opened today: ${d.openedToday}</div><div class='pill'>Closed today: ${d.closedToday}</div>
    </div>
    <div class='home-compact'>
      <div class='card avatar-card'>
        <h3>Profile picture</h3>
        <div class='avatar-preview-wrap'>
          <img id='avatarPreview' class='avatar-preview hidden' alt='avatar preview' />
          <div id='avatarPreviewEmpty' class='avatar-preview-empty'>NO IMAGE LOADED</div>
        </div>
        <label class='hero-sub' for='avatarZoom'>Thumbnail scale</label>
        <input id='avatarZoom' type='range' min='1' max='3' step='0.05' value='1' oninput='updateAvatarPreviewZoom()' />
        <input id='avatarFile' type='file' accept='image/*' onchange='handleAvatarFileChange(event)' />
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
  applyActiveThemeFromStore();
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
  const blob = await buildAvatarUploadBlob(file);
  const fd = new FormData(); fd.append('file', blob, `avatar-${Date.now()}.jpg`);
  const up = await api('/api/upload', { method: 'POST', body: fd });
  await api('/api/users/me/avatar', { method: 'PATCH', body: JSON.stringify({ avatar_url: up.file }) });
  user.avatar_url = up.file;
  renderMe();
  eyeSpeak('YOUR VISAGE IS SAVED.');
  await maybeOfferAvatarTheme(up.file);
}

async function maybeOfferAvatarTheme(url) {
  try {
    ensureDefaultThemeSaved();
    const yes = window.confirm('Use your profile image colors to restyle PrimeDesk?');
    if (!yes) return;
    const full = window.confirm('Apply to EVERYTHING? (Cancel = main page only)');
    const scope = full ? 'global' : 'home';
    const img = await loadImage(url);
    const palette = analyzeAvatarColors(img);
    if (!palette) return;
    const tokens = buildThemeFromPalette(palette);
    applyThemeTokens(tokens, scope);
    const save = window.confirm('Save this as a custom theme preset?');
    if (save) {
      const label = (window.prompt('Theme name?', `${(user?.name || 'operator')}-avatar`) || '').trim() || `${(user?.name || 'operator')}-avatar`;
      saveCustomTheme(tokens, scope, label);
    }
  } catch (e) {
    console.error(e);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function handleAvatarFileChange(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  if (avatarDraftUrl) URL.revokeObjectURL(avatarDraftUrl);
  avatarDraftUrl = URL.createObjectURL(file);
  const img = document.getElementById('avatarPreview');
  const empty = document.getElementById('avatarPreviewEmpty');
  img.src = avatarDraftUrl;
  img.classList.remove('hidden');
  empty.classList.add('hidden');
  updateAvatarPreviewZoom();
}

function updateAvatarPreviewZoom() {
  const z = Number(document.getElementById('avatarZoom')?.value || 1);
  avatarZoom = Math.max(1, Math.min(3, z));
  const img = document.getElementById('avatarPreview');
  if (img) img.style.transform = `scale(${avatarZoom})`;
}

function readImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function buildAvatarUploadBlob(file) {
  const img = await readImageFromFile(file);
  const side = 256;
  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');
  const base = Math.min(img.width, img.height);
  const crop = base / avatarZoom;
  const sx = (img.width - crop) / 2;
  const sy = (img.height - crop) / 2;
  ctx.drawImage(img, sx, sy, crop, crop, 0, 0, side, side);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92));
}

async function loadTickets() {
  const q = document.getElementById('ticketSearch').value.trim();
  const status = document.getElementById('statusFilter').value;
  const params = new URLSearchParams(); if (q) params.set('q', q); if (status) params.set('status', status);
  const rows = await api(`/api/tickets?${params.toString()}`);
  document.getElementById('tickets').innerHTML = rows.map((t) => `<div class='ticket'><div><b>${t.ticket_code || 'TKT-????'} — ${t.title}</b></div><div class='row'><span class='pill'>${t.timing || 'later'}</span><span class='pill'>${t.status}</span><select onchange="updateTicketStatus(${t.id}, this.value)">${['Open','In Progress','Pending','Resolved','Closed'].map(s => `<option ${s===t.status?'selected':''}>${s}</option>`).join('')}</select><button onclick="viewTicket(${t.id})">View</button></div><div id='ticket-detail-${t.id}' class='hidden'></div></div>`).join('');
}
async function createTicket() { const title = document.getElementById('title').value.trim(); const timing = document.getElementById('timing').value; if (!title) return; await api('/api/tickets', { method: 'POST', body: JSON.stringify({ title, description: '', timing }) }); document.getElementById('title').value = ''; await loadTickets(); await loadHome(); }
async function loadLaptops() {
  const month = document.getElementById('lapMonth')?.value || '';
  const status = document.getElementById('lapStatusFilter')?.value || '';
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (status) params.set('status', status);
  const rows = await api(`/api/laptops?${params.toString()}`);
  const grouped = rows.reduce((acc, r) => {
    const key = r.due_date || 'No due date';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});
  const keys = Object.keys(grouped).sort();
  document.getElementById('laptops').innerHTML = keys.map((date) => {
    const items = grouped[date].map((r) => `<div class='msg'>
      <b>${r.action_type.toUpperCase()}</b> • ${officeBadgeHtml(r.office)} • ${r.assignee_name || 'Unassigned'} ${r.laptop_tag ? `• ${r.laptop_tag}` : ''}
      <div>${r.notes || ''}</div>
      <div class='row'>
        <span class='pill'>${r.status}</span>
        <button onclick="toggleLaptopComplete(${r.id}, '${r.status}')">${r.status === 'Completed' ? 'Reopen' : 'Complete'}</button>
        <button onclick="editLaptopTask(${r.id}, '${(r.office || '').replace(/'/g, "&#39;")}', '${(r.action_type || '').replace(/'/g, "&#39;")}', '${(r.due_date || '').replace(/'/g, "&#39;")}', '${(r.assignee_name || '').replace(/'/g, "&#39;")}', '${(r.laptop_tag || '').replace(/'/g, "&#39;")}', '${(r.notes || '').replace(/'/g, "&#39;")}')">Edit</button>
        <button onclick="deleteLaptopTask(${r.id})">Delete</button>
      </div>
    </div>`).join('');
    return `<div class='ticket'><b>${date}</b>${items}</div>`;
  }).join('') || `<div class='msg'>No outgoing laptop tasks this month.</div>`;
}
async function createLaptopTask() {
  const due_date = document.getElementById('lapDue').value;
  if (!due_date) return alert('Pick a due date');
  await api('/api/laptops', {
    method: 'POST',
    body: JSON.stringify({
      laptop_tag: document.getElementById('lapTag').value.trim(),
      assignee_name: document.getElementById('lapAssignee').value.trim(),
      action_type: document.getElementById('lapAction').value,
      office: (document.getElementById('lapOffice').value || 'New York City').trim(),
      due_date,
      notes: document.getElementById('lapNotes').value.trim()
    })
  });
  document.getElementById('lapTag').value = '';
  document.getElementById('lapAssignee').value = '';
  document.getElementById('lapNotes').value = '';
  await loadLaptops();
  eyeSpeak('OUTGOING LAPTOP TASK LOGGED.');
}
async function toggleLaptopComplete(id, status) {
  await api(`/api/laptops/${id}`, { method: 'PATCH', body: JSON.stringify({ status: status === 'Completed' ? 'Open' : 'Completed' }) });
  await loadLaptops();
}
async function editLaptopTask(id, office, action_type, due_date, assignee_name, laptop_tag, notes) {
  const newDue = (window.prompt('Due date (YYYY-MM-DD):', due_date || '') || '').trim();
  if (!newDue) return;
  const newOfficeRaw = (window.prompt('Office (New York City / San Francisco / Washington DC):', office || 'New York City') || 'New York City').trim();
  const newOffice = getOfficeMeta(newOfficeRaw).key;
  const newAction = (window.prompt('Action (send/setup):', action_type || 'send') || 'send').trim().toLowerCase();
  const newAssignee = (window.prompt('Recipient / setup owner:', assignee_name || '') || '').trim();
  const newTag = (window.prompt('Laptop tag:', laptop_tag || '') || '').trim();
  const newNotes = (window.prompt('Notes:', notes || '') || '').trim();
  await api(`/api/laptops/${id}`, { method: 'PATCH', body: JSON.stringify({ due_date: newDue, office: newOffice, action_type: newAction, assignee_name: newAssignee, laptop_tag: newTag, notes: newNotes }) });
  await loadLaptops();
}
async function deleteLaptopTask(id) {
  if (!window.confirm('Delete this outgoing laptop task?')) return;
  await api(`/api/laptops/${id}`, { method: 'DELETE' });
  await loadLaptops();
}
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

    const bw = bubble.offsetWidth || 240;
    const bh = bubble.offsetHeight || 48;
    const margin = 10;

    let bx = x - (bw * 0.72);
    let by = y - bh - 16;

    if (by < margin) by = y + 74;
    if (by + bh > window.innerHeight - margin) by = window.innerHeight - bh - margin;
    if (bx < margin) bx = margin;
    if (bx + bw > window.innerWidth - margin) bx = window.innerWidth - bw - margin;

    bubble.style.left = `${bx}px`;
    bubble.style.top = `${by}px`;
  }, 5200);
  setInterval(() => eyeSpeak(eyeLines[Math.floor(Math.random() * eyeLines.length)]), 9000);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .then(() => caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))))
    .catch(() => {});
}

bootstrapSession();
