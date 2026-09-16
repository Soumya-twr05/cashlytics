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
    "ml/data/processed/cashlytics_monthly_forecast_v4.csv"
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
df["day_of_week"] = df["date"].dt.dayofweek
df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)


# ============================================================
# FORECAST FUNCTION
# ============================================================

def forecast_month(month_data, cutoff_day):

    month_data = month_data.sort_values("date")

    year = month_data["year"].iloc[0]
    month = month_data["month"].iloc[0]

    days_in_month = int(
        month_data["date"]
        .dt.days_in_month
        .iloc[0]
    )

    observed = month_data[
        month_data["day"] <= cutoff_day
    ]

    if len(observed) == 0:
        return None

    days_available = len(observed)

    current_spending = (
        observed["daily_spending"].sum()
    )

    # --------------------------------------------------------
    # SIGNAL 1: Overall run rate
    # --------------------------------------------------------

    overall_daily_average = (
        current_spending
        / days_available
    )

    run_rate_forecast = (
        overall_daily_average
        * days_in_month
    )

    # --------------------------------------------------------
    # SIGNAL 2: Recent 7-day spending
    # --------------------------------------------------------

    recent_days = observed.tail(
        min(7, len(observed))
    )

    recent_7_day_average = (
        recent_days["daily_spending"].mean()
    )

    recent_forecast = (
        recent_7_day_average
        * days_in_month
    )

    # --------------------------------------------------------
    # SIGNAL 3: Weekday / weekend pattern
    # --------------------------------------------------------

    weekday_values = observed[
        observed["is_weekend"] == 0
    ]["daily_spending"]

    weekend_values = observed[
        observed["is_weekend"] == 1
    ]["daily_spending"]

    if len(weekday_values) > 0:
        weekday_average = weekday_values.mean()
    else:
        weekday_average = overall_daily_average

    if len(weekend_values) > 0:
        weekend_average = weekend_values.mean()
    else:
        weekend_average = overall_daily_average

    # Build expected remaining-month spending
    remaining_dates = month_data[
        month_data["day"] > cutoff_day
    ]["date"]

    if len(remaining_dates) > 0:

        remaining_weekdays = (
            remaining_dates.dt.dayofweek < 5
        )

        remaining_weekends = (
            remaining_dates.dt.dayofweek >= 5
        )

        expected_remaining = (
            remaining_weekdays.sum()
            * weekday_average
            +
            remaining_weekends.sum()
            * weekend_average
        )

        weekday_pattern_forecast = (
            current_spending
            + expected_remaining
        )

    else:

        weekday_pattern_forecast = (
            current_spending
        )

    # --------------------------------------------------------
    # SIGNAL 4: Historical monthly average
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

        historical_daily_average = (
            previous_months["daily_spending"]
            .mean()
        )

    else:

        historical_daily_average = (
            overall_daily_average
        )

    historical_forecast = (
        historical_daily_average
        * days_in_month
    )

    # --------------------------------------------------------
    # ENSEMBLE
    # --------------------------------------------------------

    # We give the current run rate the largest weight,
    # while using recent behavior and weekday patterns
    # as supporting signals.

    final_forecast = (
        run_rate_forecast * 0.45
        +
        recent_forecast * 0.20
        +
        weekday_pattern_forecast * 0.25
        +
        historical_forecast * 0.10
    )

    # --------------------------------------------------------
    # FORECAST RANGE
    # --------------------------------------------------------

    # Historical variation gives us an uncertainty estimate.

    daily_std = observed[
        "daily_spending"
    ].std()

    if pd.isna(daily_std):
        daily_std = 0

    remaining_days = (
        days_in_month
        - days_available
    )

    uncertainty = (
        daily_std
        * np.sqrt(max(remaining_days, 1))
        * 0.50
    )

    lower_bound = max(
        0,
        final_forecast - uncertainty
    )

    upper_bound = (
        final_forecast + uncertainty
    )

    # --------------------------------------------------------
    # ACTUAL MONTHLY SPENDING
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

        "overall_daily_average": round(
            overall_daily_average,
            2
        ),

        "recent_7_day_average": round(
            recent_7_day_average,
            2
        ),

        "weekday_average": round(
            weekday_average,
            2
        ),

        "weekend_average": round(
            weekend_average,
            2
        ),

        "historical_daily_average": round(
            historical_daily_average,
            2
        ),

        "run_rate_forecast": round(
            run_rate_forecast,
            2
        ),

        "recent_forecast": round(
            recent_forecast,
            2
        ),

        "weekday_pattern_forecast": round(
            weekday_pattern_forecast,
            2
        ),

        "historical_forecast": round(
            historical_forecast,
            2
        ),

        "final_forecast": round(
            final_forecast,
            2
        ),

        "lower_bound": round(
            lower_bound,
            2
        ),

        "upper_bound": round(
            upper_bound,
            2
        ),

        "actual_monthly_spending": round(
            actual_monthly_spending,
            2
        )
    }


# ============================================================
# BACKTEST
# ============================================================

BACKTEST_CUTOFF_DAY = 15

results_list = []


for (year, month), group in df.groupby(
    ["year", "month"]
):

    result = forecast_month(
        group,
        BACKTEST_CUTOFF_DAY
    )

    if result is not None:
        results_list.append(result)


results = pd.DataFrame(
    results_list
)


# ============================================================
# ERROR METRICS
# ============================================================

results["forecast_error"] = (
    results["actual_monthly_spending"]
    -
    results["final_forecast"]
)

results["absolute_error"] = (
    results["forecast_error"].abs()
)

mae = results[
    "absolute_error"
].mean()

rmse = np.sqrt(
    (
        results["forecast_error"] ** 2
    ).mean()
)


# ============================================================
# DISPLAY BACKTEST
# ============================================================

print("\n==============================================")
print(" CASHLYTICS MONTHLY FORECAST V4")
print(" ENSEMBLE FORECAST")
print("==============================================")


print(
    f"\nBacktest cutoff: Day {BACKTEST_CUTOFF_DAY}"
)


print("\nBacktest Results:")

print(
    results[
        [
            "year",
            "month",
            "days_available",
            "current_spending",
            "run_rate_forecast",
            "recent_forecast",
            "weekday_pattern_forecast",
            "historical_forecast",
            "final_forecast",
            "actual_monthly_spending",
            "forecast_error"
        ]
    ].to_string(index=False)
)


# ============================================================
# EVALUATION
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

current_cutoff = int(
    current_month_data["day"].max()
)

current_result = forecast_month(
    current_month_data,
    current_cutoff
)


# ============================================================
# CURRENT FORECAST
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
    f" {current_result['days_available']}/"
    f"{current_result['days_in_month']}"
)

print(
    f"Spent so far:"
    f" ₹{current_result['current_spending']:.2f}"
)

print(
    f"Projected month-end spending:"
    f" ₹{current_result['final_forecast']:.2f}"
)

print(
    f"Expected lower range:"
    f" ₹{current_result['lower_bound']:.2f}"
)

print(
    f"Expected upper range:"
    f" ₹{current_result['upper_bound']:.2f}"
)


# ============================================================
# BUDGET ANALYSIS
# ============================================================

sample_budget = 30000

forecast = current_result[
    "final_forecast"
]

lower = current_result[
    "lower_bound"
]

upper = current_result[
    "upper_bound"
]


print("\n==============================================")
print(" BUDGET FORECAST")
print("==============================================")


print(
    f"\nBudget:"
    f" ₹{sample_budget:.2f}"
)

print(
    f"Forecast:"
    f" ₹{forecast:.2f}"
)

print(
    f"Forecast range:"
    f" ₹{lower:.2f}"
    f" - ₹{upper:.2f}"
)


if lower > sample_budget:

    print(
        "\nStatus: HIGH RISK OF EXCEEDING BUDGET"
    )

elif forecast > sample_budget:

    print(
        "\nStatus: FORECAST ABOVE BUDGET"
    )

elif upper > sample_budget:

    print(
        "\nStatus: POSSIBLE BUDGET EXCEEDANCE"
    )

else:

    print(
        "\nStatus: LIKELY WITHIN BUDGET"
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