"""
LoanComparisonService — generate side-by-side loan scenarios and recommend
the best option based on total cost, EMI burden, and interest paid.
"""
from __future__ import annotations

import logging
from typing import Optional

from app.services.emi_service import EMIService

logger = logging.getLogger(__name__)


class LoanComparisonService:
    """Stateless comparison engine."""

    @staticmethod
    def compare(
        principal: float,
        approved_rate: float,
        tenure_months: int,
        sector: str = "commerce",
        risk_score: Optional[int] = None,
    ) -> dict:
        """
        Build a comparison table across three rate/tenure scenarios.

        Returns a chart-friendly dict:
        {
            "approved_offer": {...},
            "alternatives": [{...}, {...}],
            "recommendation": str,
            "summary_chart": [{"label": str, "emi": float, "total_interest": float, "total_cost": float}],
        }
        """
        approved = LoanComparisonService._build_scenario(
            label="Your Offer",
            principal=principal,
            rate=approved_rate,
            tenure=tenure_months,
            is_approved=True,
        )

        # Alternative 1: shorter tenure (+2pp rate, −6 months)
        alt_tenure = max(3, tenure_months - 6)
        alt1_rate = round(approved_rate + 2.0, 4)
        alt1 = LoanComparisonService._build_scenario(
            label="Shorter Tenure",
            principal=principal,
            rate=alt1_rate,
            tenure=alt_tenure,
        )

        # Alternative 2: longer tenure (−1pp rate, +12 months)
        alt2_rate = max(6.0, round(approved_rate - 1.0, 4))
        alt2_tenure = tenure_months + 12
        alt2 = LoanComparisonService._build_scenario(
            label="Longer Tenure",
            principal=principal,
            rate=alt2_rate,
            tenure=alt2_tenure,
        )

        scenarios = [approved, alt1, alt2]

        # Recommend by lowest total_cost
        best = min(scenarios, key=lambda s: s["total_cost"])
        if best["label"] == "Your Offer":
            recommendation = (
                "Your approved offer provides the best overall value. "
                "It balances EMI affordability with total interest cost."
            )
        else:
            recommendation = (
                f"The '{best['label']}' option minimises total repayment cost "
                f"(saving ₹{approved['total_cost'] - best['total_cost']:,.0f} over the loan term). "
                f"Consider discussing this with your lender."
            )

        return {
            "approved_offer": approved,
            "alternatives": [alt1, alt2],
            "recommendation": recommendation,
            "best_value_label": best["label"],
            "summary_chart": [
                {
                    "label": s["label"],
                    "emi": s["emi_amount"],
                    "total_interest": s["total_interest"],
                    "total_cost": s["total_cost"],
                    "tenure_months": s["tenure_months"],
                    "rate": s["interest_rate"],
                }
                for s in scenarios
            ],
        }

    @staticmethod
    def _build_scenario(
        label: str,
        principal: float,
        rate: float,
        tenure: int,
        is_approved: bool = False,
    ) -> dict:
        emi = EMIService.calculate_emi(principal, rate, tenure)
        total_paid = round(emi * tenure, 2)
        total_interest = round(total_paid - principal, 2)
        return {
            "label": label,
            "principal": principal,
            "interest_rate": rate,
            "tenure_months": tenure,
            "emi_amount": emi,
            "total_interest": total_interest,
            "total_cost": total_paid,
            "is_approved_offer": is_approved,
        }

    @staticmethod
    def early_repayment_options(
        remaining_principal: float,
        current_rate: float,
        remaining_months: int,
    ) -> dict:
        """
        Calculate savings from making an early lump-sum payment.

        Returns options for 10%, 25%, and 50% pre-payment.
        """
        options = []
        for pct in (10, 25, 50):
            prepay = round(remaining_principal * pct / 100, 2)
            new_principal = remaining_principal - prepay
            if new_principal <= 0:
                new_emi = 0.0
                new_total = 0.0
                interest_saved = round(
                    EMIService.calculate_emi(remaining_principal, current_rate, remaining_months) * remaining_months
                    - remaining_principal,
                    2,
                )
            else:
                old_total = round(
                    EMIService.calculate_emi(remaining_principal, current_rate, remaining_months) * remaining_months,
                    2,
                )
                new_emi = EMIService.calculate_emi(new_principal, current_rate, remaining_months)
                new_total = round(new_emi * remaining_months, 2)
                interest_saved = round(old_total - new_total - prepay, 2)

            options.append({
                "prepayment_percent": pct,
                "prepayment_amount": prepay,
                "new_emi": new_emi,
                "interest_saved": max(0.0, interest_saved),
            })

        return {
            "remaining_principal": remaining_principal,
            "current_rate": current_rate,
            "remaining_months": remaining_months,
            "options": options,
            "recommendation": (
                "Making a pre-payment reduces your outstanding principal, "
                "lowering both your EMI burden and total interest paid."
            ),
        }
