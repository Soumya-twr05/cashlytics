const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Electronics",
  "Groceries",
  "Bills",
  "Healthcare",
  "Education",
  "Investment",
  "Income",
  "Transfer",
  "Lifestyle",
  "Other",
];

const TRANSACTION_TYPES = ["debit", "credit"];
const TRANSACTION_SOURCES = ["SMS", "UPI Notification", "Bank feed", "CSV Import", "Manual", "Notification"];
const TRANSACTION_METHODS = ["UPI", "Card", "NEFT", "Auto-pay", "Cash", "Net banking"];
const CAPTURE_STAGES = ["detected", "understanding", "categorizing", "duplicate_check", "ready"];

const MERCHANT_HINTS = {
  swiggy: "Food & Dining",
  zomato: "Food & Dining",
  blinkit: "Groceries",
  zepto: "Groceries",
  uber: "Transport",
  ola: "Transport",
  rapido: "Transport",
  netflix: "Entertainment",
  amazon: "Shopping",
  airtel: "Bills",
  salary: "Income",
};

module.exports = {
  CATEGORIES,
  TRANSACTION_TYPES,
  TRANSACTION_SOURCES,
  TRANSACTION_METHODS,
  CAPTURE_STAGES,
  MERCHANT_HINTS,
};
