import re


# --------------------------------------------------
# UPI / payment noise tokens to strip
# --------------------------------------------------
# These appear in real Indian bank SMS and UPI
# notifications but carry no category signal.

_NOISE_PATTERNS = [
    r"\b(upi|neft|imps|rtgs|nach)\b",
    r"\b(txn|trx|trf|ref|refno|rrn)\b",
    r"\b(payment|paid|pay|received|debited|credited)\b",
    r"\b(to|from|for|at|via|on|by|the|of|in|and|or|is|a)\b",
    r"\b(transaction|transfer)\b",
    r"\b(india|pvt|ltd|llp|inc|co)\b",
    r"\b\d{6,}\b",          # long numeric reference IDs
    r"\b\d{2}[/\-]\d{2}\b", # date fragments like 12/05
    r"@[a-z0-9]+",          # UPI handles like @ybl, @paytm
]

_NOISE_RE = re.compile(
    "|".join(_NOISE_PATTERNS),
    re.IGNORECASE,
)


# --------------------------------------------------
# Merchant name normalization
# --------------------------------------------------
# Collapse common spelling variations so TF-IDF
# treats them as the same token.

_MERCHANT_ALIASES = {
    r"\bd[\s\-]?mart\b": "dmart",
    r"\bavenue\s+supermarts?\b": "dmart",
    r"\breliance\s+smart\b": "reliance smart",
    r"\breliance\s+retail\b": "reliance retail",
    r"\breliance\s+digital\b": "reliance digital",
    r"\breliance\s+fresh\b": "reliance fresh",
    r"\bjio\s*mart\b": "jiomart",
    r"\bbig\s*bazaar\b": "bigbazaar",
    r"\bbig\s*basket\b": "bigbasket",
    r"\bcafe\s+coffee\s+day\b": "ccd",
    r"\bccd\b": "ccd",
    r"\bmcdonalds?\b": "mcdonalds",
    r"\bburger\s+king\b": "burgerking",
    r"\bpizza\s+hut\b": "pizzahut",
    r"\bindian\s+oil\b": "indianoil",
    r"\bbharat\s+petroleum\b": "bharatpetroleum",
    r"\bhp\s+petrol\b": "hppetrol",
    r"\bamazon\s+prime\b": "amazonprime",
    r"\bdisney\s*\+?\s*hotstar\b": "hotstar",
    r"\bbook\s*my\s*show\b": "bookmyshow",
    r"\btata\s+play\b": "tataplay",
    r"\bairtel\s+xstream\b": "airtelxstream",
}


def clean_text(text: str) -> str:
    """
    Normalise a transaction description for the
    TF-IDF classifier.

    Steps
    -----
    1. Lowercase
    2. Replace merchant aliases with canonical tokens
    3. Strip non-alphanumeric characters (keeps spaces)
    4. Remove UPI / payment noise tokens
    5. Collapse whitespace
    """

    if not isinstance(text, str):
        return ""

    text = text.lower()

    # Normalise merchant aliases
    for pattern, replacement in _MERCHANT_ALIASES.items():
        text = re.sub(pattern, replacement, text)

    # Strip non-alphanumeric (preserve spaces)
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    # Remove noise tokens
    text = _NOISE_RE.sub(" ", text)

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


if __name__ == "__main__":
    examples = [
        "UPI Payment to SWIGGY!!!",
        "Amazon-Headphones @ ₹1,299",
        "  Netflix    Subscription  ",
        "UPI/DMART MUMBAI/REF:123456789",
        "ZUDIO STORE SURAT",
        "UPI PAYMENT ZUDIO CLOTHING",
        "D-Mart Grocery Purchase TXN",
        "Myntra shoes purchase UPI",
        "Swiggy food order paid via UPI",
        "Uber ride to college REF123456",
        "IRCTC RAILWAY TICKET BOOKING",
        "AVENUE SUPERMARTS LTD MUMBAI",
        "salary credit NEFT from employer",
        "HP PETROL PUMP UPI payment",
    ]

    for example in examples:
        print("Original :", example)
        print("Cleaned  :", clean_text(example))
        print()