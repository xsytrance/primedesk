const base = process.env.BASE_URL || 'http://127.0.0.1:2300';

async function j(path, opts = {}) {
  const res = await fetch(`${base}${path}`, opts);
  const txt = await res.text();
  let data;
  try { data = JSON.parse(txt); } catch { data = txt; }
  return { status: res.status, data };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

(async () => {
  const health = await j('/api/health');
  assert(health.status === 200 && health.data.ok === true, 'health failed');

  let login = await j('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'egi', password: 'Desmarais123A' })
  });

  if (login.status !== 200) {
    let tempLogin = await j('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'egi', password: 'Desmarais123!' })
    });
    if (tempLogin.status !== 200) {
      tempLogin = await j('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'egi', password: '2322332323' })
      });
    }
    assert(tempLogin.status === 200, 'egi login failed');
    const changed = await j('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tempLogin.data.token}` },
      body: JSON.stringify({ newPassword: 'Desmarais123A' })
    });
    assert(changed.status === 200, 'password change failed');
    login = await j('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'egi', password: 'Desmarais123A' })
    });
  }

  assert(login.status === 200 && login.data.token, 'final egi login failed');
  const token = login.data.token;

  const ticket = await j('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: `Smoke ${Date.now()}`, priority: 'P3' })
  });
  assert(ticket.status === 201, 'ticket create failed');

  const comment = await j(`/api/tickets/${ticket.data.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body: 'smoke comment' })
  });
  assert(comment.status === 201, 'comment failed');

  const kb = await j('/api/kb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title: `Smoke KB ${Date.now()}`, body: 'smoke body' })
  });
  assert(kb.status === 201, 'kb create failed');

  const msg = await j('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ channel: 'general', body: 'smoke message' })
  });
  assert(msg.status === 201, 'message failed');

  const cio = await j('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'cio', password: 'CioPass123!!' })
  });

  if (cio.status === 200) {
    const deny = await j('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cio.data.token}` },
      body: JSON.stringify({ title: 'CIO deny smoke', priority: 'P3' })
    });
    assert(deny.status === 403, 'rbac deny failed');
  }

  console.log('SMOKE PASS');
})().catch((e) => {
  console.error('SMOKE FAIL:', e.message);
  process.exit(1);
});
