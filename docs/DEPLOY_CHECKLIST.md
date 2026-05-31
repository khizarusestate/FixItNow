# Deploy checklist — Fix It Now Customer App

Verified bundle includes:

- Image compression before upload, CDN helper (`VITE_CDN_BASE_URL`), `LazyImage` on ads
- i18n EN/UR (header + mobile EN/UR toggle), Google Fonts in `index.html`
- Email verification modal after signup; login redirects if unverified
- Booking cancel shows `cancelled` + live notifications
- Worker service picker from DB (`Category - Service Name`)
- Code-split sections (lazy routes) + Vercel cache headers

**Vercel env:** `VITE_API_URL`, optional `VITE_CDN_BASE_URL`, `VITE_GOOGLE_CLIENT_ID`
