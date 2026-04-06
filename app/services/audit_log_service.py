"""
AuditLogService — record and retrieve consent/data-access audit events.
"""
from __future__ import annotations

import logging
from typing import Any, Optional

from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class AuditLogService:
    """Stateless service for writing and reading AuditLog rows."""

    @staticmethod
    def log(
        db: Session,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Write a single audit log entry.

        Parameters
        ----------
        db:            Active SQLAlchemy session.
        action:        Short verb, e.g. "consent_granted", "loan_submitted", "data_accessed".
        resource_type: Entity type, e.g. "consent", "loan".
        resource_id:   UUID string of the entity (optional).
        user_id:       UUID string of the acting user (optional).
        metadata:      Additional context as a dict (stored as JSONB).
        """
        from app.models.audit_log import AuditLog

        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_=metadata or {},
        )
        db.add(entry)
        # Flush so the entry gets an ID, but leave the transaction open
        # (the caller is responsible for commit)
        db.flush()
        logger.debug("AuditLog: %s on %s/%s by user=%s", action, resource_type, resource_id, user_id)

    @staticmethod
    def get_logs(
        db: Session,
        user_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """
        Retrieve audit log entries with optional filters.

        Parameters
        ----------
        user_id:       Filter to a specific actor (optional).
        resource_type: Filter to a resource type (optional).
        limit:         Maximum number of rows to return.
        offset:        Pagination offset.
        """
        from app.models.audit_log import AuditLog

        query = db.query(AuditLog)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)

        rows = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
        return [
            {
                "id": str(row.id),
                "user_id": str(row.user_id) if row.user_id else None,
                "action": row.action,
                "resource_type": row.resource_type,
                "resource_id": row.resource_id,
                "metadata": row.metadata_,
                "created_at": row.created_at.isoformat(),
            }
            for row in rows
        ]
