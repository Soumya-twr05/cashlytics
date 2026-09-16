import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

OUTPUT_PATH = Path(
    "ml/data/processed/cashlytics_forecast_transactions.csv"
)

np.random.seed(42)


# ============================================================
# GENERATE 180 DAYS OF TRANSACTION DATA
# ============================================================

dates = pd.date_range(
    start="2026-03-01",
    periods=180,
    freq="D"
)

rows = []

base_daily_spending = 700

for i, date in enumerate(dates):

    # Gradual spending trend
    trend = i * 1.5

    # Weekly pattern
    weekday = date.weekday()

    if weekday >= 5:
        weekend_effect = 180
    else:
        weekend_effect = 0

    # Random daily variation
    noise = np.random.normal(0, 100)

    daily_spending = (
        base_daily_spending
        + trend
        + weekend_effect
        + noise
    )

    daily_spending = max(
        150,
        daily_spending
    )

    rows.append({
        "date": date,
        "daily_spending": round(daily_spending, 2)
    })


# ============================================================
# CREATE DATAFRAME
# ============================================================

df = pd.DataFrame(rows)


# ============================================================
# SAVE DATASET
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_PATH,
    index=False
)


# ============================================================
# DISPLAY INFORMATION
# ============================================================

print("\n==============================================")
print(" CASHLYTICS FORECAST DATASET")
print("==============================================")

print(f"\nRows generated: {len(df)}")

print("\nFirst 10 records:")
print(df.head(10).to_string(index=False))

print("\nStatistics:")
print(df["daily_spending"].describe())

print("\nDataset saved to:")
print(OUTPUT_PATH)