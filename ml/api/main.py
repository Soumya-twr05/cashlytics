from fastapi import FastAPI
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
    # Temporary forecast.
    # The real forecasting engine
    # will be connected in the next step.

    forecast_value = (
        request.current_spending
        / request.days_available
        * request.days_in_month
    )

    return {
        "forecast": round(forecast_value, 2),
        "lower_bound": round(
            forecast_value * 0.95,
            2
        ),
        "upper_bound": round(
            forecast_value * 1.05,
            2
        ),
    }