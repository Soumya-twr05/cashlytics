import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = Path(
    "ml/data/processed/cashlytics_forecast_transactions.csv"
)

OUTPUT_PATH = Path(
    "ml/data/processed/cashlytics_monthly_forecast_v3.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

df["date"] = pd.to_datetime(df["date"])

df = df.sort_values("date").reset_index(drop=True)

df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month
df["day"] = df["date"].dt.day


# ============================================================
# FORECAST A MONTH USING ONLY AVAILABLE DAYS
# ============================================================

def forecast_from_partial_month(month_data, cutoff_day):

    month_data = month_data.sort_values("date")

    year = month_data["year"].iloc[0]
    month = month_data["month"].iloc[0]

    days_in_month = (
        month_data["date"]
        .dt.days_in_month
        .iloc[0]
    )

    # --------------------------------------------------------
    # Use ONLY transactions available up to cutoff day
    # --------------------------------------------------------

    observed = month_data[
        month_data["day"] <= cutoff_day
    ]

    days_available = len(observed)

    if days_available == 0:
        return None

    current_spending = (
        observed["daily_spending"].sum()
    )

    average_daily_spending = (
        current_spending / days_available
    )

    # --------------------------------------------------------
    # Simple run-rate forecast
    # --------------------------------------------------------

    run_rate_forecast = (
        average_daily_spending
        * days_in_month
    )

    # --------------------------------------------------------
    # Historical daily average
    #
    # IMPORTANT:
    # Only previous completed months are used.
    # --------------------------------------------------------

    previous_months = df[
        (
            (df["year"] < year)
            |
            (
                (df["year"] == year)
                &
                (df["month"] < month)
            )
        )
    ]

    if len(previous_months) > 0:

        historical_average = (
            previous_months["daily_spending"]
            .mean()
        )

    else:

        historical_average = (
            average_daily_spending
        )

    # --------------------------------------------------------
    # Trend
    # --------------------------------------------------------

    if historical_average > 0:

        trend_ratio = (
            average_daily_spending
            / historical_average
        )

    else:

        trend_ratio = 1.0

    # Prevent extreme adjustments
    trend_ratio = np.clip(
        trend_ratio,
        0.80,
        1.20
    )

    adjusted_forecast = (
        historical_average
        * days_in_month
        * trend_ratio
    )

    # --------------------------------------------------------
    # Blend forecasts
    # --------------------------------------------------------

    final_forecast = (
        run_rate_forecast * 0.70
        +
        adjusted_forecast * 0.30
    )

    # --------------------------------------------------------
    # Actual complete-month spending
    #
    # This is used ONLY for evaluation.
    # --------------------------------------------------------

    actual_monthly_spending = (
        month_data["daily_spending"].sum()
    )

    return {
        "year": year,
        "month": month,
        "cutoff_day": cutoff_day,
        "days_available": days_available,
        "days_in_month": days_in_month,
        "current_spending": round(
            current_spending,
            2
        ),
        "average_daily_spending": round(
            average_daily_spending,
            2
        ),
        "historical_daily_average": round(
            historical_average,
            2
        ),
        "trend_ratio": round(
            trend_ratio,
            3
        ),
        "run_rate_forecast": round(
            run_rate_forecast,
            2
        ),
        "final_forecast": round(
            final_forecast,
            2
        ),
        "actual_monthly_spending": round(
            actual_monthly_spending,
            2
        )
    }


# ============================================================
# BACKTESTING
# ============================================================

# We pretend that we are halfway through each month.
# The model only sees spending up to this point.

monthly_results = []

BACKTEST_CUTOFF_DAY = 15


for (year, month), group in df.groupby(
    ["year", "month"]
):

    result = forecast_from_partial_month(
        group,
        BACKTEST_CUTOFF_DAY
    )

    if result is not None:
        monthly_results.append(result)


results = pd.DataFrame(
    monthly_results
)


# ============================================================
# FORECAST ERROR
# ============================================================

results["forecast_error"] = (
    results["actual_monthly_spending"]
    -
    results["final_forecast"]
)

results["absolute_error"] = (
    results["forecast_error"].abs()
)


# ============================================================
# EVALUATION
# ============================================================

mae = results[
    "absolute_error"
].mean()

rmse = np.sqrt(
    (
        results["forecast_error"] ** 2
    ).mean()
)


# ============================================================
# DISPLAY BACKTEST RESULTS
# ============================================================

print("\n==============================================")
print(" CASHLYTICS MONTHLY FORECAST V3")
print(" PROPER TIME-BASED BACKTEST")
print("==============================================")


print(
    f"\nBacktest cutoff:"
    f" Day {BACKTEST_CUTOFF_DAY}"
)

print(
    "\nThe forecast for each month uses only"
    "\nspending information available up to"
    f"day {BACKTEST_CUTOFF_DAY}."
)


print("\n==============================================")
print(" BACKTEST RESULTS")
print("==============================================")


print(
    results.to_string(
        index=False
    )
)


# ============================================================
# MODEL METRICS
# ============================================================

print("\n==============================================")
print(" MODEL EVALUATION")
print("==============================================")


print(
    f"\nMAE  : ₹{mae:.2f}"
)

print(
    f"RMSE : ₹{rmse:.2f}"
)


# ============================================================
# CURRENT MONTH FORECAST
# ============================================================

latest_year = df["year"].iloc[-1]
latest_month = df["month"].iloc[-1]

current_month_data = df[
    (df["year"] == latest_year)
    &
    (df["month"] == latest_month)
].copy()


# For the current month, use ALL currently available
# transaction days. Unlike the backtest, this is a
# real current-month estimate.

current_days_available = (
    len(current_month_data)
)

days_in_current_month = (
    current_month_data["date"]
    .dt.days_in_month
    .iloc[0]
)

current_spending = (
    current_month_data["daily_spending"]
    .sum()
)

current_daily_average = (
    current_spending
    /
    current_days_available
)


# Historical average from previous completed months

previous_months = df[
    (
        (df["year"] < latest_year)
        |
        (
            (df["year"] == latest_year)
            &
            (df["month"] < latest_month)
        )
    )
]


if len(previous_months) > 0:

    historical_average = (
        previous_months["daily_spending"]
        .mean()
    )

else:

    historical_average = (
        current_daily_average
    )


# Trend

if historical_average > 0:

    trend_ratio = (
        current_daily_average
        / historical_average
    )

else:

    trend_ratio = 1.0


trend_ratio = np.clip(
    trend_ratio,
    0.80,
    1.20
)


# Current run-rate

current_run_rate = (
    current_daily_average
    * days_in_current_month
)


# Historical-adjusted forecast

current_adjusted_forecast = (
    historical_average
    * days_in_current_month
    * trend_ratio
)


# Final forecast

current_forecast = (
    current_run_rate * 0.70
    +
    current_adjusted_forecast * 0.30
)


# ============================================================
# CURRENT MONTH OUTPUT
# ============================================================

print("\n==============================================")
print(" CURRENT MONTH FORECAST")
print("==============================================")


print(
    f"\nMonth:"
    f" {latest_month}/{latest_year}"
)

print(
    f"Days available:"
    f" {current_days_available}/"
    f"{days_in_current_month}"
)

print(
    f"Spent so far:"
    f" ₹{current_spending:.2f}"
)

print(
    f"Average daily spending:"
    f" ₹{current_daily_average:.2f}"
)

print(
    f"Projected month-end spending:"
    f" ₹{current_forecast:.2f}"
)


# ============================================================
# BUDGET COMPARISON
# ============================================================

sample_budget = 30000

difference = (
    current_forecast
    -
    sample_budget
)


print("\n==============================================")
print(" BUDGET FORECAST")
print("==============================================")


print(
    f"\nBudget:"
    f" ₹{sample_budget:.2f}"
)

print(
    f"Forecast:"
    f" ₹{current_forecast:.2f}"
)


if difference > 0:

    print(
        "\nStatus: OVER BUDGET"
    )

    print(
        f"Potential excess:"
        f" ₹{difference:.2f}"
    )

else:

    print(
        "\nStatus: WITHIN BUDGET"
    )

    print(
        f"Estimated remaining:"
        f" ₹{abs(difference):.2f}"
    )


# ============================================================
# SAVE RESULTS
# ============================================================

OUTPUT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

results.to_csv(
    OUTPUT_PATH,
    index=False
)


print("\n==============================================")
print(" FILE CREATED")
print("==============================================")

print(
    f"\n{OUTPUT_PATH}"
)

print("\n==============================================")