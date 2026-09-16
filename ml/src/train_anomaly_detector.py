from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_anomaly_transactions.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "anomaly_detector.joblib"
)

MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# Load dataset
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("Cashlytics Anomaly Detection")
print("=" * 60)

print(f"\nDataset size: {len(df)}")


# --------------------------------------------------
# Features
# --------------------------------------------------

features = [
    "amount",
    "category",
    "transaction_hour",
    "day_of_week",
    "is_weekend",
    "merchant_frequency",
]

X = df[features]

# Ground truth is ONLY used for evaluation.
y_true = df["is_known_anomaly"]


# --------------------------------------------------
# Preprocessing
# --------------------------------------------------

categorical_features = ["category"]

numeric_features = [
    "amount",
    "transaction_hour",
    "day_of_week",
    "is_weekend",
    "merchant_frequency",
]


preprocessor = ColumnTransformer(
    transformers=[
        (
            "category",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        ),
        (
            "numeric",
            "passthrough",
            numeric_features,
        ),
    ]
)


# --------------------------------------------------
# Isolation Forest
# --------------------------------------------------

model = IsolationForest(
    n_estimators=200,
    contamination=0.002,
    random_state=42,
)

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", model),
    ]
)


# --------------------------------------------------
# Train
# --------------------------------------------------

print("\nTraining Isolation Forest...")

pipeline.fit(X)


# --------------------------------------------------
# Predictions
# --------------------------------------------------

predictions = pipeline.predict(X)

# Isolation Forest:
#  1  = normal
# -1  = anomaly

y_pred = (predictions == -1).astype(int)


# --------------------------------------------------
# Evaluation
# --------------------------------------------------

print("\nKnown anomalies :", int(y_true.sum()))
print("Detected anomalies:", int(y_pred.sum()))

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))

print("\nClassification Report:")
print(
    classification_report(
        y_true,
        y_pred,
        target_names=["Normal", "Anomaly"],
        zero_division=0,
    )
)


# --------------------------------------------------
# Show detected anomalies
# --------------------------------------------------

results = df.copy()

results["anomaly_prediction"] = y_pred

results["anomaly_score"] = pipeline.decision_function(X)

detected = results[
    results["anomaly_prediction"] == 1
].sort_values("anomaly_score")


print("\nDetected anomalies:")
print(
    detected[
        [
            "amount",
            "category",
            "transaction_hour",
            "merchant_frequency",
            "is_known_anomaly",
            "anomaly_score",
        ]
    ].to_string(index=False)
)


# --------------------------------------------------
# Save model
# --------------------------------------------------

joblib.dump(pipeline, MODEL_PATH)

print("\n" + "=" * 60)
print("Model saved successfully")
print("=" * 60)

print(f"\nModel path:")
print(MODEL_PATH)