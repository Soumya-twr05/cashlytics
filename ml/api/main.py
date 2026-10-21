

import sys
from pathlib import Path

# Ensure ML package directory and root are in sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
_ML_DIR = _CURRENT_DIR.parent
_ROOT_DIR = _ML_DIR.parent
for _p in (str(_ML_DIR), str(_CURRENT_DIR), str(_ROOT_DIR)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.forecast_service import forecast_monthly_spending
from api.anomaly_service import detect_anomaly
from api.classifier_service import predict_category
from api.schemas import (
    TransactionRequest,
    CategoryResponse,
    AnomalyRequest,
    AnomalyResponse,
    ForecastRequest,
    ForecastResponse,
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="Cashlytics ML API",
    description="Machine Learning service for Cashlytics",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8443",
        "http://127.0.0.1:8443",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5001",
        "http://127.0.0.1:5001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "service": "Cashlytics ML API",
        "status": "running",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# ============================================================
# TRANSACTION CATEGORY PREDICTION
# ============================================================

@app.post(
    "/predict-category",
    response_model=CategoryResponse,
)
def predict_transaction_category(
    request: TransactionRequest,
):
    """
    Predict the category of a financial transaction.
    """

    return predict_category(
        request.description
    )


# ============================================================
# ANOMALY DETECTION
# ============================================================

@app.post(
    "/detect-anomaly",
    response_model=AnomalyResponse,
)
def detect_transaction_anomaly(
    request: AnomalyRequest,
):
    return detect_anomaly(
        amount=request.amount,
        category=request.category,
        transaction_hour=request.transaction_hour,
        day_of_week=request.day_of_week,
        is_weekend=request.is_weekend,
        merchant_frequency=request.merchant_frequency,
        user_avg_category_spend=request.user_avg_category_spend,
    )


# ============================================================
# SPENDING FORECAST
# ============================================================

@app.post(
    "/forecast",
    response_model=ForecastResponse,
)
def forecast(
    request: ForecastRequest,
):
    return forecast_monthly_spending(
        current_spending=request.current_spending,
        days_available=request.days_available,
        days_in_month=request.days_in_month,
        recent_7_day_average=request.recent_7_day_average,
        weekday_average=request.weekday_average,
        weekend_average=request.weekend_average,
        historical_daily_average=request.historical_daily_average,
    )
