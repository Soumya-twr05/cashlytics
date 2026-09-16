# Cashlytics API

Express + MongoDB backend for the Cashlytics adaptive finance product.

## Setup

```bash
cd backend
cp .env.example .env
npm install
```

Start MongoDB locally, then:

```bash
npm run dev
```

API: `http://localhost:5000`

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Nodemon server |
| `npm start` | Production server |
| `npm run seed` | Demo user `arjun@example.com` / `password123` |
| `npm run seed:transactions` | Sample captures |
| `npm run db:clear` | Drop seeded collections |
| `npm test` | Jest + Supertest |

## Main routes

- `POST /api/auth/register` `POST /api/auth/login` `GET /api/auth/me`
- `GET/POST /api/transactions` smart capture, recategorize, confirm
- `POST /api/import/csv`
- `GET/POST /api/budgets` `/api/goals` `/api/bills` `/api/debts`
- `GET /api/intelligence/dashboard` anomalies, trends, learning
- `POST /api/ai/ask` (Ollama, with heuristic fallback)
