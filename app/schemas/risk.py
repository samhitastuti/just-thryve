"""Schemas for risk profile, explanation, and dynamic rate responses."""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class RiskFactor(BaseModel):
    feature: str
    label: str
    shap_value: float
    impact: str  # "positive" | "negative"
    explanation: str


class RiskExplanationResponse(BaseModel):
    loan_id: str
    summary: str
    risk_gauge: int         # 0–100
    risk_category: str      # low | medium | high
    rate_rationale: str
    interest_rate: float
    key_factors: List[RiskFactor]
    improvement_tips: List[str]
    created_at: Optional[datetime] = None


class DynamicRateResponse(BaseModel):
    loan_id: str
    risk_category: str
    risk_score: int         # 0–100
    base_rate: float
    sector_adjustment: float
    tenure_adjustment: float
    amount_adjustment: float
    final_rate: float
