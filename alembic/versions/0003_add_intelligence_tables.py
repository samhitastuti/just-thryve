"""Add risk_profiles, audit_logs, and lender_network tables

Revision ID: 0003
Revises: 0002
Create Date: 2024-01-03 00:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- risk_profiles ---
    op.create_table(
        "risk_profiles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("loan_id", UUID(as_uuid=True), sa.ForeignKey("loans.id"), nullable=False, unique=True),
        sa.Column(
            "risk_category",
            sa.Enum("low", "medium", "high", name="risk_category_enum"),
            nullable=False,
        ),
        sa.Column("risk_score", sa.Integer, nullable=False),
        sa.Column("interest_rate", sa.Numeric(6, 4), nullable=False),
        sa.Column("feature_scores", JSONB, nullable=True),
        sa.Column("explanation_text", sa.String, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_risk_profiles_loan_id", "risk_profiles", ["loan_id"])

    # --- audit_logs ---
    op.create_table(
        "audit_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String, nullable=False),
        sa.Column("resource_type", sa.String, nullable=False),
        sa.Column("resource_id", sa.String, nullable=True),
        sa.Column("metadata", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_resource_type", "audit_logs", ["resource_type"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    # --- lender_network ---
    op.create_table(
        "lender_network",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("node_type", sa.String, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, default=True),
        sa.Column("capacity_remaining", sa.Numeric(18, 2), nullable=True),
        sa.Column("min_interest_rate", sa.Numeric(6, 4), nullable=True),
        sa.Column("max_interest_rate", sa.Numeric(6, 4), nullable=True),
        sa.Column("sector_preferences", JSONB, nullable=True),
        sa.Column("min_risk_score", sa.Integer, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("lender_network")
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_index("ix_audit_logs_resource_type", table_name="audit_logs")
    op.drop_index("ix_audit_logs_user_id", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_risk_profiles_loan_id", table_name="risk_profiles")
    op.drop_table("risk_profiles")
    op.execute("DROP TYPE IF EXISTS risk_category_enum")
