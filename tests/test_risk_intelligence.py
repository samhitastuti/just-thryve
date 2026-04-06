"""
Tests for the new Priority 1 & 2 features:
  - GET /loans/{id}/risk-explanation
  - GET /loans/{id}/comparisons
  - POST /loans/{id}/early-repayment
  - DynamicRateService unit tests
  - RiskExplanationService unit tests
  - LoanComparisonService unit tests
"""
import uuid
from decimal import Decimal
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.services.dynamic_rate_service import DynamicRateService
from app.services.risk_explanation_service import RiskExplanationService
from app.services.loan_comparison_service import LoanComparisonService


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_loan(status: str = "submitted", borrower_id=None, **kwargs) -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        borrower_id=borrower_id or uuid.uuid4(),
        amount_requested=Decimal("500000.00"),
        purpose="Solar installation",
        tenure_months=12,
        status=status,
        approved_amount=kwargs.get("approved_amount", Decimal("500000.00")),
        approved_rate=kwargs.get("approved_rate", Decimal("12.0000")),
        emi_amount=kwargs.get("emi_amount", Decimal("44424.40")),
        risk_score=kwargs.get("risk_score", 750),
        ml_decision=kwargs.get("ml_decision", "approved"),
        created_at=datetime.utcnow(),
        submitted_at=datetime.utcnow(),
        disbursed_at=kwargs.get("disbursed_at"),
        closed_at=None,
    )


def _make_audit_log(loan_id, shap_values=None) -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        loan_id=loan_id,
        model_version="heuristic-1.0",
        input_features={
            "gst_revenue_3m_avg": 100000.0,
            "compliance_status": "compliant",
            "renewable_energy_mix": 50.0,
            "gst_revenue_growth_rate": 15.0,
            "emi_to_revenue_ratio": 0.44,
        },
        prediction_score=0.75,
        shap_values=shap_values or {
            "gst_revenue_3m_avg": 0.3,
            "compliance_status": 0.2,
            "renewable_energy_mix": 0.15,
            "gst_revenue_growth_rate": 0.1,
            "emi_to_revenue_ratio": -0.05,
        },
        decision="approved",
        confidence=0.75,
        created_at=datetime.utcnow(),
    )


def _make_schedule_item(loan_id, n: int, status="pending") -> SimpleNamespace:
    return SimpleNamespace(
        id=uuid.uuid4(),
        loan_id=loan_id,
        installment_number=n,
        due_date=datetime.utcnow().date(),
        principal_amount=Decimal("40000.00"),
        interest_amount=Decimal("4424.40"),
        emi_amount=Decimal("44424.40"),
        status=status,
        paid_on=None,
    )


# ---------------------------------------------------------------------------
# DynamicRateService unit tests
# ---------------------------------------------------------------------------

class TestDynamicRateService:
    def test_low_risk_category(self):
        result = DynamicRateService.calculate_rate(700, 500000, 12)
        assert result["risk_category"] == "low"
        assert result["base_rate"] == 10.0

    def test_medium_risk_category(self):
        result = DynamicRateService.calculate_rate(500, 500000, 12)
        assert result["risk_category"] == "medium"
        assert result["base_rate"] == 14.0

    def test_high_risk_category(self):
        result = DynamicRateService.calculate_rate(300, 500000, 12)
        assert result["risk_category"] == "high"
        assert result["base_rate"] == 18.0

    def test_renewable_sector_discount(self):
        result = DynamicRateService.calculate_rate(700, 500000, 12, sector="renewable_energy")
        assert result["sector_adjustment"] == -1.0
        assert result["final_rate"] == result["base_rate"] - 1.0

    def test_tenure_premium_over_24_months(self):
        result = DynamicRateService.calculate_rate(700, 500000, 36)
        assert result["tenure_adjustment"] == 0.5

    def test_no_tenure_premium_under_24_months(self):
        result = DynamicRateService.calculate_rate(700, 500000, 12)
        assert result["tenure_adjustment"] == 0.0

    def test_amount_premium_over_1cr(self):
        result = DynamicRateService.calculate_rate(700, 15_000_000, 12)
        assert result["amount_adjustment"] == 0.5

    def test_final_rate_is_sum_of_components(self):
        result = DynamicRateService.calculate_rate(700, 500000, 12, "agriculture")
        expected = result["base_rate"] + result["sector_adjustment"] + result["tenure_adjustment"] + result["amount_adjustment"]
        assert abs(result["final_rate"] - expected) < 0.0001

    def test_risk_score_boundary_low(self):
        assert DynamicRateService.get_risk_category(70) == "low"

    def test_risk_score_boundary_medium(self):
        assert DynamicRateService.get_risk_category(69) == "medium"
        assert DynamicRateService.get_risk_category(40) == "medium"

    def test_risk_score_boundary_high(self):
        assert DynamicRateService.get_risk_category(39) == "high"


# ---------------------------------------------------------------------------
# RiskExplanationService unit tests
# ---------------------------------------------------------------------------

class TestRiskExplanationService:
    _SHAP = {
        "gst_revenue_3m_avg": 0.3,
        "compliance_status": 0.2,
        "renewable_energy_mix": 0.15,
        "gst_revenue_growth_rate": -0.1,
    }
    _FEATURES = {
        "gst_revenue_3m_avg": 100000.0,
        "compliance_status": "compliant",
        "renewable_energy_mix": 50.0,
        "gst_revenue_growth_rate": -5.0,
        "emi_to_revenue_ratio": 0.3,
    }

    def test_explanation_has_required_keys(self):
        result = RiskExplanationService.build_explanation(
            shap_values=self._SHAP,
            risk_score=750,
            risk_category="low",
            interest_rate=10.0,
            input_features=self._FEATURES,
        )
        assert "summary" in result
        assert "risk_gauge" in result
        assert "risk_category" in result
        assert "rate_rationale" in result
        assert "key_factors" in result
        assert "improvement_tips" in result

    def test_risk_gauge_is_0_to_100(self):
        result = RiskExplanationService.build_explanation(
            shap_values=self._SHAP,
            risk_score=750,
            risk_category="low",
            interest_rate=10.0,
        )
        assert 0 <= result["risk_gauge"] <= 100

    def test_key_factors_sorted_by_impact(self):
        result = RiskExplanationService.build_explanation(
            shap_values=self._SHAP,
            risk_score=750,
            risk_category="low",
            interest_rate=10.0,
            input_features=self._FEATURES,
        )
        factors = result["key_factors"]
        assert len(factors) > 0
        # First factor should have largest absolute shap value
        first_shap = abs(factors[0]["shap_value"])
        for f in factors[1:]:
            assert first_shap >= abs(f["shap_value"])

    def test_factor_impact_direction(self):
        result = RiskExplanationService.build_explanation(
            shap_values=self._SHAP,
            risk_score=750,
            risk_category="low",
            interest_rate=10.0,
        )
        for factor in result["key_factors"]:
            if factor["shap_value"] > 0:
                assert factor["impact"] == "positive"
            else:
                assert factor["impact"] == "negative"

    def test_improvement_tips_not_empty(self):
        result = RiskExplanationService.build_explanation(
            shap_values=None,
            risk_score=300,
            risk_category="high",
            interest_rate=18.0,
            input_features={"compliance_status": "non_compliant", "renewable_energy_mix": 5.0},
        )
        assert len(result["improvement_tips"]) > 0

    def test_no_shap_returns_empty_key_factors(self):
        result = RiskExplanationService.build_explanation(
            shap_values=None,
            risk_score=750,
            risk_category="low",
            interest_rate=10.0,
        )
        assert result["key_factors"] == []


# ---------------------------------------------------------------------------
# LoanComparisonService unit tests
# ---------------------------------------------------------------------------

class TestLoanComparisonService:
    def test_compare_has_required_keys(self):
        result = LoanComparisonService.compare(500000, 12.0, 12)
        assert "approved_offer" in result
        assert "alternatives" in result
        assert "recommendation" in result
        assert "summary_chart" in result
        assert "best_value_label" in result

    def test_summary_chart_has_three_entries(self):
        result = LoanComparisonService.compare(500000, 12.0, 12)
        assert len(result["summary_chart"]) == 3

    def test_approved_offer_marked_correctly(self):
        result = LoanComparisonService.compare(500000, 12.0, 12)
        assert result["approved_offer"]["is_approved_offer"] is True

    def test_alternatives_not_approved(self):
        result = LoanComparisonService.compare(500000, 12.0, 12)
        for alt in result["alternatives"]:
            assert alt["is_approved_offer"] is False

    def test_total_cost_equals_emi_times_tenure(self):
        result = LoanComparisonService.compare(500000, 12.0, 12)
        offer = result["approved_offer"]
        expected = round(offer["emi_amount"] * offer["tenure_months"], 2)
        assert abs(offer["total_cost"] - expected) < 1.0

    def test_early_repayment_options_structure(self):
        result = LoanComparisonService.early_repayment_options(400000, 12.0, 10)
        assert "options" in result
        assert len(result["options"]) == 3
        assert "remaining_principal" in result

    def test_early_repayment_percentages(self):
        result = LoanComparisonService.early_repayment_options(400000, 12.0, 10)
        pcts = [o["prepayment_percent"] for o in result["options"]]
        assert pcts == [10, 25, 50]

    def test_early_repayment_interest_saved_nonnegative(self):
        result = LoanComparisonService.early_repayment_options(400000, 12.0, 10)
        for opt in result["options"]:
            assert opt["interest_saved"] >= 0


# ---------------------------------------------------------------------------
# Route-level tests: GET /loans/{id}/risk-explanation
# ---------------------------------------------------------------------------

class TestRiskExplanationRoute:
    def test_returns_explanation_for_submitted_loan(self, borrower_client, mock_db, borrower):
        loan = _make_loan(status="submitted", borrower_id=borrower.id, risk_score=750)
        audit = _make_audit_log(loan.id)
        profile = SimpleNamespace(sector="renewable_energy", user_id=borrower.id)

        # Loan query uses filter().first(); BusinessProfile query also uses filter().first()
        # MLAuditLog query uses filter().order_by().first() → separate mock chain
        mock_db.query.return_value.filter.return_value.first.side_effect = [
            loan,    # 1st filter().first() = Loan query
            profile, # 2nd filter().first() = BusinessProfile query
        ]
        mock_db.query.return_value.filter.return_value.order_by.return_value.first.return_value = audit

        response = borrower_client.get(f"/loans/{loan.id}/risk-explanation")
        assert response.status_code == 200
        data = response.json()
        assert "summary" in data
        assert "risk_gauge" in data
        assert 0 <= data["risk_gauge"] <= 100
        assert "key_factors" in data
        assert "improvement_tips" in data

    def test_returns_400_if_no_risk_score(self, borrower_client, mock_db, borrower):
        loan = _make_loan(status="created", borrower_id=borrower.id, risk_score=None)
        loan.risk_score = None
        mock_db.query.return_value.filter.return_value.first.return_value = loan

        response = borrower_client.get(f"/loans/{loan.id}/risk-explanation")
        assert response.status_code == 400

    def test_returns_404_for_missing_loan(self, borrower_client, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        response = borrower_client.get(f"/loans/{uuid.uuid4()}/risk-explanation")
        assert response.status_code == 404

    def test_borrower_cannot_see_other_loan(self, borrower_client, mock_db):
        loan = _make_loan(status="submitted", risk_score=750)  # different borrower_id
        mock_db.query.return_value.filter.return_value.first.return_value = loan
        response = borrower_client.get(f"/loans/{loan.id}/risk-explanation")
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Route-level tests: GET /loans/{id}/comparisons
# ---------------------------------------------------------------------------

class TestLoanComparisonRoute:
    def test_returns_comparison_for_loan(self, borrower_client, mock_db, borrower):
        loan = _make_loan(status="accepted", borrower_id=borrower.id, risk_score=700)
        profile = SimpleNamespace(sector="commerce", user_id=borrower.id)
        mock_db.query.return_value.filter.return_value.first.side_effect = [loan, profile]

        response = borrower_client.get(f"/loans/{loan.id}/comparisons")
        assert response.status_code == 200
        data = response.json()
        assert "approved_offer" in data
        assert "summary_chart" in data

    def test_returns_404_for_missing_loan(self, borrower_client, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        response = borrower_client.get(f"/loans/{uuid.uuid4()}/comparisons")
        assert response.status_code == 404

    def test_borrower_cannot_see_other_loan(self, borrower_client, mock_db):
        loan = _make_loan(status="accepted", risk_score=700)  # different borrower_id
        mock_db.query.return_value.filter.return_value.first.return_value = loan
        response = borrower_client.get(f"/loans/{loan.id}/comparisons")
        assert response.status_code == 403


# ---------------------------------------------------------------------------
# Route-level tests: POST /loans/{id}/early-repayment
# ---------------------------------------------------------------------------

class TestEarlyRepaymentRoute:
    def test_returns_options_for_active_loan(self, borrower_client, mock_db, borrower):
        loan = _make_loan(
            status="active",
            borrower_id=borrower.id,
            approved_rate=Decimal("12.0000"),
            emi_amount=Decimal("44424.40"),
        )
        schedules = [_make_schedule_item(loan.id, i) for i in range(1, 6)]

        mock_db.query.return_value.filter.return_value.first.return_value = loan
        mock_db.query.return_value.filter.return_value.count.return_value = 5
        mock_db.query.return_value.filter.return_value.all.return_value = schedules

        response = borrower_client.post(f"/loans/{loan.id}/early-repayment")
        assert response.status_code == 200
        data = response.json()
        assert "options" in data
        assert len(data["options"]) == 3

    def test_returns_400_for_created_loan(self, borrower_client, mock_db, borrower):
        loan = _make_loan(status="created", borrower_id=borrower.id)
        mock_db.query.return_value.filter.return_value.first.return_value = loan
        response = borrower_client.post(f"/loans/{loan.id}/early-repayment")
        assert response.status_code == 400

    def test_lender_cannot_access(self, lender_client, mock_db):
        response = lender_client.post(f"/loans/{uuid.uuid4()}/early-repayment")
        assert response.status_code == 403

    def test_returns_404_for_missing_loan(self, borrower_client, mock_db):
        mock_db.query.return_value.filter.return_value.first.return_value = None
        response = borrower_client.post(f"/loans/{uuid.uuid4()}/early-repayment")
        assert response.status_code == 404
