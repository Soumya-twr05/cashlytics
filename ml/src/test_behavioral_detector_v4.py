from pathlib import Path

import pandas as pd
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)


# ============================================================
# PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_anomaly_transactions_v4.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("Cashlytics Behavioral Anomaly Detector V4")
print("=" * 60)

print(f"\nTotal transactions: {len(df)}")

print(
    f"Known anomalies: "
    f"{df['is_known_anomaly'].sum()}"
)


# ============================================================
# BEHAVIORAL THRESHOLD
# ============================================================

# Based on the generated dataset:
#
# Normal maximum score = 0.14
# Anomaly minimum score = 3.20
#
# We deliberately choose a threshold between them.

THRESHOLD = 1.0


df["predicted_anomaly"] = (
    df["behavior_score"] >= THRESHOLD
).astype(int)


# ============================================================
# EVALUATION
# ============================================================

known_anomalies = int(
    df["is_known_anomaly"].sum()
)

detected_anomalies = int(
    df["predicted_anomaly"].sum()
)


print(
    f"\nKnown anomalies    : {known_anomalies}"
)

print(
    f"Detected anomalies : {detected_anomalies}"
)


print("\nConfusion Matrix:")

print(
    confusion_matrix(
        df["is_known_anomaly"],
        df["predicted_anomaly"]
    )
)


print("\nClassification Report:")

print(
    classification_report(
        df["is_known_anomaly"],
        df["predicted_anomaly"],
        target_names=[
            "Normal",
            "Anomaly",
        ],
        zero_division=0,
    )
)


# ============================================================
# DETECTED ANOMALIES
# ============================================================

detected = df[
    df["predicted_anomaly"] == 1
].sort_values(
    "behavior_score",
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
            "merchant_frequency",
            "amount_to_average_ratio",
            "behavior_score",
            "is_known_anomaly",
        ]
    ].to_string(index=False)
)


# ============================================================
# FALSE POSITIVES
# ============================================================

false_positives = df[
    (df["predicted_anomaly"] == 1)
    & (df["is_known_anomaly"] == 0)
]


print(
    f"\nFalse positives: "
    f"{len(false_positives)}"
)


# ============================================================
# MISSED ANOMALIES
# ============================================================

missed = df[
    (df["predicted_anomaly"] == 0)
    & (df["is_known_anomaly"] == 1)
]


print(
    f"Missed anomalies: "
    f"{len(missed)}"
)


print("\nBehavioral detector test completed.")
