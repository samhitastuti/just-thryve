"""
RiskProfile model — stores computed risk category and score breakdown for a loan.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    loan_id = Column(UUID(as_uuid=True), ForeignKey("loans.id"), nullable=False, unique=True)
    risk_category = Column(
        SAEnum("low", "medium", "high", name="risk_category_enum"),
        nullable=False,
    )
    risk_score = Column(Integer, nullable=False)          # 0–100 gauge value
    interest_rate = Column(Numeric(6, 4), nullable=False)  # dynamic rate in % p.a.
    feature_scores = Column(JSONB, nullable=True)          # per-feature contribution
    explanation_text = Column(String, nullable=True)       # natural-language summary
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    loan = relationship("Loan", back_populates="risk_profile")
