from pathlib import Path
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_indian_transactions.csv"
)

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_indian_transactions_v2.csv"
)


ADDITIONAL_DATA = {
    "Groceries": [
        "VEGETABLE PURCHASE",
        "FRUIT PURCHASE",
        "MILK AND BREAD PURCHASE",
        "HOUSEHOLD GROCERIES",
        "MONTHLY GROCERY SHOPPING",
        "DAILY GROCERY PURCHASE",
        "GROCERY SHOPPING",
        "GROCERY STORE PAYMENT",
        "VEGETABLES FROM LOCAL STORE",
        "FRUITS AND VEGETABLES",
        "RICE AND FLOUR PURCHASE",
        "KITCHEN GROCERIES",
        "HOUSEHOLD FOOD ITEMS",
        "MONTHLY SUPERMARKET BILL",
        "DAILY ESSENTIALS PURCHASE",
        "GROCERY UPI PAYMENT",
        "LOCAL MARKET PURCHASE",
        "MILK PURCHASE",
        "BREAD AND MILK",
    ],

    "Shopping & Retail": [
        "HEADPHONES PURCHASE",
        "WIRELESS HEADPHONES",
        "LAPTOP ACCESSORY PURCHASE",
        "MOBILE PHONE PURCHASE",
        "MOBILE ACCESSORIES",
        "ELECTRONICS SHOPPING",
        "ELECTRONIC ITEM ORDER",
        "CLOTHING PURCHASE",
        "SHOES PURCHASE",
        "BAG PURCHASE",
        "WATCH PURCHASE",
        "ONLINE PRODUCT PURCHASE",
        "ONLINE SHOPPING",
        "T SHIRT PURCHASE",
        "JEANS PURCHASE",
        "LAPTOP BAG PURCHASE",
        "BLUETOOTH SPEAKER PURCHASE",
        "KEYBOARD PURCHASE",
        "COMPUTER MOUSE PURCHASE",
        "RETAIL STORE PURCHASE",
    ],

    "Entertainment & Recreation": [
        "STREAMING SUBSCRIPTION",
        "OTT SUBSCRIPTION",
        "MUSIC SUBSCRIPTION",
        "MOVIE STREAMING PAYMENT",
        "VIDEO STREAMING PAYMENT",
        "CINEMA TICKET",
        "MOVIE TICKET",
        "MOVIE NIGHT PAYMENT",
        "MUSIC APP SUBSCRIPTION",
        "VIDEO SUBSCRIPTION",
        "OTT PLATFORM PAYMENT",
        "MOVIE THEATRE PAYMENT",
        "CONCERT TICKET",
        "GAME PURCHASE",
        "GAMING SUBSCRIPTION",
        "GYM MEMBERSHIP",
        "SPORTS CLUB PAYMENT",
        "WEEKEND ENTERTAINMENT",
        "THEATRE TICKET",
        "AMUSEMENT PARK TICKET",
    ],

    "Financial Services": [
        "CREDIT CARD PAYMENT",
        "CREDIT CARD BILL",
        "CREDIT CARD OUTSTANDING PAYMENT",
        "CREDIT CARD DUE PAYMENT",
        "BANK CREDIT CARD PAYMENT",
        "LOAN EMI PAYMENT",
        "PERSONAL LOAN EMI",
        "HOME LOAN EMI",
        "CAR LOAN EMI",
        "MUTUAL FUND SIP",
        "MONTHLY SIP INVESTMENT",
        "STOCK INVESTMENT",
        "SHARE MARKET INVESTMENT",
        "INSURANCE PREMIUM",
        "LIFE INSURANCE PREMIUM",
        "HEALTH INSURANCE PREMIUM",
        "BROKERAGE FEE",
        "BANK SERVICE CHARGE",
        "DEMAT ACCOUNT CHARGE",
        "INVESTMENT PAYMENT",
    ],
}


def main():

    print("Loading original dataset...")

    original_df = pd.read_csv(INPUT_PATH)

    print(f"Original rows: {len(original_df)}")

    new_rows = []

    for category, descriptions in ADDITIONAL_DATA.items():
        for description in descriptions:
            new_rows.append({
                "description": description,
                "category": category
            })

    additional_df = pd.DataFrame(new_rows)

    print(f"Additional rows: {len(additional_df)}")

    # Combine the COMPLETE original dataset with new examples
    combined_df = pd.concat(
        [original_df, additional_df],
        ignore_index=True
    )



    # Shuffle the complete dataset
    combined_df = combined_df.sample(
        frac=1,
        random_state=42
    ).reset_index(drop=True)

    combined_df.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print("\n===================================")
    print("Cashlytics Dataset V2")
    print("===================================")

    print(f"Original rows : {len(original_df)}")
    print(f"Added rows    : {len(additional_df)}")
    print(f"Final rows    : {len(combined_df)}")

    print("\nCategory distribution:")
    print(combined_df["category"].value_counts().sort_index())

    print(f"\nSaved to:\n{OUTPUT_PATH}")


if __name__ == "__main__":
    main()