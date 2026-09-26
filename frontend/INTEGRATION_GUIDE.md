# Cashlytics Full-Stack Integration Guide

This guide details the complete integration between Frontend, Backend API, and ML Service.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)             │
│                   ├─ Auth Integration                       │
│                   ├─ Transaction Management                 │
│                   ├─ Budget & Goals                         │
│                   ├─ Intelligence Dashboard                 │
│                   ├─ AI Assistant                           │
│                   └─ ML Predictions Integration             │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
┌───────▼──────────┐  ┌──────▼────────────┐
│  Backend API v2  │  │   ML Service      │
│  (Node.js/Exp)   │  │   (FastAPI/Py)    │
│  Port: 5001      │  │   Port: 8000      │
│  ├─ Auth         │  │   ├─ Classifier  │
│  ├─ Profile      │  │   ├─ Anomaly     │
│  ├─ Transactions │  │   └─ Forecast    │
│  ├─ Budgets      │  │                  │
│  ├─ Goals        │  └──────────────────┘
│  ├─ Intelligence │
│  └─ Assistant    │
└──────┬───────────┘
       │
┌──────▼──────────────┐
│   MongoDB Database  │
│   Port: 27017       │
└─────────────────────┘
```

## Integration Files

### Frontend API Client (`frontend/src/lib/api.ts`)

Complete API client with typed endpoints for all services:

**Authentication**
- `requestOtp(email)` - Request OTP
- `verifyOtp(email, otp)` - Verify OTP & get token
- `getAuthMe()` - Get current user
- `logout()` - Logout user

**Transactions**
- `listTransactions(params)` - List all transactions with filters
- `createTransaction(data)` - Create new transaction
- `getTransaction(id)` - Get single transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction
- `confirmTransaction(id)` - Mark transaction as confirmed
- `recategorizeTransaction(id, category)` - Change transaction category
- `smartCaptureTransactions()` - Get pending smart captures
- `bulkVerifyTransactions(ids)` - Verify multiple transactions

**Budgets**
- `listBudgets(params)` - List budgets for month
- `createBudget(data)` - Create budget
- `updateBudget(id, data)` - Update budget
- `deleteBudget(id)` - Delete budget

**Goals**
- `listGoals()` - List all goals
- `createGoal(data)` - Create new goal
- `updateGoal(id, data)` - Update goal
- `deleteGoal(id)` - Delete goal

**Intelligence**
- `getDashboardIntelligence()` - Dashboard intelligence
- `getFinancialSnapshot()` - Monthly snapshot
- `getAnomalies()` - Detected anomalies
- `getTrends()` - Financial trends
- `getLearning()` - Adaptive learning data
- `getForecast()` - Spending forecast

**Profile**
- `getProfile()` - Get user profile
- `updateProfile(data)` - Update profile
- `updatePreferences(data)` - Update user preferences

**AI Assistant**
- `askAssistant(question)` - Ask AI assistant

**ML Service**
- `predictTransactionCategory(description)` - ML category prediction
- `detectTransactionAnomaly(data)` - ML anomaly detection
- `forecastSpending(data)` - ML spending forecast

**Health Checks**
- `checkBackendHealth()` - Backend service health
- `checkMLHealth()` - ML service health

### Custom Hooks (`frontend/src/lib/hooks.ts`)

React hooks for data fetching with loading/error states:

```typescript
// Transactions
const { data, loading, error, refetch } = useTransactions(params)
const { data, loading, error } = useTransaction(id)

// Budgets
const { data, loading, error } = useBudgets(month)

// Goals
const { data, loading, error } = useGoals()

// Intelligence
const { data, loading, error } = useDashboardIntelligence()
const { data, loading, error } = useFinancialSnapshot()
const { data, loading, error } = useAnomalies()
const { data, loading, error } = useTrends()
const { data, loading, error } = useLearning()
const { data, loading, error } = useForecast()

// Profile
const { data, loading, error } = useProfile()

// ML Predictions (async functions)
const prediction = await predictCategory(description)
const anomaly = await detectAnomaly(data)
const forecast = await forecastMonthlySpending(data)

// Health
const backendHealthy = useBackendHealth()
const mlHealthy = useMLHealth()
```

### Authentication Context (`frontend/src/lib/auth-context.tsx`)

Global authentication state management:

```typescript
import { useAuth } from "./lib/auth-context"

function MyComponent() {
  const { user, token, isAuthenticated, login, logout, refreshUser } = useAuth()
  
  // Use auth state
}
```

Wrap your app with the provider:

```typescript
import { AuthProvider } from "./lib/auth-context"

<AuthProvider>
  <App />
</AuthProvider>
```

### Configuration (`frontend/src/lib/config.ts`)

Centralized configuration:

```typescript
import { CONFIG, SERVICE_URLS } from "./lib/config"

// Access API configuration
console.log(CONFIG.api.baseUrl)
console.log(CONFIG.ml.baseUrl)

// Access service URLs
console.log(SERVICE_URLS.BACKEND)
console.log(SERVICE_URLS.ML)
```

### Integration Checker (`frontend/src/lib/integration-check.ts`)

Verify all services are working:

```typescript
import { IntegrationChecker } from "./lib/integration-check"

// Check all services
const status = await IntegrationChecker.checkServices()

// Validate backend APIs
const backendStatus = await IntegrationChecker.validateBackendAPIs()

// Validate ML APIs
const mlStatus = await IntegrationChecker.validateMLAPIs()
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend2
npm install
npm run dev
```

Runs on `http://127.0.0.1:5001`

**Environment Variables:**
```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/cashlytics
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=http://localhost:8443
ML_SERVICE_URL=http://127.0.0.1:8000
```

### 2. ML Service Setup

```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Runs on `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

### 4. MongoDB Setup

Ensure MongoDB is running:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Windows
mongod

# On Linux
sudo systemctl start mongod
```

Should be accessible at `mongodb://127.0.0.1:27017`

## Integration Flows

### Authentication Flow

1. User enters email → Frontend calls `requestOtp(email)`
2. Backend sends OTP via email
3. User enters OTP → Frontend calls `verifyOtp(email, otp)`
4. Backend verifies OTP and returns JWT token
5. Frontend saves token via `saveToken(token)`
6. Token automatically included in all API requests

### Transaction Processing Flow

1. User captures transaction → Frontend calls `createTransaction(data)`
2. Backend stores transaction and calls ML for category prediction
3. ML returns category prediction with confidence score
4. Backend stores transaction with predicted category
5. Frontend displays transaction in Smart Capture queue
6. User confirms/recategorizes → Frontend calls `confirmTransaction(id)` or `recategorizeTransaction(id, category)`
7. Backend updates transaction and ML learns from correction

### Anomaly Detection Flow

1. New transaction created → Backend calls ML `/detect-anomaly`
2. ML analyzes transaction against user's historical patterns
3. If anomalous, ML returns risk score and reasons
4. Backend flags transaction if risk score > threshold
5. Frontend shows anomaly warning with reasoning

### Spending Forecast Flow

1. User navigates to forecast/intelligence page
2. Frontend calls `getForecast()`
3. Backend calculates spending metrics from user's transactions
4. Backend calls ML `/forecast` with calculated metrics
5. ML returns forecast with confidence bounds
6. Frontend displays forecast chart with predictions

### AI Assistant Flow

1. User asks question → Frontend calls `askAssistant(question)`
2. Backend retrieves user's financial data
3. Backend sends query + context to Ollama/LLM
4. LLM generates response with financial insights
5. Frontend displays response in chat

## API Endpoint Summary

### Backend Endpoints

**Auth**
```
POST   /api/auth/otp/request      - Request OTP
POST   /api/auth/otp/verify       - Verify OTP
GET    /api/auth/me               - Get current user
POST   /api/auth/logout           - Logout
```

**Transactions**
```
GET    /api/transactions                    - List
POST   /api/transactions                    - Create
GET    /api/transactions/:id                - Get
PATCH  /api/transactions/:id                - Update
DELETE /api/transactions/:id                - Delete
POST   /api/transactions/:id/confirm        - Confirm
POST   /api/transactions/:id/recategorize   - Recategorize
GET    /api/transactions/smart-capture      - Smart capture queue
POST   /api/transactions/bulk-verify        - Bulk verify
```

**Budgets**
```
GET    /api/budgets           - List
POST   /api/budgets           - Create
PATCH  /api/budgets/:id       - Update
DELETE /api/budgets/:id       - Delete
```

**Goals**
```
GET    /api/goals           - List
POST   /api/goals           - Create
PATCH  /api/goals/:id       - Update
DELETE /api/goals/:id       - Delete
```

**Profile**
```
GET    /api/profile                    - Get
PATCH  /api/profile                    - Update
PATCH  /api/profile/preferences        - Update preferences
```

**Intelligence**
```
GET    /api/intelligence/dashboard     - Dashboard
GET    /api/intelligence/snapshot      - Snapshot
GET    /api/intelligence/anomalies     - Anomalies
GET    /api/intelligence/trends        - Trends
GET    /api/intelligence/learning      - Learning
GET    /api/intelligence/forecast      - Forecast
```

**Assistant**
```
POST   /api/assistant/ask             - Ask question
GET    /api/assistant/history         - Get history
```

### ML Service Endpoints

```
POST   /predict-category      - Predict transaction category
POST   /detect-anomaly        - Detect anomalies
POST   /forecast              - Forecast spending
```

## Error Handling

All API calls are wrapped with error handling:

```typescript
try {
  const result = await api.listTransactions()
  // Use result.data
} catch (error) {
  // Error is already parsed and user-friendly
  console.error(error.message)
}
```

## Token Management

Tokens are automatically managed:

- Saved to `localStorage` after authentication
- Included in all authorized requests via `Authorization: Bearer <token>` header
- Cleared on logout
- Initialize from `localStorage` on app load

## Performance Optimizations

### Caching Strategy

Configured in `config.ts`:

```typescript
cache: {
  transactions: 5 * 60 * 1000,      // 5 minutes
  budgets: 10 * 60 * 1000,          // 10 minutes
  goals: 10 * 60 * 1000,            // 10 minutes
  intelligence: 5 * 60 * 1000,      // 5 minutes
}
```

### Rate Limiting

Backend configured with rate limiting:

- 200 requests per 15 minutes (global)
- 10 requests per 15 minutes (auth endpoints)

### Pagination

Default pagination:

```typescript
const transactions = await api.listTransactions({
  skip: 0,
  limit: 50,  // Default and max: 100
})
```

## Testing Integration

### Manual Testing

1. Use browser DevTools Network tab to monitor requests
2. Check browser Console for any JavaScript errors
3. Verify token in `localStorage`

### Integration Status

Use the integration checker:

```typescript
import { IntegrationChecker } from "./lib/integration-check"

// Run in browser console
IntegrationChecker.checkServices().then(console.log)
IntegrationChecker.validateBackendAPIs().then(console.log)
IntegrationChecker.validateMLAPIs().then(console.log)
```

## Troubleshooting

### "Cannot reach API" Error

1. Check if backend is running: `http://127.0.0.1:5001/health`
2. Check if ML service is running: `http://127.0.0.1:8000/health`
3. Check CORS settings in backend configuration

### "Authentication failed" Error

1. Ensure OTP is correct (6 digits)
2. Check token is being saved to localStorage
3. Verify JWT_SECRET is configured in backend

### "ML Service unavailable" Error

1. Check if ML service is running on port 8000
2. Verify ML_SERVICE_URL in backend config
3. Check ML service logs for errors

### "Database connection failed" Error

1. Ensure MongoDB is running
2. Check MONGO_URI in backend .env
3. Verify database exists and is accessible

## Production Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Update `CLIENT_ORIGIN` to production frontend URL
- [ ] Set strong `JWT_SECRET`
- [ ] Configure rate limits appropriately
- [ ] Enable HTTPS for all services
- [ ] Set up proper logging and monitoring
- [ ] Configure email service (Resend API key)
- [ ] Set up MongoDB backup strategy
- [ ] Update ML service endpoints to production
- [ ] Configure CORS for production domains

## Support

For issues or questions:

1. Check service health with integration checker
2. Review API request/response in DevTools
3. Check backend logs for errors
4. Check ML service logs for prediction issues
5. Verify all services are running and accessible
