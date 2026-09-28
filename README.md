# Cashlytics

**AI-powered adaptive personal finance intelligence system.**

Cashlytics is a comprehensive personal finance tracking and intelligence platform that leverages Machine Learning to provide adaptive insights, budgeting, and transaction analytics.

## 🚀 Features
- **Adaptive Financial Intelligence**: ML-powered insights and predictions.
- **Modern Dashboard**: Built with React 19 and Tailwind CSS.
- **Robust API**: Secure Express.js backend with JWT authentication and rate limiting.
- **Data Visualizations**: Interactive charts for transaction and budget tracking.

## 🛠️ Technology Stack

### Frontend (`/frontend`)
- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4.0
- **Visualizations**: Recharts

### Backend (`/backend2`)
- **Core**: Node.js (v18+), Express.js
- **Database**: MongoDB (Mongoose)
- **Security & Validation**: Helmet, Express Rate Limit, JWT, Bcryptjs, Zod, Joi
- **Utilities**: Winston (Logging), Multer (File Uploads), Resend (Emails)

### Machine Learning (`/ml`)
- **Core**: Python
- Provides data models, insights generation, and a dedicated API.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python 3.9+ (for ML services)
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Clone the repository
```bash
git clone <repository_url>
cd cashlytics
```

### 2. Backend Setup
```bash
cd backend2
npm install
# Create a .env file with your environment variables (e.g., PORT, MONGO_URI, JWT_SECRET)
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will typically run on `http://localhost:5173`.

### 4. Machine Learning Service Setup
```bash
cd ml
python -m venv venv
# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
# Follow ml/README.md for starting the ML API
```

## 🔮 Future Vision

- **Advanced Predictive Analytics**: Enhance ML models to forecast long-term financial health and suggest proactive budget adjustments.
- **Bank API Integrations**: Connect directly with financial institutions (via Plaid or similar services) for real-time transaction syncing.
- **Goal-Based Investing Assistant**: Personalized savings and investment recommendations based on real-time spending habits and risk tolerance.
- **Mobile Application**: Launch a cross-platform mobile application (React Native/Flutter) for on-the-go financial tracking and push notifications.
