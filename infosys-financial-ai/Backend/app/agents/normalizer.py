import re
from typing import Optional, Tuple


class FinancialValueNormalizer:
    """
    Converts financial values from document text
    into normalized numeric values.
    """

    MULTIPLIERS = {
        "thousand": 1_000,
        "k": 1_000,

        "million": 1_000_000,
        "mn": 1_000_000,
        "m": 1_000_000,

        "billion": 1_000_000_000,
        "bn": 1_000_000_000,
        "b": 1_000_000_000,

        "crore": 10_000_000,
        "cr": 10_000_000,

        "lakh": 100_000,
        "lac": 100_000,
    }

    @staticmethod
    def normalize(value: Optional[str]) -> Tuple[Optional[float], Optional[str], Optional[str]]:
        """
        Convert a financial string into:

        normalized_value
        currency
        unit
        """

        if value is None:
            return None, None, None

        original = str(value).strip()

        if not original:
            return None, None, None

        text = original.lower()

        # Detect currency
        currency = None

        if "$" in original or "usd" in text:
            currency = "USD"

        elif "₹" in original or "inr" in text or "rs" in text:
            currency = "INR"

        elif "€" in original or "eur" in text:
            currency = "EUR"

        elif "£" in original or "gbp" in text:
            currency = "GBP"

        # Detect negative values such as (200)
        negative = False

        if re.search(r"\(\s*[\d,.]+\s*\)", original):
            negative = True

        # Remove currency symbols
        cleaned = re.sub(r"[$₹€£]", "", text)

        # Find the unit
        unit = None
        multiplier = 1

        for unit_name, unit_multiplier in FinancialValueNormalizer.MULTIPLIERS.items():
            if re.search(rf"\b{re.escape(unit_name)}\b", cleaned):
                unit = unit_name
                multiplier = unit_multiplier
                break

        # Extract numeric value
        match = re.search(r"-?[\d,]+(?:\.\d+)?", cleaned)

        if not match:
            return None, currency, unit

        number_str = match.group().replace(",", "")

        try:
            number = float(number_str)
        except ValueError:
            return None, currency, unit

        if negative:
            number = -abs(number)

        normalized_value = number * multiplier

        return normalized_value, currency, unit