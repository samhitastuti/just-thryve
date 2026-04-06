"""
Dashboard routes for lender and borrower analytics.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import LenderDashboardResponse, BorrowerDashboardResponse
from app.services.auth_service import get_current_user, require_role
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/lender", response_model=LenderDashboardResponse)
def lender_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("lender")),
):
    """
    Platform-wide lending analytics for lender users.
    Returns totals, default rate, risk distribution, and a monthly
    disbursement time-series suitable for charting.
    """
    data = DashboardService.lender_summary(db)
    return LenderDashboardResponse(
        total_loans=data["total_loans"],
        total_disbursed_amount=data["total_disbursed_amount"],
        active_loans=data["active_loans"],
        closed_loans=data["closed_loans"],
        default_rate=data["default_rate"],
        risk_distribution=data["risk_distribution"],
        monthly_disbursements=data["monthly_disbursements"],
        avg_interest_rate=data["avg_interest_rate"],
    )


@router.get("/borrower", response_model=BorrowerDashboardResponse)
def borrower_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("borrower")),
):
    """
    Per-borrower loan health dashboard.
    Returns active loan summary, credit score trend, payment history,
    next EMI due, and personalised improvement tips.
    """
    data = DashboardService.borrower_summary(db, str(current_user.id))
    return BorrowerDashboardResponse(**data)
