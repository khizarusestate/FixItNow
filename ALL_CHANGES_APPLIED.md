# All changes applied — Customer app

Verified and synced to `origin/main` (sessions: performance, i18n, fonts, booking cancel, email verification, worker service picker, JWT auth).

- Compression, CDN (`mediaUrl.js`), lazy routes + `LazyImage`
- i18n EN/UR + mobile language toggle
- Google Fonts via `index.html` + CSP
- Email verify: `VerifyEmail.jsx`, signup → verify modal, login `EMAIL_NOT_VERIFIED`
- Booking cancel → `cancelled` + notifications
- Worker signup/profile: DB services `Category - Service Name`
- `vercel.json` cache headers

See `docs/DEPLOY_CHECKLIST.md` for deploy env vars.
