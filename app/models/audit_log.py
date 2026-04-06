"""
AuditLog model — tracks consent and data-access events for compliance.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)          # e.g. "consent_granted", "data_accessed"
    resource_type = Column(String, nullable=False)   # e.g. "consent", "loan", "offer"
    resource_id = Column(String, nullable=True)      # UUID of the resource
    metadata_ = Column("metadata", JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")
