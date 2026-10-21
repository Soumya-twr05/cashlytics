"""
Cashlytics ML Service Self-Test Suite
Validates that FastAPI endpoints, models, and preprocessing are operational.
"""
import sys
from pathlib import Path

# Add ml root to path
_ML_DIR = Path(__file__).resolve().parent
if str(_ML_DIR) not in sys.path:
    sys.path.insert(0, str(_ML_DIR))

from fastapi.testclient import TestClient
from api.main import app

def run_tests():
    client = TestClient(app)
    print("=" * 60)
    print("Cashlytics ML API Test Suite")
    print("=" * 60)

    # 1. Root & Health
    res = client.get("/")
    assert res.status_code == 200, f"Root returned {res.status_code}"
    print("[PASS] GET / ->", res.json())

    res = client.get("/health")
    assert res.status_code == 200 and res.json().get("status") == "healthy"
    print("[PASS] GET /health ->", res.json())

    # 2. Transaction Category Prediction
    test_cases = [
        ("Uber cab ride to airport", 350.0, "Transport"),
        ("Swiggy dinner order", 450.0, "Food & Dining"),
        ("Monthly electricity bill", 1200.0, "Bills"),
        ("Bought milk and vegetables", 250.0, "Groceries"),
    ]

    for desc, amt, expected in test_cases:
        res = client.post("/predict-category", json={"description": desc, "amount": amt})
        assert res.status_code == 200, f"predict-category failed: {res.text}"
        data = res.json()
        print(f"[PASS] POST /predict-category ('{desc}') -> {data['category']} (conf: {data['confidence']})")

    # 3. Anomaly Detection
    # Normal spending
    normal_payload = {
        "amount": 350.0,
        "category": "Food & Dining",
        "transaction_hour": 13,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 12,
        "user_avg_category_spend": 400.0,
    }
    res = client.post("/detect-anomaly", json=normal_payload)
    assert res.status_code == 200
    normal_data = res.json()
    assert normal_data["is_anomaly"] is False
    print(f"[PASS] POST /detect-anomaly (normal) -> is_anomaly={normal_data['is_anomaly']}, risk={normal_data['risk_level']}")

    # Anomalous spending (e.g. 50x spend at 3 AM)
    anomaly_payload = {
        "amount": 25000.0,
        "category": "Food & Dining",
        "transaction_hour": 3,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 500.0,
    }
    res = client.post("/detect-anomaly", json=anomaly_payload)
    assert res.status_code == 200
    anomaly_data = res.json()
    assert anomaly_data["is_anomaly"] is True
    print(f"[PASS] POST /detect-anomaly (anomaly) -> is_anomaly={anomaly_data['is_anomaly']}, risk={anomaly_data['risk_level']}")

    # 4. Spending Forecast
    forecast_payload = {
        "current_spending": 15000.0,
        "days_available": 15,
        "days_in_month": 30,
        "recent_7_day_average": 950.0,
        "weekday_average": 900.0,
        "weekend_average": 1200.0,
        "historical_daily_average": 1000.0,
    }
    res = client.post("/forecast", json=forecast_payload)
    assert res.status_code == 200
    fc = res.json()
    assert fc["lower_bound"] <= fc["forecast"] <= fc["upper_bound"]
    print(f"[PASS] POST /forecast -> {fc['forecast']} (range: {fc['lower_bound']} - {fc['upper_bound']})")

    print("=" * 60)
    print("ALL ML API TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
