from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_anomaly_transactions_v3.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "anomaly_detector_v3.joblib"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("Cashlytics Anomaly Detection V3")
print("=" * 60)

print(f"\nTotal samples: {len(df)}")

print(
    f"Known anomalies: "
    f"{df['is_known_anomaly'].sum()}"
)


# ============================================================
# FEATURES
# ============================================================

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


X = df[
    categorical_features + numeric_features
]

y = df["is_known_anomaly"]


# ============================================================
# PREPROCESSING
# ============================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features,
        ),
        (
            "numeric",
            "passthrough",
            numeric_features,
        ),
    ]
)


X_processed = preprocessor.fit_transform(X)


# ============================================================
# ISOLATION FOREST
# ============================================================

anomaly_contamination = (
    df["is_known_anomaly"].sum() / len(df)
)

print(
    f"\nContamination: "
    f"{anomaly_contamination:.6f}"
)


model = IsolationForest(
    n_estimators=300,
    contamination=anomaly_contamination,
    random_state=42,
    n_jobs=-1,
)


# ============================================================
# TRAIN
# ============================================================

model.fit(X_processed)


# ============================================================
# PREDICT
# ============================================================

predictions = model.predict(X_processed)

# Isolation Forest:
#   1  = normal
#  -1  = anomaly

predicted_anomaly = (
    predictions == -1
).astype(int)


# ============================================================
# RESULTS
# ============================================================

known_anomalies = int(y.sum())

detected_anomalies = int(
    predicted_anomaly.sum()
)

print("\nKnown anomalies :", known_anomalies)
print(
    "Detected anomalies:",
    detected_anomalies
)


print("\nConfusion Matrix:")
print(
    confusion_matrix(
        y,
        predicted_anomaly
    )
)


print("\nClassification Report:")
print(
    classification_report(
        y,
        predicted_anomaly,
        target_names=[
            "Normal",
            "Anomaly",
            ],
        zero_division=0,
    )
)


# ============================================================
# SHOW DETECTED ANOMALIES
# ============================================================

result_df = df.copy()

result_df["predicted_anomaly"] = (
    predicted_anomaly
)

detected = result_df[
    result_df["predicted_anomaly"] == 1
]

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
        ]
    ].to_string(index=False)
)


# ============================================================
# SAVE MODEL
# ============================================================

model_data = {
    "preprocessor": preprocessor,
    "model": model,
    "features": {
        "categorical": categorical_features,
        "numeric": numeric_features,
    },
}


MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    model_data,
    MODEL_PATH
)


print("\nModel saved to:")
print(MODEL_PATH)

print("\nTraining completed successfully.")