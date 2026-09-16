from pathlib import Path
import random
import pandas as pd


random.seed(42)

BASE_DIR = Path(__file__).resolve().parents[1]

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "cashlytics_anomaly_transactions_v2.csv"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# User profiles
# --------------------------------------------------

users = {
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


categories = list(next(iter(users.values())).keys())


# --------------------------------------------------
# Generate normal transactions
# --------------------------------------------------

rows = []

NORMAL_TRANSACTIONS = 6000

user_ids = list(users.keys())

for _ in range(NORMAL_TRANSACTIONS):

    user_id = random.choice(user_ids)
    category = random.choice(categories)

    category_average = users[user_id][category]

    # Normal transaction is usually around the user's
    # normal category spending.
    amount = random.gauss(
        category_average,
        category_average * 0.30
    )

    amount = max(50, amount)

    transaction_hour = random.randint(6, 23)

    day_of_week = random.randint(0, 6)

    is_weekend = 1 if day_of_week >= 5 else 0

    merchant_frequency = random.randint(2, 25)

    rows.append({
        "user_id": user_id,
        "amount": round(amount, 2),
        "category": category,
        "transaction_hour": transaction_hour,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "merchant_frequency": merchant_frequency,
        "user_avg_category_spend": category_average,
        "amount_to_average_ratio": round(
            amount / category_average, 2
        ),
        "is_known_anomaly": 0,
    })


# --------------------------------------------------
# Deliberately unusual transactions
# --------------------------------------------------

anomalies = [
    {
        "user_id": "user_001",
        "category": "Food & Dining",
        "amount": 8500,
        "transaction_hour": 2,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_002",
        "category": "Groceries",
        "amount": 22000,
        "transaction_hour": 3,
        "day_of_week": 1,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_003",
        "category": "Transportation",
        "amount": 12000,
        "transaction_hour": 2,
        "day_of_week": 4,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_001",
        "category": "Shopping & Retail",
        "amount": 25000,
        "transaction_hour": 3,
        "day_of_week": 0,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_002",
        "category": "Entertainment & Recreation",
        "amount": 15000,
        "transaction_hour": 2,
        "day_of_week": 6,
        "is_weekend": 1,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_003",
        "category": "Healthcare & Medical",
        "amount": 18000,
        "transaction_hour": 3,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_001",
        "category": "Education",
        "amount": 25000,
        "transaction_hour": 2,
        "day_of_week": 3,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_002",
        "category": "Bills & Utilities",
        "amount": 18000,
        "transaction_hour": 3,
        "day_of_week": 5,
        "is_weekend": 1,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_003",
        "category": "Financial Services",
        "amount": 20000,
        "transaction_hour": 2,
        "day_of_week": 1,
        "is_weekend": 0,
        "merchant_frequency": 1,
    },
    {
        "user_id": "user_001",
        "category": "Government & Legal",
        "amount": 8000,
        "transaction_hour": 3,
        "day_of_week": 6,
        "is_weekend": 1,
        "merchant_frequency": 1,
    },
]


for anomaly in anomalies:

    category_average = users[
        anomaly["user_id"]
    ][anomaly["category"]]

    anomaly["user_avg_category_spend"] = category_average

    anomaly["amount_to_average_ratio"] = round(
        anomaly["amount"] / category_average,
        2
    )

    anomaly["is_known_anomaly"] = 1

    rows.append(anomaly)


# --------------------------------------------------
# Create DataFrame
# --------------------------------------------------

df = pd.DataFrame(rows)

df = df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


# --------------------------------------------------
# Save
# --------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# --------------------------------------------------
# Output
# --------------------------------------------------

print("=" * 60)
print("Cashlytics Anomaly Dataset V2")
print("=" * 60)

print(f"\nFile: {OUTPUT_FILE}")

print(f"\nTotal rows: {len(df)}")

print("\nColumns:")
print(df.columns.tolist())

print("\nKnown anomalies:")
print(df["is_known_anomaly"].value_counts())

print("\nUsers:")
print(df["user_id"].value_counts())

print("\nSample:")
print(df.head(10).to_string(index=False))

print("\nAmount-to-average ratio statistics:")
print(df["amount_to_average_ratio"].describe())

print("\nDataset generation completed successfully.")