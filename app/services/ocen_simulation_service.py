"""
OCENSimulationService — simulate OCEN network broadcast and lender discovery.

This service provides a mock OCEN (Open Credit Enablement Network) feel by:
- Simulating broadcast of loan requests to lender nodes
- Tracking lender node responses
- Providing network status and lender discovery
"""
from __future__ import annotations

import logging
import random
import uuid
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)

# Static lender node registry (in production this would be a DB / registry call)
_LENDER_NODES: list[dict] = [
    {
        "id": "node-001",
        "name": "GreenBank NBFC",
        "node_type": "nbfc",
        "is_active": True,
        "min_rate": 9.5,
        "max_rate": 16.0,
        "capacity": 50_000_000,
        "sector_preferences": ["renewable_energy", "agriculture"],
        "min_risk_score": 40,
    },
    {
        "id": "node-002",
        "name": "Agri-Credit Partners",
        "node_type": "nbfc",
        "is_active": True,
        "min_rate": 11.0,
        "max_rate": 18.0,
        "capacity": 20_000_000,
        "sector_preferences": ["agriculture", "commerce"],
        "min_risk_score": 30,
    },
    {
        "id": "node-003",
        "name": "SolarFin P2P",
        "node_type": "p2p",
        "is_active": True,
        "min_rate": 10.0,
        "max_rate": 15.0,
        "capacity": 10_000_000,
        "sector_preferences": ["renewable_energy"],
        "min_risk_score": 50,
    },
    {
        "id": "node-004",
        "name": "National Green Bank",
        "node_type": "bank",
        "is_active": True,
        "min_rate": 8.5,
        "max_rate": 13.0,
        "capacity": 100_000_000,
        "sector_preferences": ["renewable_energy", "agriculture", "commerce"],
        "min_risk_score": 60,
    },
    {
        "id": "node-005",
        "name": "UrbanMicro Finance",
        "node_type": "nbfc",
        "is_active": False,  # offline node
        "min_rate": 14.0,
        "max_rate": 22.0,
        "capacity": 5_000_000,
        "sector_preferences": ["commerce"],
        "min_risk_score": 20,
    },
]


class OCENSimulationService:
    """Stateless OCEN network simulation service."""

    @staticmethod
    def get_network_status() -> dict[str, Any]:
        """
        Return current status of the OCEN lender network.

        Returns
        -------
        {
            "network_id": str,
            "timestamp": str,
            "total_nodes": int,
            "active_nodes": int,
            "nodes": [...],
            "network_health": "healthy" | "degraded" | "offline",
        }
        """
        active = [n for n in _LENDER_NODES if n["is_active"]]
        total = len(_LENDER_NODES)
        active_count = len(active)

        health = "healthy"
        if active_count == 0:
            health = "offline"
        elif active_count < total * 0.5:
            health = "degraded"

        return {
            "network_id": "OCEN-GFC-001",
            "timestamp": datetime.utcnow().isoformat(),
            "total_nodes": total,
            "active_nodes": active_count,
            "network_health": health,
            "nodes": [
                {
                    "id": n["id"],
                    "name": n["name"],
                    "node_type": n["node_type"],
                    "is_active": n["is_active"],
                    "sector_preferences": n["sector_preferences"],
                    "rate_range": f"{n['min_rate']}% – {n['max_rate']}%",
                }
                for n in _LENDER_NODES
            ],
        }

    @staticmethod
    def broadcast_loan_request(
        loan_id: str,
        amount: float,
        sector: str,
        risk_score: int,
        tenure_months: int,
    ) -> dict[str, Any]:
        """
        Simulate broadcasting a loan request to eligible lender nodes.

        Eligible nodes are those that:
        - Are active
        - Accept the borrower's sector
        - Meet the minimum risk score threshold
        - Have sufficient capacity

        Returns
        -------
        {
            "broadcast_id": str,
            "loan_id": str,
            "timestamp": str,
            "eligible_nodes": int,
            "broadcast_log": [...],
            "responding_lenders": [...],
        }
        """
        broadcast_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        broadcast_log = []
        responding_lenders = []

        # Normalise risk score to 0–100
        risk_100 = min(100, max(0, risk_score // 10))

        for node in _LENDER_NODES:
            if not node["is_active"]:
                broadcast_log.append({
                    "node_id": node["id"],
                    "node_name": node["name"],
                    "status": "skipped",
                    "reason": "Node is offline",
                    "timestamp": timestamp,
                })
                continue

            eligible_sector = sector in node["sector_preferences"] or not node["sector_preferences"]
            eligible_risk = risk_100 >= node["min_risk_score"]
            eligible_capacity = amount <= node["capacity"]

            if not eligible_sector:
                broadcast_log.append({
                    "node_id": node["id"],
                    "node_name": node["name"],
                    "status": "declined",
                    "reason": f"Sector '{sector}' not in preferences",
                    "timestamp": timestamp,
                })
                continue

            if not eligible_risk:
                broadcast_log.append({
                    "node_id": node["id"],
                    "node_name": node["name"],
                    "status": "declined",
                    "reason": f"Risk score {risk_100} below minimum {node['min_risk_score']}",
                    "timestamp": timestamp,
                })
                continue

            if not eligible_capacity:
                broadcast_log.append({
                    "node_id": node["id"],
                    "node_name": node["name"],
                    "status": "declined",
                    "reason": "Insufficient capacity",
                    "timestamp": timestamp,
                })
                continue

            # Node is eligible → simulate response
            offered_rate = round(random.uniform(node["min_rate"], min(node["max_rate"], node["min_rate"] + 4)), 2)
            broadcast_log.append({
                "node_id": node["id"],
                "node_name": node["name"],
                "status": "responded",
                "offered_rate": offered_rate,
                "timestamp": timestamp,
            })
            responding_lenders.append({
                "node_id": node["id"],
                "name": node["name"],
                "node_type": node["node_type"],
                "offered_rate": offered_rate,
            })

        return {
            "broadcast_id": broadcast_id,
            "loan_id": loan_id,
            "timestamp": timestamp,
            "total_nodes_contacted": len(_LENDER_NODES),
            "eligible_nodes": len(responding_lenders),
            "broadcast_log": broadcast_log,
            "responding_lenders": sorted(responding_lenders, key=lambda x: x["offered_rate"]),
            "ocen_message": f"Loan request {loan_id} broadcast to OCEN network. {len(responding_lenders)} lender(s) responded.",
        }

    @staticmethod
    def discover_lenders(sector: str, risk_score: int, amount: float) -> list[dict]:
        """
        Return lenders likely to accept a borrower's profile.
        """
        risk_100 = min(100, max(0, risk_score // 10))
        matches = []
        for node in _LENDER_NODES:
            if not node["is_active"]:
                continue
            if sector not in node["sector_preferences"]:
                continue
            if risk_100 < node["min_risk_score"]:
                continue
            if amount > node["capacity"]:
                continue
            matches.append({
                "node_id": node["id"],
                "name": node["name"],
                "node_type": node["node_type"],
                "rate_range": f"{node['min_rate']}% – {node['max_rate']}%",
                "sector_preferences": node["sector_preferences"],
                "match_score": risk_100 - node["min_risk_score"],  # higher = stronger match
            })
        return sorted(matches, key=lambda x: x["match_score"], reverse=True)
