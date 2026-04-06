"""
DashboardService — aggregate analytics for lender and borrower dashboards.

All queries operate on a synchronous SQLAlchemy Session (same pattern as
the rest of the codebase).  Results are chart-friendly (time-series lists,
distributions dicts, etc.).
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class DashboardService:
    """Stateless analytics service — all methods accept a db Session."""

    # ------------------------------------------------------------------
    # Lender dashboard
    # ------------------------------------------------------------------

    @staticmethod
    def lender_summary(db: Session) -> dict[str, Any]:
        """
        Aggregate platform-wide lending metrics.

        Returns
        -------
        {
            "total_loans": int,
            "total_disbursed_amount": float,
            "active_loans": int,
            "closed_loans": int,
            "default_rate": float,            # % of loans that are overdue
            "risk_distribution": {low, medium, high},
            "monthly_disbursements": [...],   # time-series for chart
            "avg_interest_rate": float,
        }
        """
        from app.models.loan import Loan
        from app.models.risk_profile import RiskProfile

        all_loans = db.query(Loan).all()
        total = len(all_loans)

        disbursed = [l for l in all_loans if l.status in ("disbursed", "active", "closed")]
        active = [l for l in all_loans if l.status in ("disbursed", "active")]
        closed = [l for l in all_loans if l.status == "closed"]

        total_amount = sum(float(l.approved_amount or l.amount_requested) for l in disbursed)

        # Default rate: loans still active > 90 days after disbursement
        now = datetime.utcnow()
        overdue = [
            l for l in active
            if l.disbursed_at and (now - l.disbursed_at).days > 90
        ]
        default_rate = round(len(overdue) / max(len(disbursed), 1) * 100, 2)

        # Risk distribution from RiskProfile table
        risk_profiles = db.query(RiskProfile).all()
        risk_dist = {"low": 0, "medium": 0, "high": 0}
        for rp in risk_profiles:
            risk_dist[rp.risk_category] = risk_dist.get(rp.risk_category, 0) + 1

        # Average interest rate
        rates = [float(l.approved_rate) for l in disbursed if l.approved_rate]
        avg_rate = round(sum(rates) / max(len(rates), 1), 4)

        # Monthly disbursements for the last 6 months (chart data)
        monthly = DashboardService._monthly_disbursements(disbursed, months=6)

        return {
            "total_loans": total,
            "total_disbursed_amount": round(total_amount, 2),
            "active_loans": len(active),
            "closed_loans": len(closed),
            "default_rate": default_rate,
            "risk_distribution": risk_dist,
            "monthly_disbursements": monthly,
            "avg_interest_rate": avg_rate,
        }

    @staticmethod
    def _monthly_disbursements(disbursed_loans: list, months: int = 6) -> list[dict]:
        """Build month-by-month disbursement chart data."""
        now = datetime.utcnow()
        result = []
        for i in range(months - 1, -1, -1):
            month_start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            loans_in_month = [
                l for l in disbursed_loans
                if l.disbursed_at and month_start <= l.disbursed_at < month_end
            ]
            result.append({
                "month": month_start.strftime("%Y-%m"),
                "count": len(loans_in_month),
                "amount": round(sum(float(l.approved_amount or l.amount_requested) for l in loans_in_month), 2),
            })
        return result

    # ------------------------------------------------------------------
    # Borrower dashboard
    # ------------------------------------------------------------------

    @staticmethod
    def borrower_summary(db: Session, user_id: str) -> dict[str, Any]:
        """
        Per-borrower loan health and payment analytics.

        Returns
        -------
        {
            "total_loans": int,
            "active_loan": {...} | None,
            "credit_score_trend": [...],      # time-series risk scores
            "payment_history": [...],         # installment payment chart
            "credit_improvement_tips": [...],
            "next_emi_due": {...} | None,
        }
        """
        from app.models.loan import Loan
        from app.models.repayment_schedule import RepaymentSchedule
        from app.models.risk_profile import RiskProfile

        loans = db.query(Loan).filter(Loan.borrower_id == user_id).all()
        active_loans = [l for l in loans if l.status in ("disbursed", "active")]
        active_loan_data = None
        next_emi = None

        if active_loans:
            loan = active_loans[0]
            active_loan_data = {
                "loan_id": str(loan.id),
                "amount": float(loan.approved_amount or loan.amount_requested),
                "emi_amount": float(loan.emi_amount or 0),
                "status": loan.status,
                "disbursed_at": loan.disbursed_at.isoformat() if loan.disbursed_at else None,
            }
            # Next pending EMI
            next_installment = (
                db.query(RepaymentSchedule)
                .filter(
                    RepaymentSchedule.loan_id == loan.id,
                    RepaymentSchedule.status == "pending",
                )
                .order_by(RepaymentSchedule.installment_number)
                .first()
            )
            if next_installment:
                next_emi = {
                    "installment_number": next_installment.installment_number,
                    "due_date": next_installment.due_date.isoformat() if next_installment.due_date else None,
                    "emi_amount": float(next_installment.emi_amount),
                    "status": next_installment.status,
                }

        # Credit score trend (from risk profiles on all loans)
        risk_profiles = (
            db.query(RiskProfile)
            .join(Loan, Loan.id == RiskProfile.loan_id)
            .filter(Loan.borrower_id == user_id)
            .order_by(RiskProfile.created_at)
            .all()
        )
        credit_trend = [
            {
                "date": rp.created_at.strftime("%Y-%m-%d"),
                "risk_score": rp.risk_score,
                "risk_category": rp.risk_category,
            }
            for rp in risk_profiles
        ]

        # Payment history for the most recent active/closed loan
        payment_history: list[dict] = []
        if loans:
            recent_loan = sorted(loans, key=lambda l: l.created_at, reverse=True)[0]
            schedules = (
                db.query(RepaymentSchedule)
                .filter(RepaymentSchedule.loan_id == recent_loan.id)
                .order_by(RepaymentSchedule.installment_number)
                .all()
            )
            payment_history = [
                {
                    "installment_number": s.installment_number,
                    "due_date": s.due_date.isoformat() if s.due_date else None,
                    "status": s.status,
                    "paid_on": s.paid_on.isoformat() if s.paid_on else None,
                    "emi_amount": float(s.emi_amount),
                }
                for s in schedules
            ]

        tips = DashboardService._credit_improvement_tips(loans, risk_profiles)

        return {
            "total_loans": len(loans),
            "active_loan": active_loan_data,
            "credit_score_trend": credit_trend,
            "payment_history": payment_history,
            "next_emi_due": next_emi,
            "credit_improvement_tips": tips,
        }

    @staticmethod
    def _credit_improvement_tips(loans: list, risk_profiles: list) -> list[str]:
        tips = []
        if not loans:
            tips.append("Apply for your first loan to start building a credit profile on the GreenFlowCredit network.")
            return tips

        latest_rp = risk_profiles[-1] if risk_profiles else None
        if latest_rp:
            if latest_rp.risk_category == "high":
                tips.append("Your current risk profile is high. Focus on revenue growth and regulatory compliance.")
            elif latest_rp.risk_category == "medium":
                tips.append("You are in the medium-risk tier. Consistent on-time payments will improve your score.")

        closed_loans = [l for l in loans if l.status == "closed"]
        if closed_loans:
            tips.append(f"You have successfully repaid {len(closed_loans)} loan(s). This track record helps future applications.")

        tips.append("File GST returns on time and maintain compliant books to continuously improve your credit score.")
        tips.append("Increase your renewable energy mix to gain ESG credit bonuses on future loan assessments.")
        return tips
