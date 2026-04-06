"""
Audit log routes — retrieve consent and data-access audit history.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.ocen import AuditLogEntry
from app.services.auth_service import get_current_user
from app.services.audit_log_service import AuditLogService

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])


@router.get("", response_model=List[AuditLogEntry])
def list_audit_logs(
    resource_type: Optional[str] = Query(None, description="Filter by resource type (e.g. 'consent', 'loan')"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve consent and data-access audit logs.
    Borrowers see only their own logs; lenders see all logs.
    """
    user_id = str(current_user.id) if current_user.role == "borrower" else None
    logs = AuditLogService.get_logs(
        db,
        user_id=user_id,
        resource_type=resource_type,
        limit=limit,
        offset=offset,
    )
    return [AuditLogEntry(**entry) for entry in logs]
