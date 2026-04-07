from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: str
    loan_id: str
    model_version: str
    input_features: Dict[str, Any]
    prediction_score: Decimal
    shap_values: Optional[Dict[str, Any]] = None
    decision: str
    confidence: Optional[Decimal] = None
    created_at: datetime
