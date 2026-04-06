"""
Tests for Priority 5 features:
  - GET /ocen/network-status
  - POST /ocen/broadcast/{loan_id}
  - GET /ocen/discover-lenders
  - OCENSimulationService unit tests
"""
import uuid
from decimal import Decimal
from datetime import datetime
from types import SimpleNamespace

import pytest

from app.services.ocen_simulation_service import OCENSimulationService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_loan(status="submitted", risk_score=700, borrower_id=None) -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        borrower_id=borrower_id or uuid.uuid4(),
        amount_requested=Decimal("500000.00"),
        purpose="Solar installation",
        tenure_months=12,
        status=status,
        approved_amount=None,
        approved_rate=None,
        emi_amount=None,
        risk_score=risk_score,
        ml_decision="approved",
        created_at=datetime.utcnow(),
        submitted_at=datetime.utcnow(),
        disbursed_at=None,
        closed_at=None,
    )


# ---------------------------------------------------------------------------
# OCENSimulationService unit tests
# ---------------------------------------------------------------------------

class TestOCENSimulationService:
    def test_network_status_has_required_keys(self):
        result = OCENSimulationService.get_network_status()
        assert "network_id" in result
        assert "total_nodes" in result
        assert "active_nodes" in result
        assert "network_health" in result
        assert "nodes" in result

    def test_active_nodes_lte_total_nodes(self):
        result = OCENSimulationService.get_network_status()
        assert result["active_nodes"] <= result["total_nodes"]

    def test_network_health_is_valid(self):
        result = OCENSimulationService.get_network_status()
        assert result["network_health"] in ("healthy", "degraded", "offline")

    def test_broadcast_returns_required_keys(self):
        result = OCENSimulationService.broadcast_loan_request(
            loan_id=str(uuid.uuid4()),
            amount=500000,
            sector="renewable_energy",
            risk_score=700,
            tenure_months=12,
        )
        assert "broadcast_id" in result
        assert "loan_id" in result
        assert "broadcast_log" in result
        assert "responding_lenders" in result
        assert "ocen_message" in result

    def test_broadcast_low_risk_score_gets_fewer_responses(self):
        result_high = OCENSimulationService.broadcast_loan_request(
            loan_id=str(uuid.uuid4()),
            amount=500000,
            sector="renewable_energy",
            risk_score=900,
            tenure_months=12,
        )
        result_low = OCENSimulationService.broadcast_loan_request(
            loan_id=str(uuid.uuid4()),
            amount=500000,
            sector="renewable_energy",
            risk_score=100,
            tenure_months=12,
        )
        # High risk score should have >= as many responding lenders
        assert result_high["eligible_nodes"] >= result_low["eligible_nodes"]

    def test_discover_lenders_returns_list(self):
        result = OCENSimulationService.discover_lenders("renewable_energy", 700, 500000)
        assert isinstance(result, list)

    def test_discover_lenders_filters_by_sector(self):
        # commerce sector should not return nodes that only accept renewable_energy
        result = OCENSimulationService.discover_lenders("commerce", 700, 500000)
        for match in result:
            assert "commerce" in match.get("sector_preferences", [])

    def test_discover_lenders_sorted_by_match_score(self):
        result = OCENSimulationService.discover_lenders("renewable_energy", 700, 500000)
        if len(result) > 1:
            scores = [m["match_score"] for m in result]
            assert scores == sorted(scores, reverse=True)


# ---------------------------------------------------------------------------
# Route-level tests: GET /ocen/network-status
# ---------------------------------------------------------------------------

class TestOCENNetworkStatus:
    URL = "/ocen/network-status"

    def test_authenticated_user_can_get_status(self, borrower_client, mock_db):
        response = borrower_client.get(self.URL)
        assert response.status_code == 200
        data = response.json()
        assert "network_health" in data
        assert "nodes" in data
        assert isinstance(data["nodes"], list)

    def test_unauthenticated_returns_401(self, client):
        response = client.get(self.URL)
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Route-level tests: POST /ocen/broadcast/{loan_id}
# ---------------------------------------------------------------------------

class TestOCENBroadcast:
    def test_borrower_can_broadcast_own_loan(self, borrower_client, mock_db, borrower):
        loan = _make_loan(status="submitted", borrower_id=borrower.id, risk_score=700)
        profile = SimpleNamespace(sector="renewable_energy", user_id=borrower.id)
        mock_db.query.return_value.filter.return_value.first.side_effect = [loan, profile]

        response = borrower_client.post(f"/ocen/broadcast/{loan.id}")
        assert response.status_code == 200
        data = response.json()
        assert "broadcast_id" in data
        assert "broadcast_log" in data

    def test_borrower_cannot_broadcast_other_loan(self, borrower_client, mock_db):
        loan = _make_loan(status="submitted", risk_score=700)  # different borrower_id
        mock_db.query.return_value.filter.return_value.first.return_value = loan
        response = borrower_client.post(f"/ocen/broadcast/{loan.id}")
        assert response.status_code == 403

    def test_returns_404_for_missing_loan(self, borrower_client, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        response = borrower_client.post(f"/ocen/broadcast/{uuid.uuid4()}")
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Route-level tests: GET /ocen/discover-lenders
# ---------------------------------------------------------------------------

class TestLenderDiscovery:
    URL = "/ocen/discover-lenders"

    def test_returns_list_of_lenders(self, borrower_client, mock_db):
        response = borrower_client.get(f"{self.URL}?sector=renewable_energy&risk_score=700&amount=500000")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_high_risk_score_defaults(self, lender_client, mock_db):
        response = lender_client.get(self.URL)
        assert response.status_code == 200

    def test_unauthenticated_returns_401(self, client):
        response = client.get(self.URL)
        assert response.status_code in (401, 403)
