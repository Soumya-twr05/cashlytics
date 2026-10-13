# Cashlytics Backend v2

Adaptive financial intelligence API — rebuilt architecture.

## Setup

```bash
npm install
cp .env.example .env   # edit values as needed
npm run dev
```

## API Endpoints

| Prefix              | Description            |
|----------------------|------------------------|
| `/api/auth`          | Register, login, me    |
| `/api/profile`       | Financial profile CRUD |
| `/api/transactions`  | Transaction management |
| `/api/intelligence`  | Dashboard & analytics  |
| `/api/budgets`       | Budget management      |
| `/api/goals`         | Goal tracking          |
| `/api/assistant`     | AI chat assistant      |

## Tech Stack

- **Runtime**: Node.js ≥ 18
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Joi
- **AI**: Ollama (local LLM)
- **Logging**: Winston
