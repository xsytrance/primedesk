const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db/database');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
app.set('io', io);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));
app.use(express.static(path.resolve(__dirname, '../client')));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, path.resolve(__dirname, '../uploads')),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.mimetype);
    cb(ok ? null : new Error('Only image uploads allowed'), ok);
  }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ file: `/uploads/${req.file.filename}` });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/kb', require('./routes/kb'));
app.use('/api/xp', require('./routes/xp'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/rotation', require('./routes/rotation'));
app.use('/api/media', require('./routes/media'));
app.use('/api/laptops', require('./routes/laptops'));

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use((_, res) => res.sendFile(path.resolve(__dirname, '../client/index.html')));

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('unauthorized'));
  try {
    socket.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join('general');
  socket.join(`user:${socket.user.id}`);

  socket.on('join', (channel) => {
    if (typeof channel === 'string' && channel.trim()) socket.join(channel.trim());
  });

  socket.on('message', (msg) => {
    io.to(msg.channel || 'general').emit('message', { ...msg, _rt: true });
  });
});

function initDb() {
  const schema = fs.readFileSync(path.resolve(__dirname, './db/schema.sql'), 'utf8');
  db.exec(schema);

  const cols = db.prepare("PRAGMA table_info(users)").all();
  const hasMustChange = cols.some(c => c.name === 'must_change_password');
  if (!hasMustChange) db.exec('ALTER TABLE users ADD COLUMN must_change_password INTEGER DEFAULT 0');
  const hasAvatarUrl = cols.some(c => c.name === 'avatar_url');
  if (!hasAvatarUrl) db.exec('ALTER TABLE users ADD COLUMN avatar_url TEXT');

  const bootstrapPassword = process.env.BOOTSTRAP_PASSWORD || 'ChangeMeNow!123';
  const sharedTemp = bcrypt.hashSync(bootstrapPassword, 10);
  const ensureUser = (name, email) => {
    const existing = db.prepare('SELECT id FROM users WHERE lower(name)=? OR lower(email)=?').get(name.toLowerCase(), email.toLowerCase());
    if (existing) {
      db.prepare('UPDATE users SET name=?, email=?, role=? WHERE id=?')
        .run(name, email, 'admin', existing.id);
    } else {
      db.prepare('INSERT INTO users (name,email,password_hash,must_change_password,role,xp,level) VALUES (?,?,?,?,?,?,?)')
        .run(name, email, sharedTemp, 1, 'admin', 0, 1);
    }
  };

  ensureUser('operator1', 'operator1@primedesk.local');
  ensureUser('operator2', 'operator2@primedesk.local');
}

initDb();

const PORT = Number(process.env.PORT || 2300);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`PrimeDesk listening on port ${PORT}`);
});
