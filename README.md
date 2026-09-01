# La Maison Bibi — Next.js PWA

Production-ready PWA for a real estate agency in Douala, Cameroon. Built with Next.js 16, React 19, Tailwind CSS 4, and Prisma (SQLite).

## Getting Started

```bash
npm install
npm run db:push
npm run dev
```

Open http://localhost:3000

### Default Admin Accounts

| Username | Password | Role |
|----------|----------|------|
| manager | BibiManager2026! | Manager |
| admin | BibiAdmin2026! | Admin |
| agent1 | BibiAgent2026! | Agent |
| agent2 | BibiAgent2026! | Agent |

Access backoffice at /connexion

## Deployment

### Vercel (recommended)
1. Push to GitHub
2. Import at vercel.com
3. Set DATABASE_URL environment variable
4. Deploy

### Netlify
1. Push to GitHub
2. Import at netlify.com
3. Build: npm run build | Publish: .next
4. Set DATABASE_URL and deploy

## Features
- Bilingual (FR/EN) with Livewire-style language switcher
- 14 seeded properties
- BibiAssistant chat widget
- PWA (manifest + service worker)
- Admin backoffice with dashboard, property CRUD, requests inbox
- Pink login button, black menu text with pink hover
