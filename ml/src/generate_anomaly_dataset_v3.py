from pathlib import Path
import random
import pandas as pd


# ============================================================
# CONFIGURATION
# ============================================================

random.seed(42)

BASE_DIR = Path(__file__).resolve().parents[1]

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_anomaly_transactions_v3.csv"
)


# ============================================================
# USER PROFILES
# ============================================================

USER_PROFILES = {
    "user_001": {
        "Food & Dining": 500,
        "Groceries": 2500,
        "Transportation": 1200,
        "Shopping & Retail": 3000,
        "Bills & Utilities": 2500,
        "Healthcare & Medical": 3000,
        "Entertainment & Recreation": 1000,
        "Education": 5000,
        "Rent & Housing": 18000,
        "Financial Services": 5000,
        "Government & Legal": 1000,
    },

    "user_002": {
        "Food & Dining": 800,
        "Groceries": 4000,
        "Transportation": 2000,
        "Shopping & Retail": 5000,
        "Bills & Utilities": 3500,
        "Healthcare & Medical": 4000,
        "Entertainment & Recreation": 2000,
        "Education": 8000,
        "Rent & Housing": 22000,
        "Financial Services": 7000,
        "Government & Legal": 1500,
    },

    "user_003": {
        "Food & Dining": 400,
        "Groceries": 1800,
        "Transportation": 800,
        "Shopping & Retail": 2000,
        "Bills & Utilities": 2000,
        "Healthcare & Medical": 2500,
        "Entertainment & Recreation": 700,
        "Education": 3000,
        "Rent & Housing": 15000,
        "Financial Services": 3000,
        "Government & Legal": 800,
    },
}


# ============================================================
# NORMAL TRANSACTION GENERATOR
# ============================================================

def generate_normal_transaction(user_id, category, average):
    """
    Generate realistic transactions around the user's
    normal spending behavior.
    """

    # Keep normal transactions relatively close
    # to the user's usual spending level.
    variation = random.uniform(0.75, 1.25)

    amount = average * variation

    # Normal transaction time:
    # Most normal transactions happen during daytime/evening.
    transaction_hour = random.choice([
        random.randint(7, 11),
        random.randint(12, 17),
        random.randint(18, 22),
    ])

    day_of_week = random.randint(0, 6)

    is_weekend = 1 if day_of_week >= 5 else 0

    # Merchant frequency:
    # Higher number = frequently used merchant.
    merchant_frequency = random.randint(5, 100)

    amount_to_average_ratio = amount / average

    return {
        "user_id": user_id,
        "amount": round(amount, 2),
        "category": category,
        "transaction_hour": transaction_hour,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "merchant_frequency": merchant_frequency,
        "user_avg_category_spend": average,
        "amount_to_average_ratio": round(amount_to_average_ratio, 2),
        "is_known_anomaly": 0,
    }


# ============================================================
# NORMAL DATASET
# ============================================================

normal_transactions = []

NORMAL_TRANSACTIONS_PER_USER = 2000

for user_id, categories in USER_PROFILES.items():

    for _ in range(NORMAL_TRANSACTIONS_PER_USER):

        category = random.choice(list(categories.keys()))

        average = categories[category]

        transaction = generate_normal_transaction(
            user_id,
            category,
            average
        )

        normal_transactions.append(transaction)


# ============================================================
# DELIBERATE ANOMALIES
# ============================================================

anomalies = [

    # Extremely high Food spending at unusual hour
    {
        "user_id": "user_001",
        "amount": 8500,
        "category": "Food & Dining",
        "transaction_hour": 2,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 500,
    },

    # Extremely high Grocery spending at 3 AM
    {
        "user_id": "user_002",
        "amount": 22000,
        "category": "Groceries",
        "transaction_hour": 3,
        "day_of_week": 1,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 4000,
    },

    # Huge transportation transaction
    {
        "user_id": "user_003",
        "amount": 12000,
        "category": "Transportation",
        "transaction_hour": 2,
        "day_of_week": 4,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 800,
    },

    # Very large shopping transaction
    {
        "user_id": "user_001",
        "amount": 25000,
        "category": "Shopping & Retail",
        "transaction_hour": 3,
        "day_of_week": 3,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 3000,
    },

    # Unusual entertainment transaction
    {
        "user_id": "user_002",
        "amount": 15000,
        "category": "Entertainment & Recreation",
        "transaction_hour": 2,
        "day_of_week": 5,
        "is_weekend": 1,
        "merchant_frequency": 1,
        "user_avg_category_spend": 2000,
    },

    # Large healthcare transaction
    {
        "user_id": "user_003",
        "amount": 18000,
        "category": "Healthcare & Medical",
        "transaction_hour": 3,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 2500,
    },

    # Huge education transaction
    {
        "user_id": "user_001",
        "amount": 25000,
        "category": "Education",
        "transaction_hour": 2,
        "day_of_week": 1,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 5000,
    },

    # Very high utility bill
    {
        "user_id": "user_002",
        "amount": 18000,
        "category": "Bills & Utilities",
        "transaction_hour": 3,
        "day_of_week": 4,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 3500,
    },

    # Huge financial transaction
    {
        "user_id": "user_003",
        "amount": 20000,
        "category": "Financial Services",
        "transaction_hour": 2,
        "day_of_week": 0,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "user_avg_category_spend": 3000,
    },

    # Unusually large government payment
    {
        "user_id": "user_001",
        "amount": 8000,
        "category": "Government & Legal",
        "transaction_hour": 3,
        "day_of_week": 6,
        "is_weekend": 1,
        "merchant_frequency": 1,
        "user_avg_category_spend": 1000,
    },
]


# Calculate anomaly ratios
for transaction in anomalies:

    transaction["amount_to_average_ratio"] = round(
        transaction["amount"]
        / transaction["user_avg_category_spend"],
        2
    )

    transaction["is_known_anomaly"] = 1


# ============================================================
# COMBINE DATA
# ============================================================

all_transactions = normal_transactions + anomalies

df = pd.DataFrame(all_transactions)


# ============================================================
# SHUFFLE DATA
# ============================================================

df = df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


# ============================================================
# SAVE
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
# VERIFICATION
# ============================================================

print("=" * 60)
print("Cashlytics Anomaly Dataset V3")
print("=" * 60)

print(f"\nDataset saved to:")
print(OUTPUT_PATH)

print(f"\nTotal rows: {len(df)}")

print("\nAnomaly distribution:")
print(
    df["is_known_anomaly"]
    .value_counts()
    .sort_index()
)

print("\nCategory distribution:")
print(
    df["category"]
    .value_counts()
)

print("\nAmount statistics:")
print(
    df["amount"].describe()
)

print("\nAnomaly examples:")
print(
    df[df["is_known_anomaly"] == 1][
        [
            "user_id",
            "amount",
            "category",
            "transaction_hour",
            "user_avg_category_spend",
            "amount_to_average_ratio",
        ]
    ]
    .to_string(index=False)
)

print("\nDataset generation completed successfully.")