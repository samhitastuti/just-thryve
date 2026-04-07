from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    loan_id: str
    type: str
    amount: Decimal
    status: str
    reference_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
