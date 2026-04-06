"""
RiskExplanationService — translate SHAP values and risk data into
natural-language explanations that borrowers can understand.
"""
from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Human-readable labels for feature names
_FEATURE_LABELS: dict[str, str] = {
    "gst_revenue_3m_avg": "Average GST Revenue (3 months)",
    "gst_revenue_growth_rate": "Revenue Growth Rate",
    "gst_revenue_volatility": "Revenue Volatility",
    "renewable_energy_mix": "Renewable Energy Mix",
    "carbon_emissions_per_revenue": "Carbon Emissions per Revenue",
    "compliance_status": "Regulatory Compliance Status",
    "loan_amount_requested": "Loan Amount",
    "tenure_months": "Loan Tenure",
    "emi_to_revenue_ratio": "EMI-to-Revenue Ratio",
    "sector_type": "Business Sector",
}

# Templates for positive and negative contributions
_POSITIVE_TEMPLATES: dict[str, str] = {
    "gst_revenue_3m_avg": "Strong average revenue of ₹{value:.0f} demonstrates repayment capacity.",
    "gst_revenue_growth_rate": "Revenue is growing ({value:.1f}%), indicating a healthy business trajectory.",
    "renewable_energy_mix": "High renewable energy adoption ({value:.0f}%) reflects ESG commitment, reducing risk.",
    "compliance_status": "Compliant regulatory status builds lender confidence.",
    "emi_to_revenue_ratio": "EMI payments are well within affordable range relative to revenue.",
}

_NEGATIVE_TEMPLATES: dict[str, str] = {
    "gst_revenue_3m_avg": "Low average revenue raises concerns about repayment capacity.",
    "gst_revenue_growth_rate": "Revenue is declining ({value:.1f}%), which increases credit risk.",
    "gst_revenue_volatility": "High revenue volatility makes cash-flow prediction difficult.",
    "carbon_emissions_per_revenue": "Elevated carbon emissions per revenue unit is an ESG risk factor.",
    "compliance_status": "Pending or non-compliant status negatively impacts the credit assessment.",
    "emi_to_revenue_ratio": "EMI burden is high relative to revenue, reducing repayment confidence.",
    "loan_amount_requested": "Large loan amount relative to revenue increases exposure.",
}


class RiskExplanationService:
    """Stateless service that converts model outputs to human-readable explanations."""

    @staticmethod
    def build_explanation(
        shap_values: Optional[dict],
        risk_score: int,
        risk_category: str,
        interest_rate: float,
        input_features: Optional[dict] = None,
    ) -> dict:
        """
        Build a structured explanation object.

        Returns
        -------
        {
            "summary": str,
            "risk_gauge": int (0-100),
            "rate_rationale": str,
            "key_factors": [{"feature": str, "label": str, "impact": "positive"/"negative", "explanation": str}],
            "improvement_tips": [str],
        }
        """
        gauge = min(100, max(0, risk_score // 10))
        summary = RiskExplanationService._build_summary(risk_category, gauge, interest_rate)
        key_factors = RiskExplanationService._build_key_factors(shap_values, input_features)
        tips = RiskExplanationService._build_improvement_tips(risk_category, shap_values, input_features)
        rate_rationale = RiskExplanationService._build_rate_rationale(risk_category, interest_rate)

        return {
            "summary": summary,
            "risk_gauge": gauge,
            "risk_category": risk_category,
            "rate_rationale": rate_rationale,
            "key_factors": key_factors,
            "improvement_tips": tips,
        }

    @staticmethod
    def _build_summary(risk_category: str, gauge: int, interest_rate: float) -> str:
        category_label = {
            "low": "Low Risk",
            "medium": "Medium Risk",
            "high": "High Risk",
        }.get(risk_category, "Unknown")
        return (
            f"Your loan application has been assessed as {category_label} "
            f"(score: {gauge}/100). Based on this profile, the applicable interest "
            f"rate is {interest_rate:.2f}% per annum."
        )

    @staticmethod
    def _build_rate_rationale(risk_category: str, interest_rate: float) -> str:
        rationales = {
            "low": (
                f"As a low-risk borrower, you qualify for our preferential rate of "
                f"{interest_rate:.2f}% p.a. This rate reflects your strong financial "
                f"health and ESG compliance."
            ),
            "medium": (
                f"Your medium-risk profile attracts a rate of {interest_rate:.2f}% p.a. "
                f"Improving revenue consistency and ESG metrics could qualify you for "
                f"a lower rate in future applications."
            ),
            "high": (
                f"The higher rate of {interest_rate:.2f}% p.a. reflects elevated credit "
                f"risk. Strengthening your revenue base and achieving regulatory "
                f"compliance would significantly improve your rate."
            ),
        }
        return rationales.get(risk_category, f"Rate: {interest_rate:.2f}% p.a.")

    @staticmethod
    def _build_key_factors(
        shap_values: Optional[dict],
        input_features: Optional[dict],
    ) -> list[dict]:
        if not shap_values:
            return []

        factors = []
        # Sort by absolute SHAP value (most impactful first)
        sorted_features = sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True)
        for feature, shap_val in sorted_features[:5]:  # top-5 drivers
            label = _FEATURE_LABELS.get(feature, feature)
            impact = "positive" if shap_val > 0 else "negative"
            feature_value = (input_features or {}).get(feature, 0)

            if impact == "positive" and feature in _POSITIVE_TEMPLATES:
                try:
                    explanation = _POSITIVE_TEMPLATES[feature].format(value=float(feature_value))
                except (ValueError, TypeError):
                    explanation = _POSITIVE_TEMPLATES[feature].format(value=feature_value)
            elif impact == "negative" and feature in _NEGATIVE_TEMPLATES:
                try:
                    explanation = _NEGATIVE_TEMPLATES[feature].format(value=float(feature_value))
                except (ValueError, TypeError):
                    explanation = _NEGATIVE_TEMPLATES[feature].format(value=feature_value)
            else:
                explanation = f"{label} had a {'positive' if shap_val > 0 else 'negative'} impact on your score."

            factors.append({
                "feature": feature,
                "label": label,
                "shap_value": round(shap_val, 4),
                "impact": impact,
                "explanation": explanation,
            })
        return factors

    @staticmethod
    def _build_improvement_tips(
        risk_category: str,
        shap_values: Optional[dict],
        input_features: Optional[dict],
    ) -> list[str]:
        tips = []
        features = input_features or {}
        shap = shap_values or {}

        # Revenue-based tips
        if shap.get("gst_revenue_3m_avg", 0) < 0 or float(features.get("gst_revenue_3m_avg", 1)) < 100_000:
            tips.append("Increase your average GST-filed revenue over the next 3 months to demonstrate stronger repayment capacity.")

        # Compliance tip
        if features.get("compliance_status", "pending") != "compliant":
            tips.append("Achieve full regulatory compliance to unlock better interest rates.")

        # Renewable energy tip
        if float(features.get("renewable_energy_mix", 0)) < 30:
            tips.append("Increase your renewable energy adoption to above 30% for an ESG credit boost.")

        # Revenue volatility tip
        if float(features.get("gst_revenue_volatility", 0)) > 20:
            tips.append("Stabilise your revenue streams to reduce volatility, which directly lowers perceived credit risk.")

        # EMI ratio tip
        if float(features.get("emi_to_revenue_ratio", 0)) > 0.5:
            tips.append("Consider a smaller loan amount or longer tenure to bring the EMI-to-revenue ratio below 50%.")

        if not tips:
            tips.append("Maintain your current financial health to preserve your excellent credit profile.")

        return tips
