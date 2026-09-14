from typing import List, Dict, Any

from .schemas import FinancialMetric


class FinancialValidator:
    """
    Validates extracted financial metrics and
    returns any detected validation issues.
    """

    @staticmethod
    def validate_metric(metric: FinancialMetric) -> List[str]:
        """
        Validate a single financial metric.
        """

        errors = []

        # Metric must have a name
        if not metric.name or not metric.name.strip():
            errors.append("Metric name is missing.")

        # Value validation
        if metric.value is None:
            errors.append(f"{metric.name}: value is missing.")

        elif not isinstance(metric.value, (int, float)):
            errors.append(f"{metric.name}: value must be numeric.")

        # Confidence validation
        if metric.confidence < 0 or metric.confidence > 1:
            errors.append(
                f"{metric.name}: confidence must be between 0 and 1."
            )

        return errors

    @classmethod
    def validate_metrics(
        cls,
        metrics: List[FinancialMetric]
    ) -> Dict[str, Any]:
        """
        Validate multiple financial metrics.
        """

        all_errors = []

        for metric in metrics:
            errors = cls.validate_metric(metric)

            if errors:
                all_errors.extend(errors)

        return {
            "valid": len(all_errors) == 0,
            "errors": all_errors,
            "total_metrics": len(metrics),
            "invalid_metrics": len(all_errors),
        }