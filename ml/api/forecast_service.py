from calendar import monthrange


def forecast_monthly_spending(
    current_spending: float,
    days_available: int,
    days_in_month: int,
    recent_7_day_average: float,
    weekday_average: float,
    weekend_average: float,
    historical_daily_average: float,
):
    """
    Cashlytics monthly spending forecast.

    Combines four signals:

    1. Current spending run-rate       -> 45%
    2. Recent 7-day spending behavior  -> 20%
    3. Weekday/weekend spending pattern -> 25%
    4. Historical spending behavior    -> 10%
    """

    if days_available <= 0:
        raise ValueError("days_available must be greater than 0")

    if days_available > days_in_month:
        raise ValueError(
            "days_available cannot exceed days_in_month"
        )

    remaining_days = days_in_month - days_available

    # ---------------------------------------------------------
    # 1. Current run-rate
    # ---------------------------------------------------------

    current_daily_average = (
        current_spending / days_available
    )

    run_rate_forecast = (
        current_daily_average * days_in_month
    )

    # ---------------------------------------------------------
    # 2. Recent 7-day behavior
    # ---------------------------------------------------------

    recent_forecast = (
        current_spending
        + recent_7_day_average * remaining_days
    )

    # ---------------------------------------------------------
    # 3. Weekday / weekend pattern
    # ---------------------------------------------------------

    # Approximate remaining days by their average
    # weekday/weekend spending behavior.

    weekday_days = 0
    weekend_days = 0

    # We don't know the exact future calendar distribution
    # from the current API request, so estimate the remaining
    # days using the typical 5:2 weekday/weekend ratio.

    if remaining_days > 0:
        weekend_days = round(
            remaining_days * 2 / 7
        )

        weekday_days = (
            remaining_days - weekend_days
        )

    pattern_forecast = (
        current_spending
        + weekday_average * weekday_days
        + weekend_average * weekend_days
    )

    # ---------------------------------------------------------
    # 4. Historical spending
    # ---------------------------------------------------------

    historical_forecast = (
        historical_daily_average
        * days_in_month
    )

    # ---------------------------------------------------------
    # Ensemble forecast
    # ---------------------------------------------------------

    forecast_value = (
        run_rate_forecast * 0.45
        + recent_forecast * 0.20
        + pattern_forecast * 0.25
        + historical_forecast * 0.10
    )

    # ---------------------------------------------------------
    # Forecast uncertainty
    # ---------------------------------------------------------

    # A practical initial uncertainty range.
    # This is intentionally conservative rather than
    # presenting the forecast as an exact amount.

    uncertainty = max(
        forecast_value * 0.05,
        recent_7_day_average * 2
    )

    lower_bound = max(
        0,
        forecast_value - uncertainty
    )

    upper_bound = (
        forecast_value + uncertainty
    )

    return {
        "forecast": round(forecast_value, 2),
        "lower_bound": round(lower_bound, 2),
        "upper_bound": round(upper_bound, 2),
    }