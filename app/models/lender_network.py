"""
LenderNetwork model — OCEN simulation nodes used for broadcast simulation.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base


class LenderNetwork(Base):
    __tablename__ = "lender_network"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    node_type = Column(String, nullable=False)            # "bank", "nbfc", "p2p"
    is_active = Column(Boolean, default=True, nullable=False)
    capacity_remaining = Column(Numeric(18, 2), nullable=True)  # max disbursable amount
    min_interest_rate = Column(Numeric(6, 4), nullable=True)
    max_interest_rate = Column(Numeric(6, 4), nullable=True)
    sector_preferences = Column(JSONB, nullable=True)     # list of preferred sectors
    min_risk_score = Column(Integer, nullable=True)       # 0-100 minimum accepted score
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
