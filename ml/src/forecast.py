import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = Path(
    "ml/data/processed/cashlytics_forecast_transactions.csv"
)

MODEL_PATH = Path(
    "ml/models/forecast_baseline.joblib"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

df["date"] = pd.to_datetime(df["date"])

df = df.sort_values("date").reset_index(drop=True)


# ============================================================
# CREATE TIME FEATURES
# ============================================================

df["day_of_week"] = df["date"].dt.dayofweek
df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)

# Previous-day spending
df["lag_1"] = df["daily_spending"].shift(1)

# Spending 7 days ago
df["lag_7"] = df["daily_spending"].shift(7)

# 7-day moving average
df["rolling_7"] = (
    df["daily_spending"]
    .shift(1)
    .rolling(window=7)
    .mean()
)

# 30-day moving average
df["rolling_30"] = (
    df["daily_spending"]
    .shift(1)
    .rolling(window=30)
    .mean()
)


# Remove rows where historical features are unavailable
df = df.dropna().reset_index(drop=True)


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

# Time-series data should NOT be randomly shuffled.
# We train on the earlier period and test on the later period.

split_index = int(len(df) * 0.80)

train = df.iloc[:split_index]
test = df.iloc[split_index:]


features = [
    "day_of_week",
    "is_weekend",
    "lag_1",
    "lag_7",
    "rolling_7",
    "rolling_30"
]

X_train = train[features]
y_train = train["daily_spending"]

X_test = test[features]
y_test = test["daily_spending"]


# ============================================================
# BASELINE FORECAST
# ============================================================

# Our first forecasting approach uses the recent
# 7-day average as the prediction.

predictions = test["rolling_7"]


# ============================================================
# EVALUATION
# ============================================================

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        predictions
    )
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n==============================================")
print(" CASHLYTICS SPENDING FORECAST")
print("==============================================")

print(f"\nTraining records : {len(train)}")
print(f"Testing records  : {len(test)}")

print("\nEvaluation:")
print(f"MAE  : ₹{mae:.2f}")
print(f"RMSE : ₹{rmse:.2f}")


# ============================================================
# SHOW SAMPLE PREDICTIONS
# ============================================================

results = test[
    ["date", "daily_spending", "rolling_7"]
].copy()

results["forecast"] = predictions

results["error"] = (
    results["daily_spending"]
    - results["forecast"]
)

print("\n==============================================")
print(" SAMPLE FORECASTS")
print("==============================================")

print(
    results.head(15).to_string(
        index=False
    )
)


# ============================================================
# TRAIN FINAL BASELINE ARTIFACT
# ============================================================

forecast_artifact = {
    "method": "7-day-moving-average",
    "features": features,
    "mae": mae,
    "rmse": rmse
}

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    forecast_artifact,
    MODEL_PATH
)


# ============================================================
# FUTURE FORECAST
# ============================================================

latest_date = df["date"].max()

latest_7_day_average = (
    df["daily_spending"]
    .tail(7)
    .mean()
)

next_day = latest_date + pd.Timedelta(days=1)

print("\n==============================================")
print(" NEXT-DAY FORECAST")
print("==============================================")

print(f"Latest date        : {latest_date.date()}")
print(f"Forecast date      : {next_day.date()}")
print(
    f"Predicted spending : ₹{latest_7_day_average:.2f}"
)


print("\nModel saved to:")
print(MODEL_PATH)