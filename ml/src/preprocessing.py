import re


def clean_text(text: str) -> str:
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()

    return text


if __name__ == "__main__":
    examples = [
        "UPI Payment to SWIGGY!!!",
        "Amazon-Headphones @ ₹1,299",
        "  Netflix    Subscription  ",
    ]

    for example in examples:
        print("Original :", example)
        print("Cleaned  :", clean_text(example))
        print()