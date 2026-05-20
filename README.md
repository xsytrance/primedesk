# PrimeDesk

PrimeDesk is a mobile-first internal IT ops app with:
- Ticketing
- Chat
- Knowledge Base
- XP tracking
- Outgoing laptop workflow

## Quick start

```bash
npm install
cp .env.example .env
npm run start
```

Open: `http://localhost:2300`

## Default bootstrap users

On first run, PrimeDesk seeds:
- `operator1`
- `operator2`

Initial password is `BOOTSTRAP_PASSWORD` from `.env` (defaults to `ChangeMeNow!123`).
Force password change is enabled at first login.

## Notes

- SQLite DB files are stored under `server/db/` and are ignored by git.
- Uploads are stored under `uploads/` and are ignored by git.
- Never commit `.env`.
