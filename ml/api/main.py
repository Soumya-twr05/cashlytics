from fastapi import FastAPI
from ml.api.forecast_service import forecast_monthly_spending
from ml.api.anomaly_service import detect_anomaly
from ml.api.classifier_service import predict_category
from ml.api.schemas import (
    TransactionRequest,
    CategoryResponse,
    AnomalyRequest,
    AnomalyResponse,
    ForecastRequest,
    ForecastResponse,
)


app = FastAPI(
    title="Cashlytics ML API",
    description="Machine Learning service for Cashlytics",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "service": "Cashlytics ML API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post(
    "/predict-category",
    response_model=CategoryResponse
)
def predict_transaction_category(
    request: TransactionRequest
):
    return predict_category(request.description)


@app.post(
    "/detect-anomaly",
    response_model=AnomalyResponse
)
def detect_transaction_anomaly(
    request: AnomalyRequest
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

@app.post(
    "/forecast",
    response_model=ForecastResponse
)
def forecast(
    request: ForecastRequest
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