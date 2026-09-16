from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from preprocessing import clean_text


# Find the ml folder automatically
BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = BASE_DIR / "data" / "raw" / "transactions.csv"
MODEL_PATH = BASE_DIR / "models" / "transaction_classifier.joblib"


def main():
    print("Loading dataset...")

    df = pd.read_csv(DATA_PATH)

    # Make sure required columns exist
    required_columns = {"description", "category"}

    if not required_columns.issubset(df.columns):
        raise ValueError(
            f"Dataset must contain columns: {required_columns}"
        )

    # Remove incomplete rows
    df = df.dropna(subset=["description", "category"])

    # Clean transaction descriptions
    df["description"] = df["description"].apply(clean_text)

    # X = input
    X = df["description"]

    # y = correct answer
    y = df["category"]

    print(f"Total samples: {len(df)}")
    print(f"Categories: {sorted(y.unique())}")

    # Split data into training and testing
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")

    # Build ML pipeline
    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=True
            )
        ),
        (
            "classifier",
            LogisticRegression(max_iter=1000)
        )
    ])

    print("\nTraining model...")

    pipeline.fit(X_train, y_train)

    # Test the trained model
    predictions = pipeline.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print("\n==============================")
    print("MODEL EVALUATION")
    print("==============================")

    print(f"Accuracy: {accuracy:.4f}")

    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # Save the complete pipeline
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(pipeline, MODEL_PATH)

    print("\nModel saved successfully:")
    print(MODEL_PATH)


if __name__ == "__main__":
    main()
    