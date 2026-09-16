from pathlib import Path
import random
import pandas as pd


# --------------------------------------------------
# Configuration
# --------------------------------------------------

random.seed(42)

BASE_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "cashlytics_anomaly_transactions.csv"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# Normal transaction patterns
# --------------------------------------------------

patterns = {
    "Food & Dining": {
        "amount_range": (80, 1200),
        "frequency_range": (5, 25),
    },
    "Groceries": {
        "amount_range": (150, 4000),
        "frequency_range": (3, 15),
    },
    "Transportation": {
        "amount_range": (30, 1500),
        "frequency_range": (5, 30),
    },
    "Shopping & Retail": {
        "amount_range": (300, 8000),
        "frequency_range": (1, 10),
    },
    "Bills & Utilities": {
        "amount_range": (300, 6000),
        "frequency_range": (1, 5),
    },
    "Healthcare & Medical": {
        "amount_range": (200, 10000),
        "frequency_range": (1, 4),
    },
    "Entertainment & Recreation": {
        "amount_range": (100, 3000),
        "frequency_range": (1, 10),
    },
    "Education": {
        "amount_range": (500, 15000),
        "frequency_range": (1, 5),
    },
    "Rent & Housing": {
        "amount_range": (5000, 30000),
        "frequency_range": (1, 2),
    },
    "Financial Services": {
        "amount_range": (500, 25000),
        "frequency_range": (1, 5),
    },
    "Government & Legal": {
        "amount_range": (100, 10000),
        "frequency_range": (1, 4),
    },
    "Income": {
        "amount_range": (15000, 100000),
        "frequency_range": (1, 3),
    },
}


categories = list(patterns.keys())


# --------------------------------------------------
# Generate normal transactions
# --------------------------------------------------

rows = []

NORMAL_TRANSACTIONS = 5000

for _ in range(NORMAL_TRANSACTIONS):

    category = random.choice(categories)

    amount_min, amount_max = patterns[category]["amount_range"]
    freq_min, freq_max = patterns[category]["frequency_range"]

    amount = round(random.uniform(amount_min, amount_max), 2)

    transaction_hour = random.randint(6, 23)

    day_of_week = random.randint(0, 6)

    is_weekend = 1 if day_of_week >= 5 else 0

    merchant_frequency = random.randint(freq_min, freq_max)

    rows.append({
        "amount": amount,
        "category": category,
        "transaction_hour": transaction_hour,
        "day_of_week": day_of_week,
        "is_weekend": is_weekend,
        "merchant_frequency": merchant_frequency,
        "is_known_anomaly": 0,
    })


# --------------------------------------------------
# Generate known anomalous transactions
# --------------------------------------------------

anomalies = [
    # Extremely high food transaction
    {
        "amount": 25000,
        "category": "Food & Dining",
        "transaction_hour": 2,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Extremely high shopping transaction
    {
        "amount": 95000,
        "category": "Shopping & Retail",
        "transaction_hour": 3,
        "day_of_week": 1,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Unusually large transportation transaction
    {
        "amount": 30000,
        "category": "Transportation",
        "transaction_hour": 4,
        "day_of_week": 3,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Very large entertainment transaction
    {
        "amount": 40000,
        "category": "Entertainment & Recreation",
        "transaction_hour": 2,
        "day_of_week": 5,
        "is_weekend": 1,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Unusually large grocery transaction
    {
        "amount": 30000,
        "category": "Groceries",
        "transaction_hour": 1,
        "day_of_week": 0,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Large financial transaction at unusual hour
    {
        "amount": 150000,
        "category": "Financial Services",
        "transaction_hour": 3,
        "day_of_week": 6,
        "is_weekend": 1,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Large healthcare transaction
    {
        "amount": 75000,
        "category": "Healthcare & Medical",
        "transaction_hour": 2,
        "day_of_week": 4,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Large education payment at unusual hour
    {
        "amount": 60000,
        "category": "Education",
        "transaction_hour": 3,
        "day_of_week": 2,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Huge utility transaction
    {
        "amount": 50000,
        "category": "Bills & Utilities",
        "transaction_hour": 2,
        "day_of_week": 6,
        "is_weekend": 1,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },

    # Huge housing transaction
    {
        "amount": 100000,
        "category": "Rent & Housing",
        "transaction_hour": 3,
        "day_of_week": 1,
        "is_weekend": 0,
        "merchant_frequency": 1,
        "is_known_anomaly": 1,
    },
]


rows.extend(anomalies)


# --------------------------------------------------
# Create DataFrame
# --------------------------------------------------

df = pd.DataFrame(rows)

# Shuffle the rows
df = df.sample(frac=1, random_state=42).reset_index(drop=True)


# --------------------------------------------------
# Save dataset
# --------------------------------------------------

df.to_csv(OUTPUT_FILE, index=False)


# --------------------------------------------------
# Display information
# --------------------------------------------------

print("=" * 60)
print("Cashlytics Anomaly Dataset Generated")
print("=" * 60)

print(f"\nFile: {OUTPUT_FILE}")

print(f"\nTotal rows: {len(df)}")

print("\nColumns:")
print(df.columns.tolist())

print("\nKnown anomalies:")
print(df["is_known_anomaly"].value_counts())

print("\nCategory distribution:")
print(df["category"].value_counts())

print("\nSample:")
print(df.head(10).to_string(index=False))

print("\nAmount statistics:")
print(df["amount"].describe())

print("\nDataset generation completed successfully.")