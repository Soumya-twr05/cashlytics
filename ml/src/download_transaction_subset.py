from pathlib import Path
from collections import defaultdict
import pandas as pd
from datasets import load_dataset


# --------------------------------------------------
# SETTINGS
# --------------------------------------------------

TARGET_PER_CATEGORY = 2000
TARGET_TOTAL = 20000

DATASET_NAME = "mitulshah/transaction-categorization"

BASE_DIR = Path(__file__).resolve().parents[1]

OUTPUT_DIR = BASE_DIR / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "transactions_20k_india.csv"


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    print("=" * 60)
    print("Cashlytics Transaction Dataset Extraction")
    print("=" * 60)

    print("\nTarget:")
    print(f"- Records: {TARGET_TOTAL:,}")
    print(f"- Per category: {TARGET_PER_CATEGORY:,}")
    print("- Region: India")
    print("- Currency: INR")

    print("\nStarting streaming dataset...")
    print("The complete dataset will NOT be downloaded.")

    dataset = load_dataset(
        DATASET_NAME,
        split="train",
        streaming=True
    )

    collected = defaultdict(list)

    processed = 0

    print("\nReading transactions...")

    for row in dataset:

        processed += 1

        country = str(row.get("country", "")).strip().upper()
        currency = str(row.get("currency", "")).strip().upper()

        # Keep only Indian INR transactions
        if country != "INDIA" or currency != "INR":
            continue

        description = str(
            row.get("transaction_description", "")
        ).strip()

        category = str(
            row.get("category", "")
        ).strip()

        if not description or not category:
            continue

        # Stop collecting a category after 2,000 examples
        if len(collected[category]) >= TARGET_PER_CATEGORY:
            continue

        collected[category].append({
            "description": description,
            "category": category,
            "country": country,
            "currency": currency
        })

        current_total = sum(
            len(items) for items in collected.values()
        )

        if current_total >= TARGET_TOTAL:
            break

        # Progress message
        if processed % 100000 == 0:
            print(
                f"Scanned: {processed:,} | "
                f"Collected: {current_total:,}"
            )

    # --------------------------------------------------
    # CREATE DATAFRAME
    # --------------------------------------------------

    rows = []

    for category, items in collected.items():
        rows.extend(items)

    df = pd.DataFrame(rows)

    # Shuffle the dataset
    if not df.empty:
        df = df.sample(
            frac=1,
            random_state=42
        ).reset_index(drop=True)

    # --------------------------------------------------
    # SAVE
    # --------------------------------------------------

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    # --------------------------------------------------
    # RESULTS
    # --------------------------------------------------

    print("\n" + "=" * 60)
    print("EXTRACTION COMPLETE")
    print("=" * 60)

    print(f"\nRecords collected: {len(df):,}")

    print("\nCategory distribution:")
    print(df["category"].value_counts())

    print("\nOutput file:")
    print(OUTPUT_FILE)

    print("\nFile size:")
    print(
        f"{OUTPUT_FILE.stat().st_size / (1024 * 1024):.2f} MB"
    )

    print("\nDataset preview:")
    print(df.head(10).to_string(index=False))


if __name__ == "__main__":
    main()