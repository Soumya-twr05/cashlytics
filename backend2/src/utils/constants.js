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
  // Food & Dining
  swiggy: "Food & Dining",
  zomato: "Food & Dining",
  mcdonalds: "Food & Dining",
  burgerking: "Food & Dining",
  "burger king": "Food & Dining",
  dominos: "Food & Dining",
  "pizza hut": "Food & Dining",
  pizzahut: "Food & Dining",
  kfc: "Food & Dining",
  starbucks: "Food & Dining",
  ccd: "Food & Dining",
  "cafe coffee day": "Food & Dining",
  haldirams: "Food & Dining",
  "barbeque nation": "Food & Dining",

  // Groceries
  blinkit: "Groceries",
  zepto: "Groceries",
  instamart: "Groceries",
  bigbasket: "Groceries",
  dmart: "Groceries",
  "d-mart": "Groceries",
  "avenue supermarts": "Groceries",
  jiomart: "Groceries",
  dunzo: "Groceries",
  "nature basket": "Groceries",
  spencers: "Groceries",
  "star bazaar": "Groceries",
  "more retail": "Groceries",
  "reliance smart": "Groceries",
  "reliance fresh": "Groceries",

  // Shopping (Fashion & Retail)
  zudio: "Shopping",
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  ajio: "Shopping",
  nykaa: "Shopping",
  meesho: "Shopping",
  zara: "Shopping",
  "h&m": "Shopping",
  westside: "Shopping",
  pantaloons: "Shopping",
  "max fashion": "Shopping",
  "shoppers stop": "Shopping",
  fabindia: "Shopping",
  lenskart: "Shopping",
  decathlon: "Shopping",
  "reliance trends": "Shopping",
  reliance: "Shopping",

  // Electronics
  croma: "Electronics",
  "reliance digital": "Electronics",
  "vijay sales": "Electronics",

  // Transport
  uber: "Transport",
  ola: "Transport",
  rapido: "Transport",
  irctc: "Transport",
  makemytrip: "Transport",
  cleartrip: "Transport",
  redbus: "Transport",
  fastag: "Transport",
  indigo: "Transport",
  "air india": "Transport",
  "indian oil": "Transport",
  indianoil: "Transport",
  "bharat petroleum": "Transport",
  bharatpetroleum: "Transport",
  "hp petrol": "Transport",
  hppetrol: "Transport",

  // Entertainment
  netflix: "Entertainment",
  hotstar: "Entertainment",
  disney: "Entertainment",
  "prime video": "Entertainment",
  amazonprime: "Entertainment",
  spotify: "Entertainment",
  "youtube premium": "Entertainment",
  pvr: "Entertainment",
  inox: "Entertainment",
  bookmyshow: "Entertainment",
  tataplay: "Entertainment",
  "tata play": "Entertainment",
  sonyliv: "Entertainment",
  jiocinema: "Entertainment",

  // Bills & Utilities
  airtel: "Bills",
  "airtel xstream": "Bills",
  jio: "Bills",
  vi: "Bills",
  bsnl: "Bills",
  bescom: "Bills",
  tneb: "Bills",
  "tata power": "Bills",
  "adani electricity": "Bills",
  cred: "Bills",

  // Healthcare
  apollo: "Healthcare",
  fortis: "Healthcare",
  medanta: "Healthcare",
  "1mg": "Healthcare",
  pharmeasy: "Healthcare",
  netmeds: "Healthcare",
  medplus: "Healthcare",
  practo: "Healthcare",

  // Lifestyle
  cultfit: "Lifestyle",
  "cult.fit": "Lifestyle",
  "anytime fitness": "Lifestyle",

  // Investment
  zerodha: "Investment",
  groww: "Investment",
  upstox: "Investment",
  indmoney: "Investment",

  // Education
  coursera: "Education",
  udemy: "Education",
  upgrad: "Education",
  byjus: "Education",
  unacademy: "Education",

  // Income
  salary: "Income",
  stipend: "Income",
};

const CATEGORY_MAP = {
  // Canonical pass-through
  "Food & Dining": "Food & Dining",
  Transport: "Transport",
  Shopping: "Shopping",
  Entertainment: "Entertainment",
  Electronics: "Electronics",
  Groceries: "Groceries",
  Bills: "Bills",
  Healthcare: "Healthcare",
  Education: "Education",
  Investment: "Investment",
  Income: "Income",
  Transfer: "Transfer",
  Lifestyle: "Lifestyle",
  Other: "Other",

  // Common aliases & legacy labels
  Food: "Food & Dining",
  "Food and Dining": "Food & Dining",
  Transportation: "Transport",
  "Shopping & Retail": "Shopping",
  "Shopping and Retail": "Shopping",
  "Entertainment & Recreation": "Entertainment",
  "Entertainment and Recreation": "Entertainment",
  "Bills & Utilities": "Bills",
  "Bills and Utilities": "Bills",
  Utilities: "Bills",
  "Healthcare & Medical": "Healthcare",
  "Healthcare and Medical": "Healthcare",
  Medical: "Healthcare",
  Health: "Healthcare",
  "Financial Services": "Investment",
  Financial: "Investment",
  "Rent & Housing": "Bills",
  "Rent and Housing": "Bills",
  Housing: "Bills",
  Rent: "Bills",
  "Government & Legal": "Bills",
  "Government and Legal": "Bills",
  Grocery: "Groceries",
};

function normalizeCategory(cat) {
  if (!cat || typeof cat !== "string") return "Other";
  const trimmed = cat.trim();
  if (CATEGORY_MAP[trimmed]) return CATEGORY_MAP[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (key.toLowerCase() === lower) return val;
  }
  return "Other";
}

module.exports = {
  CATEGORIES,
  TRANSACTION_TYPES,
  TRANSACTION_SOURCES,
  TRANSACTION_METHODS,
  CAPTURE_STAGES,
  MERCHANT_HINTS,
  CATEGORY_MAP,
  normalizeCategory,
};
