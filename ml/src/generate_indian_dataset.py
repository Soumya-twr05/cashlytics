from pathlib import Path
import csv
import random


# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

OUTPUT_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "cashlytics_indian_transactions.csv"
)


# --------------------------------------------------
# Dataset configuration
# --------------------------------------------------

SAMPLES_PER_CATEGORY = 1000

random.seed(42)


# --------------------------------------------------
# Indian transaction examples
# --------------------------------------------------

TRANSACTIONS = {

    "Food & Dining": [
        "UPI-SWIGGY",
        "SWIGGY FOOD ORDER",
        "SWIGGY UPI PAYMENT",
        "ZOMATO FOOD ORDER",
        "ZOMATO UPI PAYMENT",
        "DOMINOS PIZZA",
        "PIZZA HUT ONLINE",
        "MCDONALDS PAYMENT",
        "KFC ONLINE ORDER",
        "BURGER KING PAYMENT",
        "STARBUCKS INDIA",
        "CAFE COFFEE DAY",
        "RESTAURANT UPI PAYMENT",
        "FOOD DELIVERY PAYMENT",
        "ONLINE FOOD ORDER",
        "RESTAURANT BILL",
    ],

    "Groceries": [
        "BIGBASKET ORDER",
        "BIGBASKET UPI PAYMENT",
        "BLINKIT GROCERY ORDER",
        "ZEPTO GROCERY ORDER",
        "DMART PURCHASE",
        "DMART BILL",
        "RELIANCE SMART PURCHASE",
        "JIOMART ORDER",
        "GROCERY STORE PAYMENT",
        "SUPERMARKET PURCHASE",
        "MONTHLY GROCERY",
        "FRUIT AND VEGETABLE PURCHASE",
        "MILK PURCHASE",
        "GROCERY UPI PAYMENT",
    ],

    "Transportation": [
        "UBER RIDE",
        "UBER INDIA PAYMENT",
        "OLA CAB PAYMENT",
        "OLA RIDE",
        "RAPIDO BIKE RIDE",
        "RAPIDO PAYMENT",
        "AUTO RICKSHAW UPI",
        "CAB PAYMENT",
        "METRO CARD RECHARGE",
        "METRO TICKET",
        "BUS TICKET",
        "RAILWAY TICKET",
        "IRCTC TICKET",
        "PETROL PUMP PAYMENT",
        "HP PETROL PUMP",
        "INDIAN OIL PAYMENT",
        "BHARAT PETROLEUM",
    ],

    "Shopping & Retail": [
        "AMAZON INDIA",
        "AMAZON PURCHASE",
        "AMAZON UPI PAYMENT",
        "FLIPKART ORDER",
        "FLIPKART PAYMENT",
        "MYNTRA PURCHASE",
        "AJIO ONLINE ORDER",
        "MEESHO ORDER",
        "NYKAA PURCHASE",
        "RELIANCE DIGITAL",
        "CROMA PURCHASE",
        "MOBILE PHONE PURCHASE",
        "CLOTHES PURCHASE",
        "SHOES PURCHASE",
        "ELECTRONICS PURCHASE",
        "ONLINE SHOPPING",
        "RETAIL STORE PAYMENT",
    ],

    "Bills & Utilities": [
        "JIO RECHARGE",
        "JIO MOBILE RECHARGE",
        "AIRTEL RECHARGE",
        "VI MOBILE RECHARGE",
        "BSNL RECHARGE",
        "ELECTRICITY BILL PAYMENT",
        "WATER BILL PAYMENT",
        "GAS BILL PAYMENT",
        "PNG GAS BILL",
        "BROADBAND BILL",
        "WIFI BILL PAYMENT",
        "DTH RECHARGE",
        "TATA PLAY RECHARGE",
        "AIRTEL XSTREAM BILL",
        "MOBILE BILL PAYMENT",
        "INTERNET BILL",
    ],

    "Healthcare & Medical": [
        "APOLLO PHARMACY",
        "APOLLO HOSPITAL PAYMENT",
        "FORTIS HOSPITAL",
        "MAX HOSPITAL PAYMENT",
        "MEDANTA HOSPITAL",
        "PHARMACY PAYMENT",
        "MEDICINE PURCHASE",
        "MEDICAL STORE PAYMENT",
        "DOCTOR CONSULTATION",
        "HOSPITAL BILL",
        "DENTAL CLINIC PAYMENT",
        "LAB TEST PAYMENT",
        "DIAGNOSTIC CENTER",
        "HEALTH CHECKUP",
        "MEDICAL EXPENSE",
    ],

    "Entertainment & Recreation": [
        "NETFLIX SUBSCRIPTION",
        "NETFLIX PAYMENT",
        "AMAZON PRIME VIDEO",
        "DISNEY HOTSTAR",
        "SPOTIFY PREMIUM",
        "YOUTUBE PREMIUM",
        "PVR CINEMA",
        "INOX MOVIE TICKET",
        "MOVIE TICKET",
        "BOOKMYSHOW PAYMENT",
        "CONCERT TICKET",
        "GAME PURCHASE",
        "GYM MEMBERSHIP",
        "SPORTS CLUB PAYMENT",
        "ENTERTAINMENT PAYMENT",
    ],

    "Education": [
        "COLLEGE FEES",
        "UNIVERSITY FEES",
        "TUITION FEES",
        "ONLINE COURSE PAYMENT",
        "UDEMY COURSE",
        "COURSERA SUBSCRIPTION",
        "EDUCATION FEE",
        "EXAM FEE",
        "LIBRARY FEE",
        "BOOK PURCHASE FOR STUDY",
        "STUDY MATERIAL",
        "ONLINE LEARNING PAYMENT",
        "CERTIFICATION FEE",
        "TRAINING COURSE",
    ],

    "Rent & Housing": [
        "MONTHLY RENT",
        "HOUSE RENT PAYMENT",
        "ROOM RENT",
        "PG RENT PAYMENT",
        "HOSTEL FEES",
        "APARTMENT RENT",
        "RENT UPI PAYMENT",
        "RENT TRANSFER",
        "MONTHLY HOUSE RENT",
        "RENT PAYMENT",
        "ACCOMMODATION PAYMENT",
        "LANDLORD PAYMENT",
    ],

    "Financial Services": [
        "MUTUAL FUND SIP",
        "SIP PAYMENT",
        "INSURANCE PREMIUM",
        "LIFE INSURANCE PAYMENT",
        "HEALTH INSURANCE PREMIUM",
        "CREDIT CARD PAYMENT",
        "LOAN EMI PAYMENT",
        "BANK CHARGES",
        "ATM FEE",
        "DEMAT ACCOUNT CHARGES",
        "STOCK PURCHASE",
        "BROKERAGE CHARGES",
        "INVESTMENT PAYMENT",
        "FINANCIAL SERVICE PAYMENT",
    ],

    "Government & Legal": [
        "GOVERNMENT FEE",
        "PASSPORT FEE",
        "DRIVING LICENSE FEE",
        "TRAFFIC CHALLAN",
        "PROPERTY TAX",
        "MUNICIPAL TAX",
        "INCOME TAX PAYMENT",
        "GST PAYMENT",
        "COURT FEE",
        "GOVERNMENT SERVICE FEE",
        "REGISTRATION FEE",
        "RTO PAYMENT",
        "LEGAL SERVICE PAYMENT",
    ],

    "Income": [
        "SALARY CREDIT",
        "MONTHLY SALARY",
        "SALARY PAYMENT",
        "SALARY TRANSFER",
        "FREELANCE PAYMENT",
        "FREELANCE INCOME",
        "PROJECT PAYMENT",
        "CLIENT PAYMENT",
        "BUSINESS INCOME",
        "PART TIME INCOME",
        "BONUS CREDIT",
        "INCENTIVE CREDIT",
        "REFUND CREDIT",
        "CASHBACK CREDIT",
        "INTEREST CREDIT",
    ],
}


# --------------------------------------------------
# Generate variations
# --------------------------------------------------

def create_variation(description):
    variations = [
        description,
        f"UPI {description}",
        f"{description} PAYMENT",
        f"{description} ONLINE",
        f"{description} TXN",
        f"{description} UPI",
        f"{description} INDIA",
        f"{description} TRANSACTION",
    ]

    return random.choice(variations)


# --------------------------------------------------
# Generate dataset
# --------------------------------------------------

def generate_dataset():

    rows = []

    for category, descriptions in TRANSACTIONS.items():

        for _ in range(SAMPLES_PER_CATEGORY):

            description = random.choice(descriptions)

            description = create_variation(description)

            rows.append({
                "description": description,
                "category": category
            })

    random.shuffle(rows)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(
        OUTPUT_PATH,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=["description", "category"]
        )

        writer.writeheader()

        writer.writerows(rows)

    print("===================================")
    print("Cashlytics Dataset Generated")
    print("===================================")
    print(f"Total transactions: {len(rows)}")
    print(f"Categories: {len(TRANSACTIONS)}")
    print(f"Samples per category: {SAMPLES_PER_CATEGORY}")
    print(f"Saved to:")
    print(OUTPUT_PATH)


# --------------------------------------------------
# Run
# --------------------------------------------------

if __name__ == "__main__":
    generate_dataset()