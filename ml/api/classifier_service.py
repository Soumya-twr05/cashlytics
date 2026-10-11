import joblib
from pathlib import Path
import sys

# --------------------------------------------------
# Make sure ml/src is importable for clean_text
# --------------------------------------------------

_SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))

from preprocessing import clean_text


# --------------------------------------------------
# Model path
# --------------------------------------------------

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "cashlytics_transaction_classifier.joblib"
)


# --------------------------------------------------
# Category mapping: ML label → backend CATEGORIES
# --------------------------------------------------
# Safety-net in case the model was trained with
# labels that differ from the backend enum.
# If the model already outputs backend-compatible
# labels, this map simply passes them through.

_CATEGORY_MAP = {
    # Exact matches (pass-through)
    "Food & Dining": "Food & Dining",
    "Transport": "Transport",
    "Shopping": "Shopping",
    "Entertainment": "Entertainment",
    "Electronics": "Electronics",
    "Groceries": "Groceries",
    "Bills": "Bills",
    "Healthcare": "Healthcare",
    "Education": "Education",
    "Investment": "Investment",
    "Income": "Income",
    "Transfer": "Transfer",
    "Lifestyle": "Lifestyle",
    "Other": "Other",

    # Legacy / alternative labels from older models
    "Shopping & Retail": "Shopping",
    "Transportation": "Transport",
    "Bills & Utilities": "Bills",
    "Healthcare & Medical": "Healthcare",
    "Entertainment & Recreation": "Entertainment",
    "Financial Services": "Investment",
    "Rent & Housing": "Bills",
    "Government & Legal": "Bills",
}

# Valid backend categories (for validation)
_VALID_CATEGORIES = {
    "Food & Dining", "Transport", "Shopping", "Entertainment",
    "Electronics", "Groceries", "Bills", "Healthcare",
    "Education", "Investment", "Income", "Transfer",
    "Lifestyle", "Other",
}


def _normalize_category(raw_category: str) -> str:
    """Map an ML prediction to a valid backend category."""
    mapped = _CATEGORY_MAP.get(raw_category)
    if mapped:
        return mapped

    # Case-insensitive fallback
    lower = raw_category.lower().strip()
    for key, value in _CATEGORY_MAP.items():
        if key.lower() == lower:
            return value

    return "Other"


# --------------------------------------------------
# Load model once at startup
# --------------------------------------------------

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# Prediction function
# --------------------------------------------------

def predict_category(description: str):
    """
    Predict the transaction category and confidence
    using the trained Cashlytics classifier.

    Applies the same clean_text() preprocessing used
    during training so TF-IDF features match.
    """

    cleaned = clean_text(description)

    # Guard against empty descriptions after cleaning
    if not cleaned:
        return {
            "category": "Other",
            "confidence": 0.0,
        }

    prediction = model.predict([cleaned])[0]
    probabilities = model.predict_proba([cleaned])[0]
    confidence = float(probabilities.max())

    # Map to backend-compatible category
    category = _normalize_category(prediction)

    return {
        "category": category,
        "confidence": round(confidence, 4),
    }