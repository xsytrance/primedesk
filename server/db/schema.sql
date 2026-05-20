PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER DEFAULT 0,
  role TEXT NOT NULL CHECK(role IN ('admin','senior_admin','cio','msp')),
  avatar_color TEXT DEFAULT '#3b82f6',
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badge_ids TEXT DEFAULT '[]',
  last_seen TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_code TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK(priority IN ('soon','later','whenever')) DEFAULT 'later',
  category TEXT DEFAULT 'Other',
  status TEXT CHECK(status IN ('Open','In Progress','Pending','Resolved','Closed')) DEFAULT 'Open',
  assignee_id INTEGER,
  requester_name TEXT,
  due_date TEXT,
  tags TEXT DEFAULT '[]',
  linked_kb_id INTEGER,
  created_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  resolved_at TEXT,
  FOREIGN KEY (assignee_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS ticket_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  user_id INTEGER,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER,
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reactions TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS kb_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  tags TEXT DEFAULT '[]',
  author_id INTEGER NOT NULL,
  linked_ticket_ids TEXT DEFAULT '[]',
  version INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS kb_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL,
  body_snapshot TEXT NOT NULL,
  changed_by INTEGER NOT NULL,
  changed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES kb_articles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS xp_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  related_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rotation_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  msp_name TEXT NOT NULL,
  contact_info TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS outgoing_laptops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  laptop_tag TEXT,
  assignee_name TEXT,
  office TEXT NOT NULL CHECK(office IN ('New York City','San Francisco','Washington DC')) DEFAULT 'New York City',
  action_type TEXT NOT NULL CHECK(action_type IN ('send','setup')) DEFAULT 'send',
  due_date TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL CHECK(status IN ('Open','Completed')) DEFAULT 'Open',
  completed_at TEXT,
  created_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_outgoing_laptops_due_date ON outgoing_laptops(due_date);
