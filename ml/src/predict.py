from pathlib import Path

import joblib

from preprocessing import clean_text


BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_PATH = BASE_DIR / "models" / "transaction_classifier.joblib"


def load_model():
    return joblib.load(MODEL_PATH)


def predict_category(description: str):
    model = load_model()

    cleaned_description = clean_text(description)

    prediction = model.predict([cleaned_description])[0]

    probabilities = model.predict_proba([cleaned_description])[0]

    classes = model.classes_

    confidence = max(probabilities)

    probability_map = {
        category: float(probability)
        for category, probability in zip(classes, probabilities)
    }

    return {
        "category": prediction,
        "confidence": float(confidence),
        "probabilities": probability_map,
    }


if __name__ == "__main__":

    examples = [
        "UPI payment to Swiggy",
        "Uber ride payment",
        "Amazon headphones",
        "Netflix monthly subscription",
        "electricity bill payment",
        "monthly salary credit",
    ]

    for example in examples:

        result = predict_category(example)

        print("\nTransaction:", example)
        print("Prediction:", result["category"])
        print(
            "Confidence:",
            round(result["confidence"] * 100, 2),
            "%"
        )