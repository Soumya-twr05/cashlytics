from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import IsolationForest
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)
from sklearn.preprocessing import StandardScaler


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_anomaly_transactions_v4.csv"
)

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "anomaly_detector_v4.joblib"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("Cashlytics ML Anomaly Detector V4")
print("=" * 60)

print(f"\nTotal transactions: {len(df)}")
print(
    f"Known anomalies: "
    f"{df['is_known_anomaly'].sum()}"
)


# ============================================================
# ML FEATURES
# ============================================================

features = [
    "amount",
    "transaction_hour",
    "day_of_week",
    "is_weekend",
    "merchant_frequency",
    "user_avg_category_spend",
    "amount_to_average_ratio",
    "amount_deviation",
    "time_risk",
    "merchant_risk",
]


X = df[features]

y = df["is_known_anomaly"]


# ============================================================
# SCALE FEATURES
# ============================================================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# ============================================================
# ISOLATION FOREST
# ============================================================

contamination = (
    df["is_known_anomaly"].sum()
    / len(df)
)


model = IsolationForest(
    n_estimators=300,
    contamination=contamination,
    random_state=42,
    n_jobs=-1,
)


# ============================================================
# TRAIN
# ============================================================

model.fit(X_scaled)


# ============================================================
# PREDICT
# ============================================================

raw_predictions = model.predict(X_scaled)

predicted_anomaly = (
    raw_predictions == -1
).astype(int)


# ============================================================
# EVALUATION
# ============================================================

known_anomalies = int(y.sum())

detected_anomalies = int(
    predicted_anomaly.sum()
)

print(
    f"\nKnown anomalies    : "
    f"{known_anomalies}"
)

print(
    f"Detected anomalies : "
    f"{detected_anomalies}"
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
# SHOW DETECTED TRANSACTIONS
# ============================================================

result_df = df.copy()

result_df["predicted_anomaly"] = (
    predicted_anomaly
)

detected = result_df[
    result_df["predicted_anomaly"] == 1
].sort_values(
    "amount_deviation",
    ascending=False
)


print("\nDetected transactions:")

print(
    detected[
        [
            "user_id",
            "amount",
            "category",
            "transaction_hour",
            "amount_to_average_ratio",
            "amount_deviation",
            "time_risk",
            "merchant_risk",
            "is_known_anomaly",
        ]
    ].to_string(index=False)
)


# ============================================================
# SAVE MODEL
# ============================================================

model_package = {
    "model": model,
    "scaler": scaler,
    "features": features,
}


MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    model_package,
    MODEL_PATH
)


print("\nModel saved to:")
print(MODEL_PATH)

print("\nML anomaly detector training completed.")