"""
DynamicRateService — compute interest rates based on risk profile.

Risk categories and base rates:
  - low:    risk_score 70-100 → base rate 10% p.a.
  - medium: risk_score 40-69  → base rate 14% p.a.
  - high:   risk_score  0-39  → base rate 18% p.a.

Additional adjustments:
  - Sector premium (renewable_energy: -1%, agriculture: 0%, commerce: +1%)
  - Tenure premium (> 24 months: +0.5%)
  - Amount premium (> 1Cr: +0.5%)
"""
from __future__ import annotations

import logging
from typing import TypedDict

logger = logging.getLogger(__name__)

# Base interest rates per risk tier (% p.a.)
_TIER_RATES: dict[str, float] = {
    "low": 10.0,
    "medium": 14.0,
    "high": 18.0,
}

# Sector adjustments (percentage points)
_SECTOR_ADJUSTMENT: dict[str, float] = {
    "renewable_energy": -1.0,
    "agriculture": 0.0,
    "commerce": 1.0,
}


class RateBreakdown(TypedDict):
    base_rate: float
    sector_adjustment: float
    tenure_adjustment: float
    amount_adjustment: float
    final_rate: float
    risk_category: str
    risk_score: int  # 0–100


class DynamicRateService:
    """Stateless service — all methods are static."""

    @staticmethod
    def get_risk_category(risk_score_0_to_100: int) -> str:
        """Map a 0–100 risk score to low/medium/high."""
        if risk_score_0_to_100 >= 70:
            return "low"
        if risk_score_0_to_100 >= 40:
            return "medium"
        return "high"

    @staticmethod
    def calculate_rate(
        risk_score_0_to_1000: int,
        loan_amount: float,
        tenure_months: int,
        sector: str = "commerce",
    ) -> RateBreakdown:
        """
        Compute the dynamic interest rate for a loan.

        Parameters
        ----------
        risk_score_0_to_1000:
            The raw ML risk score (0–1000 as stored on the Loan model).
        loan_amount:
            Loan principal in INR.
        tenure_months:
            Repayment period in months.
        sector:
            Business sector of the borrower.

        Returns
        -------
        RateBreakdown dict with all components and the final rate.
        """
        # Normalise to 0–100 scale
        score_100 = min(100, max(0, risk_score_0_to_1000 // 10))
        category = DynamicRateService.get_risk_category(score_100)
        base_rate = _TIER_RATES[category]

        sector_adj = _SECTOR_ADJUSTMENT.get(sector, 0.0)
        tenure_adj = 0.5 if tenure_months > 24 else 0.0
        amount_adj = 0.5 if loan_amount > 10_000_000 else 0.0  # > 1 Cr

        final_rate = round(base_rate + sector_adj + tenure_adj + amount_adj, 4)

        logger.debug(
            "DynamicRate: score=%d → %s, rate=%.2f%%",
            score_100,
            category,
            final_rate,
        )
        return RateBreakdown(
            base_rate=base_rate,
            sector_adjustment=sector_adj,
            tenure_adjustment=tenure_adj,
            amount_adjustment=amount_adj,
            final_rate=final_rate,
            risk_category=category,
            risk_score=score_100,
        )
