from pathlib import Path

import joblib
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from preprocessing import clean_text


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_indian_transactions_v2.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "cashlytics_transaction_classifier.joblib"
)


# --------------------------------------------------
# Main training function
# --------------------------------------------------

def main():

    print("===================================")
    print("Cashlytics Transaction Classifier")
    print("===================================")

    # ----------------------------------------------
    # Load dataset
    # ----------------------------------------------

    print("\nLoading dataset...")

    df = pd.read_csv(DATA_PATH)

    required_columns = {"description", "category"}

    if not required_columns.issubset(df.columns):
        raise ValueError(
            f"Dataset must contain columns: {required_columns}"
        )

    df = df.dropna(
        subset=["description", "category"]
    )

    # Remove empty descriptions
    df["description"] = df["description"].astype(str)

    df = df[
        df["description"].str.strip() != ""
    ]

    print(f"Total samples: {len(df)}")

    # ----------------------------------------------
    # Clean text
    # ----------------------------------------------

    print("\nCleaning transaction descriptions...")

    df["description"] = df["description"].apply(
        clean_text
    )

    X = df["description"]
    y = df["category"]

    print(f"Number of categories: {y.nunique()}")

    print("\nCategories:")

    for category, count in y.value_counts().sort_index().items():
        print(f"  {category}: {count}")

    # ----------------------------------------------
    # Train / Test split
    # ----------------------------------------------

    print("\nSplitting dataset...")

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples : {len(X_test)}")

    # ----------------------------------------------
    # Build ML pipeline
    # ----------------------------------------------

    print("\nBuilding TF-IDF + Logistic Regression model...")

    pipeline = Pipeline([
        (
            "tfidf",
            TfidfVectorizer(
                ngram_range=(1, 2),
                min_df=1,
                sublinear_tf=True,
            ),
        ),
        (
            "classifier",
            LogisticRegression(
                max_iter=2000
            ),
        ),
    ])

    # ----------------------------------------------
    # Train
    # ----------------------------------------------

    print("\nTraining model...")

    pipeline.fit(
        X_train,
        y_train
    )

    print("Training completed.")

    # ----------------------------------------------
    # Predictions
    # ----------------------------------------------

    print("\nEvaluating model...")

    predictions = pipeline.predict(
        X_test
    )

    # ----------------------------------------------
    # Accuracy
    # ----------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print("\n===================================")
    print("MODEL EVALUATION")
    print("===================================")

    print(
        f"\nAccuracy: {accuracy:.4f}"
    )

    print(
        f"Accuracy: {accuracy * 100:.2f}%"
    )

    # ----------------------------------------------
    # Classification report
    # ----------------------------------------------

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0,
        )
    )

    # ----------------------------------------------
    # Confusion matrix
    # ----------------------------------------------

    labels = sorted(
        y.unique()
    )

    cm = confusion_matrix(
        y_test,
        predictions,
        labels=labels,
    )

    cm_df = pd.DataFrame(
        cm,
        index=labels,
        columns=labels,
    )

    print("\nConfusion Matrix:")

    print(cm_df)

    # ----------------------------------------------
    # Save model
    # ----------------------------------------------

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        pipeline,
        MODEL_PATH
    )

    print("\n===================================")
    print("MODEL SAVED")
    print("===================================")

    print(
        f"\nModel saved successfully:\n{MODEL_PATH}"
    )


# --------------------------------------------------
# Run
# --------------------------------------------------

if __name__ == "__main__":
    main()