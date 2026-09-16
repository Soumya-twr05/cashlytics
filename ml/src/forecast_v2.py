import pandas as pd
import numpy as np
import joblib

from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = Path(
    "ml/data/processed/cashlytics_forecast_transactions.csv"
)

MODEL_PATH = Path(
    "ml/models/forecast_v2_random_forest.joblib"
)

OUTPUT_PATH = Path(
    "ml/data/processed/cashlytics_forecast_results_v2.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

df["date"] = pd.to_datetime(df["date"])

df = df.sort_values("date").reset_index(drop=True)


# ============================================================
# FEATURE ENGINEERING
# ============================================================

df["day_of_week"] = df["date"].dt.dayofweek

df["day_of_month"] = df["date"].dt.day

df["week_of_year"] = df["date"].dt.isocalendar().week.astype(int)

df["is_weekend"] = (
    df["day_of_week"] >= 5
).astype(int)


# Previous spending
df["lag_1"] = (
    df["daily_spending"]
    .shift(1)
)

df["lag_2"] = (
    df["daily_spending"]
    .shift(2)
)

df["lag_3"] = (
    df["daily_spending"]
    .shift(3)
)

df["lag_7"] = (
    df["daily_spending"]
    .shift(7)
)


# Rolling averages
df["rolling_3"] = (
    df["daily_spending"]
    .shift(1)
    .rolling(3)
    .mean()
)

df["rolling_7"] = (
    df["daily_spending"]
    .shift(1)
    .rolling(7)
    .mean()
)

df["rolling_14"] = (
    df["daily_spending"]
    .shift(1)
    .rolling(14)
    .mean()
)

df["rolling_30"] = (
    df["daily_spending"]
    .shift(1)
    .rolling(30)
    .mean()
)


# Remove rows where historical features are unavailable
df = df.dropna().reset_index(drop=True)


# ============================================================
# FEATURES
# ============================================================

features = [
    "day_of_week",
    "day_of_month",
    "week_of_year",
    "is_weekend",
    "lag_1",
    "lag_2",
    "lag_3",
    "lag_7",
    "rolling_3",
    "rolling_7",
    "rolling_14",
    "rolling_30"
]


X = df[features]

y = df["daily_spending"]


# ============================================================
# TIME-BASED TRAIN / TEST SPLIT
# ============================================================

split_index = int(len(df) * 0.80)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]


print("\n==============================================")
print(" CASHLYTICS FORECAST V2")
print(" RANDOM FOREST REGRESSION")
print("==============================================")


print(f"\nTraining records : {len(X_train)}")
print(f"Testing records  : {len(X_test)}")


# ============================================================
# TRAIN RANDOM FOREST
# ============================================================

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=8,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

model.fit(
    X_train,
    y_train
)


# ============================================================
# PREDICTIONS
# ============================================================

predictions = model.predict(
    X_test
)


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


print("\n==============================================")
print(" MODEL EVALUATION")
print("==============================================")

print(f"\nMAE  : ₹{mae:.2f}")
print(f"RMSE : ₹{rmse:.2f}")


# ============================================================
# COMPARE WITH BASELINE
# ============================================================

baseline_mae = 107.98
baseline_rmse = 135.38

mae_improvement = (
    baseline_mae - mae
)

rmse_improvement = (
    baseline_rmse - rmse
)


print("\n==============================================")
print(" BASELINE COMPARISON")
print("==============================================")

print(
    f"\nBaseline MAE      : ₹{baseline_mae:.2f}"
)

print(
    f"Random Forest MAE : ₹{mae:.2f}"
)

print(
    f"MAE difference    : ₹{mae_improvement:.2f}"
)

print(
    f"\nBaseline RMSE      : ₹{baseline_rmse:.2f}"
)

print(
    f"Random Forest RMSE : ₹{rmse:.2f}"
)

print(
    f"RMSE difference    : ₹{rmse_improvement:.2f}"
)


if mae < baseline_mae:
    print("\nRandom Forest improved the MAE baseline.")
else:
    print("\nRandom Forest did not improve the MAE baseline.")


# ============================================================
# SAMPLE PREDICTIONS
# ============================================================

results = df.iloc[split_index:][
    ["date", "daily_spending"]
].copy()

results["forecast"] = predictions

results["error"] = (
    results["daily_spending"]
    - results["forecast"]
)

results["absolute_error"] = (
    results["error"].abs()
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
# FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

importance = importance.sort_values(
    "importance",
    ascending=False
)


print("\n==============================================")
print(" FEATURE IMPORTANCE")
print("==============================================")

print(
    importance.to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

MODEL_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    {
        "model": model,
        "features": features,
        "mae": mae,
        "rmse": rmse
    },
    MODEL_PATH
)


# ============================================================
# SAVE PREDICTIONS
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

results.to_csv(
    OUTPUT_PATH,
    index=False
)


# ============================================================
# NEXT-DAY FORECAST
# ============================================================

latest_features = X.iloc[[-1]]

next_day_prediction = model.predict(
    latest_features
)[0]

latest_date = df["date"].max()

next_date = (
    latest_date
    + pd.Timedelta(days=1)
)


print("\n==============================================")
print(" NEXT-DAY FORECAST")
print("==============================================")

print(
    f"Latest date        : {latest_date.date()}"
)

print(
    f"Forecast date      : {next_date.date()}"
)

print(
    f"Predicted spending : ₹{next_day_prediction:.2f}"
)


# ============================================================
# FILES
# ============================================================

print("\n==============================================")
print(" FILES CREATED")
print("==============================================")

print(
    f"\nModel:"
    f"\n{MODEL_PATH}"
)

print(
    f"\nResults:"
    f"\n{OUTPUT_PATH}"
)

print("\n==============================================")