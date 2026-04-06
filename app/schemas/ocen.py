"""Schemas for OCEN network simulation responses."""
from typing import Optional, List
from pydantic import BaseModel


class LenderNode(BaseModel):
    id: str
    name: str
    node_type: str
    is_active: bool
    sector_preferences: List[str]
    rate_range: str


class NetworkStatusResponse(BaseModel):
    network_id: str
    timestamp: str
    total_nodes: int
    active_nodes: int
    network_health: str   # "healthy" | "degraded" | "offline"
    nodes: List[LenderNode]


class BroadcastLogEntry(BaseModel):
    node_id: str
    node_name: str
    status: str           # "responded" | "declined" | "skipped"
    reason: Optional[str] = None
    offered_rate: Optional[float] = None
    timestamp: str


class RespondingLender(BaseModel):
    node_id: str
    name: str
    node_type: str
    offered_rate: float


class BroadcastResponse(BaseModel):
    broadcast_id: str
    loan_id: str
    timestamp: str
    total_nodes_contacted: int
    eligible_nodes: int
    broadcast_log: List[BroadcastLogEntry]
    responding_lenders: List[RespondingLender]
    ocen_message: str


class LenderDiscoveryItem(BaseModel):
    node_id: str
    name: str
    node_type: str
    rate_range: str
    sector_preferences: List[str]
    match_score: int


class AuditLogEntry(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    metadata: Optional[dict]
    created_at: str
