"""Schemas for lender and borrower dashboard responses."""
from typing import Optional, List, Any
from pydantic import BaseModel


class MonthlyDisbursement(BaseModel):
    month: str
    count: int
    amount: float


class RiskDistribution(BaseModel):
    low: int
    medium: int
    high: int


class LenderDashboardResponse(BaseModel):
    total_loans: int
    total_disbursed_amount: float
    active_loans: int
    closed_loans: int
    default_rate: float
    risk_distribution: RiskDistribution
    monthly_disbursements: List[MonthlyDisbursement]
    avg_interest_rate: float


class ActiveLoanSummary(BaseModel):
    loan_id: str
    amount: float
    emi_amount: float
    status: str
    disbursed_at: Optional[str] = None


class NextEMI(BaseModel):
    installment_number: int
    due_date: Optional[str]
    emi_amount: float
    status: str


class CreditScorePoint(BaseModel):
    date: str
    risk_score: int
    risk_category: str


class PaymentHistoryItem(BaseModel):
    installment_number: int
    due_date: Optional[str]
    status: str
    paid_on: Optional[str]
    emi_amount: float


class BorrowerDashboardResponse(BaseModel):
    total_loans: int
    active_loan: Optional[ActiveLoanSummary] = None
    credit_score_trend: List[CreditScorePoint]
    payment_history: List[PaymentHistoryItem]
    next_emi_due: Optional[NextEMI] = None
    credit_improvement_tips: List[str]
