from pydantic import BaseModel, Field


class TransactionRequest(BaseModel):
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)


class CategoryResponse(BaseModel):
    category: str
    confidence: float


class AnomalyRequest(BaseModel):
    amount: float = Field(..., gt=0)
    category: str
    transaction_hour: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    is_weekend: int = Field(..., ge=0, le=1)
    merchant_frequency: int = Field(..., ge=0)
    user_avg_category_spend: float = Field(..., gt=0)


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    risk_score: float
    risk_level: str
    reasons: list[str]


class ForecastRequest(BaseModel):
    current_spending: float = Field(..., ge=0)
    days_available: int = Field(..., gt=0)
    days_in_month: int = Field(..., gt=0)
    recent_7_day_average: float = Field(..., ge=0)
    weekday_average: float = Field(..., ge=0)
    weekend_average: float = Field(..., ge=0)
    historical_daily_average: float = Field(..., ge=0)


class ForecastResponse(BaseModel):
    forecast: float
    lower_bound: float
    upper_bound: float