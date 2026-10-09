# Cashlytics — AI-Powered Adaptive Personal Finance Intelligence

Cashlytics is an enterprise-grade personal finance intelligence application that transforms everyday banking data into actionable financial clarity. Powered by high-speed analytics, machine learning pipelines, and context-grounded AI assistant integrations, Cashlytics empowers individuals to simulate financial decisions, track budgets, catch anomalies, and achieve long-term wealth goals.

---

## Table of Contents
1. [Overview & Highlights](#overview--highlights)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [Database & Data Models (Schemas)](#database--data-models-schemas)
5. [End-to-End Workflows](#end-to-end-workflows)
6. [Core Features](#core-features)
7. [Getting Started & Local Setup](#getting-started--local-setup)
8. [Future Enhancements Roadmap](#future-enhancements-roadmap)
9. [Developer Credentials](#developer-credentials)

---

## Overview & Highlights

- **Dynamic, User-Specific Intelligence**: Every page is grounded in the active user's actual ledger data, transaction baselines, and goals—no hardcoded placeholders or mock profiles.
- **AI Financial Assistant**: Conversational agent powered by local LLMs (Ollama) that answers complex spending questions using deterministic context from the user's accounts.
- **Per-User Chat Persistence**: Assistant conversations are stored in MongoDB and synced with local client cache.
- **Financial Note & PDF Export**: One-click generation of text notes (`.txt`) and print-ready executive financial reports (`.pdf`) containing monthly recommendations, budget statuses, and conversation transcripts.
- **What-If Scenario Simulator**: Interactive simulation engine calculating immediate monthly savings, discretionary category adjustments, and goal acceleration milestones based on real transaction baselines.
- **Adaptive Machine Learning**: Automatic transaction category prediction and anomaly detection with personalized merchant rule learning.
- **Passwordless OTP Authentication**: Instant, frictionless email OTP login and signup with development mode auto-fill.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 8 / Rolldown
- **Styling**: Modern dark-mode UI with custom CSS variables, Tailwind utility tokens, and JetBrains Mono typographic accents
- **Visualizations**: Recharts (dynamic line trends, bar charts, custom gauge SVG indicators)
- **State & Storage**: React Context (`AuthContext`), React hooks, localStorage synchronization

### Backend (`backend2`)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, express-rate-limit, SHA-256 OTP hashing, JWT authorization
- **Testing**: Jest & Supertest test suite

### Machine Learning & AI (`ml`)
- **Runtime**: Python 3.10+
- **API Framework**: FastAPI & Uvicorn
- **AI Engine**: Ollama (local LLM integration) with structured JSON generation
- **Algorithms**: Scikit-Learn (category prediction, isolation forests / anomaly scoring, linear trend projection)

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   Cashlytics Client                    │
│      (React + Vite + Recharts + Financial UI)          │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       HTTP / JWT (Port 5001)       HTTP (Port 8000)
                │                        │
                ▼                        ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     Node.js Express API      │ │    FastAPI ML API     │
│   Auth, DB, Ledger, Logic    │ │ Anomaly & Predictions │
└───────────────┬──────────────┘ └───────────┬───────────┘
                │                            │
         Mongoose Driver                     │ Ollama IPC
                ▼                            ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│       MongoDB Database       │ │   Local Ollama LLM    │
│ Users, Txns, Budgets, Chats  │ │ Grounded Fin Assistant│
└──────────────────────────────┘ └───────────────────────┘
```

---

## Database & Data Models (Schemas)

### 1. User Schema (`User.js`)
Stores account credentials, profile metadata, and granular notification/AI preferences.
```javascript
{
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  googleId: { type: String, sparse: true, unique: true },
  authProviders: [{ type: String, enum: ["email", "google"] }],
  avatar: { type: String },
  onboardingCompleted: { type: Boolean, default: false },
  plan: { type: String, default: "Free" },
  preferences: {
    emailReports: { type: Boolean, default: true },
    anomalyAlerts: { type: Boolean, default: true },
    weeklyInsights: { type: Boolean, default: true },
    budgetWarnings: { type: Boolean, default: true },
    goalUpdates: { type: Boolean, default: false },
    aiLearning: { type: Boolean, default: true },
    autoCateg: { type: Boolean, default: true },
    patternDetection: { type: Boolean, default: true },
    localProcessing: { type: Boolean, default: true },
    shareAnonymous: { type: Boolean, default: false },
    twoFactor: { type: Boolean, default: false },
    biometric: { type: Boolean, default: true }
  },
  timestamps: true
}
```

### 2. Financial Profile Schema (`FinancialProfile.js`)
Captures baseline personal finances from user onboarding.
```javascript
{
  user: { type: ObjectId, ref: "User", required: true, unique: true },
  monthlyIncome: { type: Number, required: true, min: 0 },
  averageMonthlyExpenses: { type: Number, required: true, min: 0 },
  desiredMonthlySavings: { type: Number, required: true, min: 0 },
  spendingStyle: { type: String, enum: ["frugal", "moderate", "liberal"], default: "moderate" },
  priorities: [{ type: String }],
  currency: { type: String, default: "INR" },
  fiscalMonthStart: { type: Number, default: 1, min: 1, max: 28 },
  timestamps: true
}
```

### 3. Transaction Schema (`Transaction.js`)
Tracks all debit and credit ledger activities with confidence ratings and idempotency fingerprints.
```javascript
{
  user: { type: ObjectId, ref: "User", required: true, index: true },
  merchant: { type: String, required: true, trim: true },
  rawDescription: { type: String, trim: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ["debit", "credit"], default: "debit" },
  category: { type: String, default: "Other" },
  method: { type: String, enum: ["UPI", "Card", "NetBanking", "Cash", "Other"], default: "UPI" },
  source: { type: String, enum: ["Manual", "CSV", "SMS", "OCR"], default: "Manual" },
  confidence: { type: Number, min: 0.0, max: 1.0, default: 0.8 },
  verified: { type: Boolean, default: false },
  confirmed: { type: Boolean, default: false },
  stage: { type: String, enum: ["inbox", "review", "ready"], default: "ready" },
  fingerprint: { type: String, index: true },
  occurredAt: { type: Date, default: Date.now, index: true },
  notes: { type: String, trim: true },
  timestamps: true
}
```

### 4. Assistant Conversation Schema (`AssistantMessage.js`)
Persists all dialogues between the user and the Cashlytics AI assistant.
```javascript
{
  user: { type: ObjectId, ref: "User", required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  insights: { type: [String], default: [] },
  suggestions: { type: [String], default: [] },
  chart: { type: Mixed, default: null },
  source: { type: String, default: "ollama" },
  timestamps: true
}
```

### 5. Budget & Goal Schemas (`Budget.js` / `Goal.js`)
```javascript
// Budget
{
  user: { type: ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  month: { type: String, required: true }, // Format: YYYY-MM
  aiNote: { type: String },
  timestamps: true
}

// Goal
{
  user: { type: ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  target: { type: Number, required: true, min: 0 },
  current: { type: Number, default: 0 },
  monthly: { type: Number, default: 0 },
  deadline: { type: Date },
  timestamps: true
}
```

### 6. OTP Verification Schema (`OtpVerification.js`)
```javascript
{
  email: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 600 }
}
```

---

## End-to-End Workflows

### 1. Authentication & Onboarding Workflow
```text
User enters email ──► POST /api/auth/otp/request ──► OTP generated & hashed
                             │
                             ▼
User enters OTP   ──► POST /api/auth/otp/verify  ──► Account created/found ──► JWT Issued
                             │
                             ▼
           First Time? ──► Onboarding Questionnaire (Income, Savings, Style)
           Existing?   ──► Financial Dashboard
```

### 2. Transaction Ingestion & Intelligence Loop
1. **Creation**: User creates transaction manually, uploads CSV, or parses receipt.
2. **ML Categorization**: Machine learning microservice predicts category with a confidence score.
3. **Ledger Update**: MongoDB stores transaction with fingerprint checking for deduplication.
4. **Metric Calculation**: Instant recalculation of:
   - Category budget utilization
   - Overall financial health score (0–100)
   - Anomaly risk flags
   - 30-day and 1-year spending trajectory curves

### 3. AI Assistant & Export Flow
1. **Context Building**: Backend compiles the user's active income, category totals, recent 20 transactions, budgets, and goals into a deterministic financial context object.
2. **Inference**: Ollama LLM executes prompt with strict instructions not to hallucinate numbers.
3. **Persistence**: User inquiry and AI response are written to `AssistantMessage` collection.
4. **Export**:
   - **Text Note**: Downloads `.txt` file with financial summary, monthly suggestions, and chat log.
   - **PDF Report**: Formats print layout and triggers native print/Save as PDF dialog.

### 4. What-If Financial Simulation Workflow
1. Fetches real user transactions across discretionary categories (Dining, Shopping, Entertainment, Groceries, Transport).
2. Computes 30-day baseline spend.
3. Applies user-selected reduction slider (0% to 50%).
4. Computes:
   - Monthly & Annual direct cash savings
   - Impact on user-selected financial goal (months shaved off target date)
   - Dynamic simulation trajectory chart

---

## Core Features

| Feature | Description |
| :--- | :--- |
| **Overview Dashboard** | Real-time financial health gauge, savings rate, 30D/3M/1Y trendlines, category progress. |
| **AI Financial Assistant** | Personalized financial conversational intelligence with persistent memory and export tools. |
| **What-If Simulator** | Interactive spending scenario sandbox with concrete goal acceleration timelines. |
| **Transactions Ledger** | Filterable, sortable transaction table with credit/debit indicators and source badges. |
| **Smart Capture** | Multi-channel ingestion pipeline for receipts, CSVs, and manual entries. |
| **Budgets & Goals** | Category-specific limits with alert thresholds and visual milestone targets. |
| **Adaptive Learning** | System learns merchant reclassification preferences from user corrections. |
| **Financial Intelligence** | Anomaly detection alerts, recurring expense identification, and burn rate forecasts. |

---

## Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB running locally on `mongodb://localhost:27017/cashlytics`
- Ollama (Optional, for local AI generation; deterministic fallbacks provided)

### 1. Backend Service
```bash
cd backend2
npm install
npm run dev
# Running on http://127.0.0.1:5001
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 3. Machine Learning Microservice
```bash
cd ml
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
# Running on http://127.0.0.1:8000
```

### Running Backend Unit Tests
```bash
cd backend2
npm test
```

---

## Future Enhancements Roadmap

- [ ] **Multi-Category Neural Forecasting**: Extend What-If Simulator with LSTM / Prophet models predicting category-by-category future trajectories.
- [ ] **Open Banking / Account Aggregator Sync**: Real-time automated transaction fetching via Indian Account Aggregator (AA / Setu) and Plaid APIs.
- [ ] **Native Mobile Application**: Cross-platform React Native client with biometric lock and offline synchronization.
- [ ] **Automated PDF Bank Statement Parser**: In-browser OCR and PDF tabular transaction extraction for all major banks (HDFC, SBI, ICICI, Axis).
- [ ] **Multi-Currency Support**: Dynamic forex conversion supporting USD, EUR, GBP, and AED alongside INR.
- [ ] **Voice-Powered Financial Commands**: Real-time speech-to-text input for hands-free queries with the AI Assistant.

---

## Developer Credentials

- **Developer Name**: **Soumya Tiwari**
- **Project**: **Cashlytics**
- **Repository**: [https://github.com/Soumya-twr05/cashlytics](https://github.com/Soumya-twr05/cashlytics)
- **Role**: Full-Stack & AI Systems Developer
