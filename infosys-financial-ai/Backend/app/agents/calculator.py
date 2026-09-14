from typing import Optional, Dict


class FinancialCalculator:
    """
    Performs deterministic financial calculations
    using extracted financial metrics.
    """

    @staticmethod
    def safe_divide(
        numerator: Optional[float],
        denominator: Optional[float]
    ) -> Optional[float]:
        """
        Safely divide two values.
        Returns None if calculation is not possible.
        """

        if numerator is None or denominator is None:
            return None

        if denominator == 0:
            return None

        return numerator / denominator

    @classmethod
    def calculate_ratios(
        cls,
        metrics: Dict[str, Optional[float]]
    ) -> Dict[str, Optional[float]]:
        """
        Calculate financial ratios from extracted metrics.

        Expected possible metrics:
        revenue
        gross_profit
        operating_income
        net_income
        total_assets
        total_liabilities
        total_equity
        current_assets
        current_liabilities
        total_debt
        operating_cash_flow
        capital_expenditure
        """

        revenue = metrics.get("revenue")
        gross_profit = metrics.get("gross_profit")
        operating_income = metrics.get("operating_income")
        net_income = metrics.get("net_income")

        current_assets = metrics.get("current_assets")
        current_liabilities = metrics.get("current_liabilities")

        total_debt = metrics.get("total_debt")
        total_equity = metrics.get("total_equity")

        operating_cash_flow = metrics.get("operating_cash_flow")
        capital_expenditure = metrics.get("capital_expenditure")

        return {
            "gross_margin": (
                cls.safe_divide(gross_profit, revenue) * 100
                if cls.safe_divide(gross_profit, revenue) is not None
                else None
            ),

            "operating_margin": (
                cls.safe_divide(operating_income, revenue) * 100
                if cls.safe_divide(operating_income, revenue) is not None
                else None
            ),

            "net_profit_margin": (
                cls.safe_divide(net_income, revenue) * 100
                if cls.safe_divide(net_income, revenue) is not None
                else None
            ),

            "current_ratio":
                cls.safe_divide(current_assets, current_liabilities),

            "debt_to_equity":
                cls.safe_divide(total_debt, total_equity),

            "free_cash_flow": (
                operating_cash_flow - capital_expenditure
                if operating_cash_flow is not None
                and capital_expenditure is not None
                else None
            ),
        }