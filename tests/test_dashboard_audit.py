"""
Tests for Priority 3 & 4 features:
  - GET /dashboard/lender
  - GET /dashboard/borrower
  - GET /audit-logs
"""
import uuid
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_risk_profile(loan_id, category="low") -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        loan_id=loan_id,
        risk_category=category,
        risk_score=70 if category == "low" else (50 if category == "medium" else 30),
        interest_rate=10.0,
        feature_scores={},
        explanation_text="Test",
        created_at=datetime.utcnow(),
    )


def _make_audit_entry() -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        action="consent_granted",
        resource_type="consent",
        resource_id=str(uuid.uuid4()),
        metadata_={"consent_type": "bank_statement"},
        created_at=datetime.utcnow(),
    )


# ---------------------------------------------------------------------------
# GET /dashboard/lender
# ---------------------------------------------------------------------------

class TestLenderDashboard:
    URL = "/dashboard/lender"

    def test_lender_can_access(self, lender_client, mock_db):
        # Query for all loans returns empty list
        mock_db.query.return_value.all.return_value = []
        # Query for risk profiles returns empty list
        mock_db.query.return_value.all.return_value = []

        response = lender_client.get(self.URL)
        assert response.status_code == 200
        data = response.json()
        assert "total_loans" in data
        assert "default_rate" in data
        assert "risk_distribution" in data
        assert "monthly_disbursements" in data
        assert "avg_interest_rate" in data

    def test_borrower_cannot_access(self, borrower_client, mock_db):
        response = borrower_client.get(self.URL)
        assert response.status_code == 403

    def test_unauthenticated_returns_401(self, client, mock_db):
        response = client.get(self.URL)
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# GET /dashboard/borrower
# ---------------------------------------------------------------------------

class TestBorrowerDashboard:
    URL = "/dashboard/borrower"

    def test_borrower_can_access(self, borrower_client, mock_db, borrower):
        mock_db.query.return_value.filter.return_value.all.return_value = []
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
        mock_db.query.return_value.join.return_value.filter.return_value.order_by.return_value.all.return_value = []

        response = borrower_client.get(self.URL)
        assert response.status_code == 200
        data = response.json()
        assert "total_loans" in data
        assert "credit_score_trend" in data
        assert "payment_history" in data
        assert "credit_improvement_tips" in data

    def test_lender_cannot_access(self, lender_client, mock_db):
        response = lender_client.get(self.URL)
        assert response.status_code == 403

    def test_unauthenticated_returns_401(self, client, mock_db):
        response = client.get(self.URL)
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# GET /audit-logs
# ---------------------------------------------------------------------------

class TestAuditLogs:
    URL = "/audit-logs"

    def test_borrower_can_access_own_logs(self, borrower_client, mock_db):
        entry = _make_audit_entry()
        mock_db.query.return_value.filter.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [entry]
        mock_db.query.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [entry]

        # The service chains multiple filters; mock at a higher level
        mock_db.query.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = [entry]

        response = borrower_client.get(self.URL)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_lender_can_access_all_logs(self, lender_client, mock_db):
        mock_db.query.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = []
        mock_db.query.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = []

        response = lender_client.get(self.URL)
        assert response.status_code == 200

    def test_unauthenticated_returns_401(self, client):
        response = client.get(self.URL)
        assert response.status_code in (401, 403)

    def test_filter_by_resource_type(self, borrower_client, mock_db):
        mock_db.query.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = []

        response = borrower_client.get(f"{self.URL}?resource_type=consent")
        assert response.status_code == 200

    def test_pagination_params_accepted(self, borrower_client, mock_db):
        mock_db.query.return_value.filter.return_value.order_by.return_value.offset.return_value.limit.return_value.all.return_value = []

        response = borrower_client.get(f"{self.URL}?limit=10&offset=5")
        assert response.status_code == 200
