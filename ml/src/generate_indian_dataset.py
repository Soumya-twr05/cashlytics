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
# Category names MUST match the backend CATEGORIES
# enum exactly:
#   Food & Dining, Transport, Shopping, Entertainment,
#   Electronics, Groceries, Bills, Healthcare,
#   Education, Investment, Income, Transfer,
#   Lifestyle, Other
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
        "HALDIRAMS PAYMENT",
        "BARBEQUE NATION BILL",
        "CHAAYOS CAFE PAYMENT",
        "BIRYANI ORDER ONLINE",
        "LUNCH AT RESTAURANT",
        "DINNER AT RESTAURANT",
        "BREAKFAST ORDER",
        "FOOD COURT PAYMENT",
        "DHABA PAYMENT",
    ],

    "Groceries": [
        "BIGBASKET ORDER",
        "BIGBASKET UPI PAYMENT",
        "BLINKIT GROCERY ORDER",
        "ZEPTO GROCERY ORDER",
        "DMART PURCHASE",
        "DMART BILL",
        "DMART GROCERY PURCHASE",
        "DMART GROCERY SHOPPING",
        "DMART SUPERMARKET BILL",
        "DMART HOUSEHOLD ITEMS",
        "AVENUE SUPERMARTS PURCHASE",
        "RELIANCE SMART PURCHASE",
        "RELIANCE SMART GROCERY",
        "RELIANCE FRESH PURCHASE",
        "JIOMART ORDER",
        "GROCERY STORE PAYMENT",
        "SUPERMARKET PURCHASE",
        "MONTHLY GROCERY",
        "FRUIT AND VEGETABLE PURCHASE",
        "MILK PURCHASE",
        "GROCERY UPI PAYMENT",
        "DAILY GROCERY PURCHASE",
        "VEGETABLES FROM LOCAL STORE",
        "FRUITS AND VEGETABLES",
        "RICE AND FLOUR PURCHASE",
        "KITCHEN GROCERIES",
        "HOUSEHOLD FOOD ITEMS",
        "MONTHLY SUPERMARKET BILL",
        "DAILY ESSENTIALS PURCHASE",
        "LOCAL MARKET PURCHASE",
        "BREAD AND MILK",
        "NATURE BASKET ORDER",
        "SPENCERS GROCERY",
        "MORE SUPERMARKET BILL",
        "STAR BAZAAR GROCERY",
    ],

    "Transport": [
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
        "UBER RIDE TO COLLEGE",
        "UBER RIDE TO OFFICE",
        "OLA AUTO RIDE",
        "OLA OUTSTATION CAB",
        "RAPIDO BIKE TAXI",
        "PARKING FEE PAYMENT",
        "TOLL PAYMENT FASTAG",
        "FASTAG RECHARGE",
        "DIESEL PURCHASE",
        "PETROL PURCHASE",
        "TRAIN TICKET BOOKING",
        "BUS PASS RENEWAL",
        "FLIGHT TICKET BOOKING",
        "MAKEMYTRIP BOOKING",
        "CLEARTRIP BOOKING",
    ],

    "Shopping": [
        "AMAZON INDIA",
        "AMAZON PURCHASE",
        "AMAZON UPI PAYMENT",
        "FLIPKART ORDER",
        "FLIPKART PAYMENT",
        "MYNTRA PURCHASE",
        "MYNTRA SHOES PURCHASE",
        "MYNTRA CLOTHING ORDER",
        "MYNTRA FASHION ORDER",
        "AJIO ONLINE ORDER",
        "AJIO CLOTHING PURCHASE",
        "AJIO FASHION ORDER",
        "MEESHO ORDER",
        "NYKAA PURCHASE",
        "NYKAA BEAUTY ORDER",
        "ZUDIO STORE",
        "ZUDIO CLOTHING PURCHASE",
        "ZUDIO FASHION STORE",
        "ZUDIO PURCHASE",
        "PURCHASE AT ZUDIO",
        "ZUDIO SURAT",
        "ZUDIO MUMBAI",
        "ZUDIO STORE SURAT",
        "ZUDIO CLOTHING",
        "CLOTHES PURCHASE",
        "SHOES PURCHASE",
        "ONLINE SHOPPING",
        "RETAIL STORE PAYMENT",
        "T SHIRT PURCHASE",
        "JEANS PURCHASE",
        "BAG PURCHASE",
        "WATCH PURCHASE",
        "AMAZON CLOTHING ORDER",
        "FLIPKART FASHION ORDER",
        "H AND M PURCHASE",
        "WESTSIDE PURCHASE",
        "PANTALOONS PURCHASE",
        "MAX FASHION PURCHASE",
        "LIFESTYLE STORE PURCHASE",
        "SHOPPERS STOP PURCHASE",
        "FABINDIA PURCHASE",
        "DECATHLON SPORTS PURCHASE",
        "LENSKART ORDER",
    ],

    "Entertainment": [
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
        "STREAMING SUBSCRIPTION",
        "OTT SUBSCRIPTION",
        "MUSIC SUBSCRIPTION",
        "CINEMA TICKET",
        "GAMING SUBSCRIPTION",
        "WEEKEND ENTERTAINMENT",
        "THEATRE TICKET",
        "AMUSEMENT PARK TICKET",
        "SONYLIV SUBSCRIPTION",
        "JIOCINEMA SUBSCRIPTION",
    ],

    "Electronics": [
        "MOBILE PHONE PURCHASE",
        "LAPTOP PURCHASE",
        "CROMA PURCHASE",
        "RELIANCE DIGITAL",
        "RELIANCE DIGITAL PURCHASE",
        "VIJAY SALES PURCHASE",
        "ELECTRONIC ITEM ORDER",
        "HEADPHONES PURCHASE",
        "WIRELESS HEADPHONES",
        "LAPTOP ACCESSORY PURCHASE",
        "MOBILE ACCESSORIES",
        "ELECTRONICS SHOPPING",
        "BLUETOOTH SPEAKER PURCHASE",
        "KEYBOARD PURCHASE",
        "COMPUTER MOUSE PURCHASE",
        "TABLET PURCHASE",
        "SMARTWATCH PURCHASE",
        "CHARGER PURCHASE",
        "EARPHONES PURCHASE",
        "PRINTER PURCHASE",
        "CAMERA PURCHASE",
        "TELEVISION PURCHASE",
        "MONITOR PURCHASE",
        "AMAZON ELECTRONICS ORDER",
        "FLIPKART ELECTRONICS ORDER",
    ],

    "Bills": [
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
        "MONTHLY RENT",
        "HOUSE RENT PAYMENT",
        "ROOM RENT",
        "PG RENT PAYMENT",
        "APARTMENT RENT",
        "RENT UPI PAYMENT",
        "LANDLORD PAYMENT",
        "HOSTEL FEES",
        "GOVERNMENT FEE",
        "PROPERTY TAX",
        "MUNICIPAL TAX",
        "INCOME TAX PAYMENT",
        "GST PAYMENT",
        "TRAFFIC CHALLAN",
        "MAINTENANCE CHARGES",
        "SOCIETY MAINTENANCE",
    ],

    "Healthcare": [
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
        "NETMEDS ORDER",
        "PHARMEASY ORDER",
        "1MG PHARMACY",
        "MEDPLUS PHARMACY",
        "EYE CHECKUP",
        "BLOOD TEST PAYMENT",
        "XRAY PAYMENT",
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
        "UPGRAD COURSE",
        "BYJUS SUBSCRIPTION",
        "UNACADEMY SUBSCRIPTION",
        "SCHOOL FEES",
        "COACHING FEE",
        "TEXTBOOK PURCHASE",
    ],

    "Investment": [
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
        "PERSONAL LOAN EMI",
        "HOME LOAN EMI",
        "CAR LOAN EMI",
        "MONTHLY SIP INVESTMENT",
        "SHARE MARKET INVESTMENT",
        "GROWW INVESTMENT",
        "ZERODHA BROKERAGE",
        "PPFAS MUTUAL FUND",
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
        "STIPEND CREDIT",
        "DIVIDEND CREDIT",
        "RENTAL INCOME",
    ],

    "Transfer": [
        "UPI TRANSFER",
        "MONEY TRANSFER",
        "SENT TO FRIEND",
        "PAID TO FRIEND",
        "NEFT TRANSFER",
        "IMPS TRANSFER",
        "BANK TRANSFER",
        "ACCOUNT TRANSFER",
        "SELF TRANSFER",
        "TRANSFER TO SAVINGS",
        "PERSONAL TRANSFER",
        "FAMILY TRANSFER",
        "SENT MONEY",
        "SHARED BILL SPLIT",
        "SPLIT PAYMENT",
    ],

    "Lifestyle": [
        "SALON PAYMENT",
        "HAIRCUT PAYMENT",
        "SPA TREATMENT",
        "BEAUTY SALON",
        "PARLOUR PAYMENT",
        "GROOMING EXPENSE",
        "DRY CLEANING",
        "LAUNDRY PAYMENT",
        "TAILORING CHARGES",
        "PET SHOP PURCHASE",
        "FLOWER DELIVERY",
        "GIFT PURCHASE",
        "BIRTHDAY GIFT",
        "PERSONAL CARE ITEMS",
        "COSMETICS PURCHASE",
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