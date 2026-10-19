const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  nodeEnv: process.env.JEST_WORKER_ID ? "test" : process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5001),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cashlytics",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:8443",
  mlServiceUrl: process.env.ML_SERVICE_URL || "http://127.0.0.1:8000",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3.2",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 200),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 8),
  logLevel: process.env.LOG_LEVEL || "info",
  // Email delivery — Brevo (HTTPS API, works on Render free tier, arbitrary recipients)
  // Sign up at brevo.com, verify your Gmail as a sender, generate an API key (v3, starts with xkeysib-).
  brevoApiKey: process.env.BREVO_API_KEY || "",
  brevoFromEmail: process.env.BREVO_FROM_EMAIL || "",
  brevoFromName: process.env.BREVO_FROM_NAME || "Cashlytics",
  // Google OAuth 2.0
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback",
  // AI Provider & LLM Settings
  aiProvider: process.env.AI_PROVIDER || (process.env.NODE_ENV === "production" ? "groq" : "auto"),
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  groqBaseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  // Initial Admin Provisioning
  adminEmail: (process.env.ADMIN_EMAIL || "").toLowerCase().trim(),
};

module.exports = env;
