import joblib
from pathlib import Path


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "cashlytics_transaction_classifier.joblib"
)


# Load the trained pipeline once when the API starts.
model = joblib.load(MODEL_PATH)


def predict_category(description: str):
    """
    Predict the transaction category and confidence
    using the trained Cashlytics classifier.
    """

    prediction = model.predict([description])[0]

    probabilities = model.predict_proba([description])[0]

    confidence = float(probabilities.max())

    return {
        "category": prediction,
        "confidence": round(confidence, 4),
    }