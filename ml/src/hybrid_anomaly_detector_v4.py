from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix


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

model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
scaler = model_package["scaler"]
features = model_package["features"]


# ============================================================
# ML PREDICTION
# ============================================================

X = df[features]

X_scaled = scaler.transform(X)

raw_prediction = model.predict(X_scaled)

df["ml_anomaly"] = (
    raw_prediction == -1
).astype(int)


# ============================================================
# BEHAVIORAL SIGNAL
# ============================================================

def calculate_behavior_signal(score):
    """
    Convert behavioral score into a 0-1 risk signal.
    """

    if score >= 3:
        return 1.0

    if score >= 1:
        return 0.8

    if score >= 0.5:
        return 0.5

    if score >= 0.2:
        return 0.25

    return 0.0


df["behavior_signal"] = (
    df["behavior_score"]
    .apply(calculate_behavior_signal)
)


# ============================================================
# HYBRID RISK SCORE
# ============================================================

# Behavioral analysis gets more weight because
# it represents user-specific financial behavior.
#
# ML gets a supporting role.

df["risk_score"] = (
    df["behavior_signal"] * 0.7
    + df["ml_anomaly"] * 0.3
)


# ============================================================
# RISK LEVEL
# ============================================================

def determine_risk_level(score):

    if score >= 0.8:
        return "HIGH"

    if score >= 0.4:
        return "MEDIUM"

    return "LOW"


df["risk_level"] = (
    df["risk_score"]
    .apply(determine_risk_level)
)


# ============================================================
# EXPLANATION ENGINE
# ============================================================

def generate_reasons(row):

    reasons = []

    if row["amount_to_average_ratio"] >= 3:
        reasons.append(
            "Transaction amount is significantly higher "
            "than the user's normal spending for this category."
        )

    if row["time_risk"] == 1:
        reasons.append(
            "Transaction occurred during an unusual time."
        )

    if row["merchant_risk"] == 1:
        reasons.append(
            "Merchant appears rarely used by this user."
        )

    if row["ml_anomaly"] == 1:
        reasons.append(
            "Machine-learning model identified unusual "
            "transaction behavior."
        )

    if not reasons:
        reasons.append(
            "Transaction is consistent with observed "
            "user spending behavior."
        )

    return reasons


df["reasons"] = df.apply(
    generate_reasons,
    axis=1
)


# ============================================================
# FINAL DECISION
# ============================================================

def final_decision(row):

    # Strong behavioral evidence
    if row["behavior_score"] >= 1:

        return 1

    # ML + moderate behavioral evidence
    if (
        row["ml_anomaly"] == 1
        and row["behavior_signal"] >= 0.5
    ):
        return 1

    return 0


df["predicted_anomaly"] = df.apply(
    final_decision,
    axis=1
)


# ============================================================
# EVALUATION
# ============================================================

print("=" * 60)
print("Cashlytics Hybrid Anomaly Detection V4")
print("=" * 60)

print(
    f"\nTotal transactions: {len(df)}"
)

print(
    f"Known anomalies: "
    f"{df['is_known_anomaly'].sum()}"
)

print(
    f"Detected anomalies: "
    f"{df['predicted_anomaly'].sum()}"
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
            "Anomaly"
        ],
        zero_division=0
    )
)


# ============================================================
# SHOW ANOMALIES
# ============================================================

detected = df[
    df["predicted_anomaly"] == 1
].sort_values(
    "risk_score",
    ascending=False
)


print("\nDetected transactions:")

for _, row in detected.iterrows():

    print("\n----------------------------------------")

    print(
        f"User       : {row['user_id']}"
    )

    print(
        f"Amount     : ₹{row['amount']:.2f}"
    )

    print(
        f"Category   : {row['category']}"
    )

    print(
        f"Ratio      : {row['amount_to_average_ratio']:.2f}x"
    )

    print(
        f"Behavior   : {row['behavior_score']:.3f}"
    )

    print(
        f"ML Signal  : {row['ml_anomaly']}"
    )

    print(
        f"Risk Score : {row['risk_score']:.3f}"
    )

    print(
        f"Risk Level : {row['risk_level']}"
    )

    print("Reasons:")

    for reason in row["reasons"]:
        print(f"  - {reason}")

    print(
        f"Known anomaly: "
        f"{row['is_known_anomaly']}"
    )


# ============================================================
# SAVE RESULTS
# ============================================================

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_hybrid_anomaly_results_v4.csv"
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


print("\nResults saved to:")
print(OUTPUT_PATH)

print(
    "\nHybrid anomaly detection completed successfully."
)