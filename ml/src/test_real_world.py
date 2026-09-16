from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report

from preprocessing import clean_text


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "cashlytics_transaction_classifier.joblib"
)

TEST_DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "real_world_test.csv"
)


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    print("===================================")
    print("Cashlytics Real-World Test")
    print("===================================")

    # Load model
    print("\nLoading trained model...")

    model = joblib.load(MODEL_PATH)

    # Load test data
    print("Loading unseen test data...")

    df = pd.read_csv(TEST_DATA_PATH)

    df = df.dropna(
        subset=["description", "category"]
    )

    # Clean descriptions
    df["cleaned_description"] = (
        df["description"]
        .apply(clean_text)
    )

    # Predict
    predictions = model.predict(
        df["cleaned_description"]
    )

    df["predicted_category"] = predictions

    # Accuracy
    accuracy = accuracy_score(
        df["category"],
        df["predicted_category"]
    )

    print("\n===================================")
    print("RESULT")
    print("===================================")

    print(f"\nTest transactions: {len(df)}")
    print(f"Accuracy: {accuracy:.2%}")

    # Classification report
    print("\nClassification Report:")

    print(
        classification_report(
            df["category"],
            df["predicted_category"],
            zero_division=0
        )
    )

    # Show predictions
    print("\n===================================")
    print("PREDICTIONS")
    print("===================================")

    for _, row in df.iterrows():

        status = (
            "✓"
            if row["category"] == row["predicted_category"]
            else "✗"
        )

        print(
            f"\n{status} {row['description']}"
        )

        print(
            f"  Expected : {row['category']}"
        )

        print(
            f"  Predicted: {row['predicted_category']}"
        )


if __name__ == "__main__":
    main()