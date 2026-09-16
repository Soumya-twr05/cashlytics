import pandas as pd
import joblib
from sklearn.metrics import confusion_matrix, classification_report


# ============================================================
# 1. LOAD DATA
# ============================================================

DATA_PATH = "ml/data/processed/cashlytics_anomaly_transactions_v4.csv"
MODEL_PATH = "ml/models/anomaly_detector_v4.joblib"
OUTPUT_PATH = "ml/data/processed/cashlytics_hybrid_anomaly_results_v5.csv"

df = pd.read_csv(DATA_PATH)

artifact = joblib.load(MODEL_PATH)

model = artifact["model"]
scaler = artifact["scaler"]
features = artifact["features"]


# ============================================================
# 2. ML ANOMALY SIGNAL
# ============================================================

X = df[features]

X_scaled = scaler.transform(X)

ml_predictions = model.predict(X_scaled)

# Isolation Forest:
#  1  = normal
# -1  = anomaly

df["ml_signal"] = (ml_predictions == -1).astype(int)


# ============================================================
# 3. BEHAVIORAL SEVERITY
# ============================================================

def calculate_behavior_signal(score):
    """
    Convert behavioral deviation into a continuous signal.
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


df["behavior_signal"] = df["behavior_score"].apply(
    calculate_behavior_signal
)


# ============================================================
# 4. CONTINUOUS RISK SCORE
# ============================================================

def calculate_risk_score(row):

    behavior_score = row["behavior_score"]
    behavior_signal = row["behavior_signal"]
    ml_signal = row["ml_signal"]

    # Normalize behavioral deviation.
    # Extremely large deviations approach 1.0.
    behavioral_strength = min(behavior_score / 3.0, 1.0)

    # Combine behavioral evidence and ML evidence.
    risk_score = (
        behavioral_strength * 0.70
        + behavior_signal * 0.10
        + ml_signal * 0.20
    )

    return round(min(risk_score, 1.0), 3)


df["risk_score"] = df.apply(calculate_risk_score, axis=1)


# ============================================================
# 5. RISK LEVEL
# ============================================================

def determine_risk_level(row):

    score = row["risk_score"]
    behavior_score = row["behavior_score"]

    # Extreme behavioral deviation
    if behavior_score >= 3:
        return "CRITICAL"

    if score >= 0.75:
        return "HIGH"

    if score >= 0.40:
        return "MEDIUM"

    return "LOW"


df["risk_level"] = df.apply(determine_risk_level, axis=1)


# ============================================================
# 6. EXPLANATION ENGINE
# ============================================================

def generate_reasons(row):

    reasons = []

    ratio = row["amount_to_average_ratio"]
    transaction_hour = row["transaction_hour"]
    merchant_frequency = row["merchant_frequency"]
    ml_signal = row["ml_signal"]

    # Amount deviation
    if ratio >= 5:
        reasons.append(
            "Transaction amount is extremely higher than the user's normal category spending"
        )

    elif ratio >= 3:
        reasons.append(
            "Transaction amount is significantly higher than the user's normal category spending"
        )

    elif ratio >= 1.5:
        reasons.append(
            "Transaction amount is higher than the user's usual category spending"
        )

    # Time
    if transaction_hour < 6:
        reasons.append(
            "Transaction occurred at an unusual late-night/early-morning time"
        )

    # Merchant behavior
    if merchant_frequency <= 3:
        reasons.append(
            "Merchant is rarely used by the user"
        )

    # ML
    if ml_signal == 1:
        reasons.append(
            "Machine-learning model detected unusual transaction behavior"
        )

    # Default
    if not reasons:
        reasons.append(
            "Transaction behavior is consistent with the user's normal pattern"
        )

    return " | ".join(reasons)


df["reasons"] = df.apply(generate_reasons, axis=1)


# ============================================================
# 7. FINAL ANOMALY DECISION
# ============================================================

def final_decision(row):

    behavior_score = row["behavior_score"]
    ml_signal = row["ml_signal"]

    # Strong behavioral evidence
    if behavior_score >= 1:
        return 1

    # ML + moderate behavioral evidence
    if ml_signal == 1 and row["behavior_signal"] >= 0.5:
        return 1

    return 0


df["is_anomaly"] = df.apply(final_decision, axis=1)


# ============================================================
# 8. EVALUATION
# ============================================================

y_true = df["is_known_anomaly"]
y_pred = df["is_anomaly"]

cm = confusion_matrix(y_true, y_pred)

print("\n==============================================")
print(" CASHLYTICS V5 HYBRID ANOMALY DETECTOR")
print("==============================================")

print("\nConfusion Matrix:")
print(cm)

print("\nClassification Report:")
print(
    classification_report(
        y_true,
        y_pred,
        target_names=["Normal", "Anomaly"],
        zero_division=0
    )
)


# ============================================================
# 9. SUMMARY
# ============================================================

actual_anomalies = int(y_true.sum())
detected_anomalies = int(y_pred.sum())

false_positives = int(
    ((y_true == 0) & (y_pred == 1)).sum()
)

missed_anomalies = int(
    ((y_true == 1) & (y_pred == 0)).sum()
)

print("\n----------------------------------------------")
print("Detection Summary")
print("----------------------------------------------")

print(f"Actual anomalies       : {actual_anomalies}")
print(f"Detected anomalies     : {detected_anomalies}")
print(f"False positives        : {false_positives}")
print(f"Missed anomalies       : {missed_anomalies}")


# ============================================================
# 10. SHOW DETECTED TRANSACTIONS
# ============================================================

detected = df[df["is_anomaly"] == 1].copy()

print("\n==============================================")
print(" DETECTED ANOMALIES")
print("==============================================")

columns_to_show = [
    "user_id",
    "amount",
    "category",
    "transaction_hour",
    "amount_to_average_ratio",
    "behavior_score",
    "ml_signal",
    "risk_score",
    "risk_level",
    "reasons"
]

print(
    detected[columns_to_show].to_string(index=False)
)


# ============================================================
# 11. SAVE RESULTS
# ============================================================

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print("\n==============================================")
print(f"Results saved to:")
print(OUTPUT_PATH)
print("==============================================")