from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_anomaly_transactions_v2.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "anomaly_detector_v2.joblib"
)

MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# Load dataset
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("Cashlytics Anomaly Detection - V2")
print("=" * 60)

print(f"\nDataset size: {len(df)}")


# --------------------------------------------------
# Features
# --------------------------------------------------

features = [
    "user_id",
    "amount",
    "category",
    "transaction_hour",
    "day_of_week",
    "is_weekend",
    "merchant_frequency",
    "user_avg_category_spend",
    "amount_to_average_ratio",
]

X = df[features]

# Ground truth is ONLY used for evaluation.
y_true = df["is_known_anomaly"]


# --------------------------------------------------
# Feature types
# --------------------------------------------------

categorical_features = [
    "user_id",
    "category",
]

numeric_features = [
    "amount",
    "transaction_hour",
    "day_of_week",
    "is_weekend",
    "merchant_frequency",
    "user_avg_category_spend",
    "amount_to_average_ratio",
]


# --------------------------------------------------
# Preprocessing
# --------------------------------------------------

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
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
    n_estimators=300,
    contamination=10 / len(df),
    random_state=42,
    n_jobs=-1,
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

print("\nTraining Isolation Forest V2...")

pipeline.fit(X)


# --------------------------------------------------
# Predictions
# --------------------------------------------------

raw_predictions = pipeline.predict(X)

# Isolation Forest:
#  1  = normal
# -1  = anomaly

y_pred = (raw_predictions == -1).astype(int)


# --------------------------------------------------
# Evaluation
# --------------------------------------------------

print("\nKnown anomalies    :", int(y_true.sum()))
print("Detected anomalies :", int(y_pred.sum()))

print("\nConfusion Matrix:")
print(confusion_matrix(y_true, y_pred))


print("\nClassification Report:")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=[
            "Normal",
            "Anomaly",
        ],
        zero_division=0,
    )
)


# --------------------------------------------------
# Detailed results
# --------------------------------------------------

results = df.copy()

results["anomaly_prediction"] = y_pred

results["anomaly_score"] = pipeline.decision_function(X)


detected = results[
    results["anomaly_prediction"] == 1
].sort_values(
    "anomaly_score"
)


print("\nDetected transactions:")
print(
    detected[
        [
            "user_id",
            "amount",
            "category",
            "transaction_hour",
            "user_avg_category_spend",
            "amount_to_average_ratio",
            "is_known_anomaly",
            "anomaly_score",
        ]
    ].to_string(index=False)
)


# --------------------------------------------------
# Save model
# --------------------------------------------------

joblib.dump(
    pipeline,
    MODEL_PATH,
)


print("\n" + "=" * 60)
print("Model saved successfully")
print("=" * 60)

print(f"\nModel path:")
print(MODEL_PATH)