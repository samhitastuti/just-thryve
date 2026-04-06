"""
OCEN simulation routes — network status, broadcast, and lender discovery.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.loan import Loan
from app.models.user import User
from app.models.business_profile import BusinessProfile
from app.schemas.ocen import NetworkStatusResponse, BroadcastResponse, LenderDiscoveryItem
from app.services.auth_service import get_current_user
from app.services.ocen_simulation_service import OCENSimulationService

router = APIRouter(prefix="/ocen", tags=["ocen"])


@router.get("/network-status", response_model=NetworkStatusResponse)
def network_status(
    current_user: User = Depends(get_current_user),
):
    """
    Return the current status of the OCEN lender node network.
    Shows active/inactive nodes, node types, and network health.
    """
    data = OCENSimulationService.get_network_status()
    return NetworkStatusResponse(**data)


@router.post("/broadcast/{loan_id}", response_model=BroadcastResponse)
def broadcast_loan(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Simulate broadcasting a loan request to the OCEN network.
    Shows which lender nodes were contacted, which responded, and at what rate.
    """
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    # Borrowers can only broadcast their own loans
    if current_user.role == "borrower" and str(loan.borrower_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Access denied")

    profile = db.query(BusinessProfile).filter(BusinessProfile.user_id == loan.borrower_id).first()
    sector = profile.sector if profile else "commerce"
    risk_score = loan.risk_score or 0

    data = OCENSimulationService.broadcast_loan_request(
        loan_id=loan_id,
        amount=float(loan.amount_requested),
        sector=sector,
        risk_score=risk_score,
        tenure_months=loan.tenure_months,
    )
    return BroadcastResponse(**data)


@router.get("/discover-lenders", response_model=list[LenderDiscoveryItem])
def discover_lenders(
    sector: str = Query("commerce", description="Business sector"),
    risk_score: int = Query(500, ge=0, le=1000, description="ML risk score (0–1000)"),
    amount: float = Query(500000, gt=0, description="Loan amount in INR"),
    current_user: User = Depends(get_current_user),
):
    """
    Discover lender nodes on the OCEN network that match a borrower's profile.
    Returns a ranked list of eligible lenders.
    """
    matches = OCENSimulationService.discover_lenders(sector, risk_score, amount)
    return [LenderDiscoveryItem(**m) for m in matches]
