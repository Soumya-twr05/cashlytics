import joblib
import pandas as pd
from pathlib import Path


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "anomaly_detector_v4.joblib"
)


# Load saved model package
model_package = joblib.load(MODEL_PATH)

model = model_package["model"]
scaler = model_package["scaler"]
FEATURES = model_package["features"]


def calculate_behavior_score(
    amount_to_average_ratio: float,
    transaction_hour: int,
    merchant_frequency: int
):
    """
    Calculate behavioral risk based on the user's normal spending behavior.
    """

    amount_deviation = abs(amount_to_average_ratio - 1)

    time_risk = 1 if transaction_hour < 6 else 0

    merchant_risk = 1 if merchant_frequency <= 3 else 0

    behavior_score = (
        amount_deviation * 0.7
        + time_risk * 0.2
        + merchant_risk * 0.1
    )

    return {
        "amount_deviation": amount_deviation,
        "time_risk": time_risk,
        "merchant_risk": merchant_risk,
        "behavior_score": behavior_score,
    }


def get_behavior_signal(behavior_score: float):

    if behavior_score >= 3:
        return 1.0

    if behavior_score >= 1:
        return 0.8

    if behavior_score >= 0.5:
        return 0.5

    if behavior_score >= 0.2:
        return 0.25

    return 0.0


def detect_anomaly(
    amount: float,
    category: str,
    transaction_hour: int,
    day_of_week: int,
    is_weekend: int,
    merchant_frequency: int,
    user_avg_category_spend: float,
):
    """
    Hybrid anomaly detection.

    Combines:
    - Behavioral detection
    - Isolation Forest ML detection
    """

    # Calculate spending ratio
    amount_to_average_ratio = (
        amount / user_avg_category_spend
    )

    # Behavioral analysis
    behavior = calculate_behavior_score(
        amount_to_average_ratio,
        transaction_hour,
        merchant_frequency,
    )

    behavior_score = behavior["behavior_score"]

    behavior_signal = get_behavior_signal(
        behavior_score
    )

    # Create feature dataframe
    feature_data = pd.DataFrame([{
        "amount": amount,
        "transaction_hour": transaction_hour,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "merchant_frequency": merchant_frequency,
        "user_avg_category_spend": user_avg_category_spend,
        "amount_to_average_ratio": amount_to_average_ratio,
        "amount_deviation": behavior["amount_deviation"],
        "time_risk": behavior["time_risk"],
        "merchant_risk": behavior["merchant_risk"],
    }])

    # Ensure feature order matches training
    feature_data = feature_data[FEATURES]

    # Apply the same scaler used during training
    scaled_features = scaler.transform(feature_data)

    # Isolation Forest prediction
    # -1 = anomaly
    #  1 = normal
    ml_prediction = model.predict(scaled_features)[0]

    ml_signal = 1 if ml_prediction == -1 else 0

    # V5 hybrid risk calculation
    behavioral_strength = min(
        behavior_score / 3.0,
        1.0
    )

    risk_score = (
        behavioral_strength * 0.70
        + behavior_signal * 0.10
        + ml_signal * 0.20
    )

    # Risk level
    if behavior_score >= 3:
        risk_level = "CRITICAL"

    elif risk_score >= 0.75:
        risk_level = "HIGH"

    elif risk_score >= 0.40:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    # Generate explanations
    reasons = []

    if amount_to_average_ratio >= 5:

        reasons.append(
            "Transaction amount is extremely higher than the user's usual spending."
        )

    elif amount_to_average_ratio >= 3:

        reasons.append(
            "Transaction amount is significantly higher than the user's usual spending."
        )

    elif amount_to_average_ratio >= 2:

        reasons.append(
            "Transaction amount is higher than the user's usual spending."
        )

    if behavior["time_risk"]:

        reasons.append(
            "Transaction occurred at an unusual time."
        )

    if behavior["merchant_risk"]:

        reasons.append(
            "Merchant is rarely used by the user."
        )

    if ml_signal:

        reasons.append(
            "ML model identified unusual transaction behavior."
        )

    if not reasons:

        reasons.append(
            "Transaction appears consistent with normal behavior."
        )

    # Final anomaly decision
    is_anomaly = (
        behavior_score >= 1
        or (
            ml_signal == 1
            and behavior_signal >= 0.5
        )
    )

    return {
        "is_anomaly": bool(is_anomaly),
        "risk_score": round(float(risk_score), 4),
        "risk_level": risk_level,
        "reasons": reasons,
    }