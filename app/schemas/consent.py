from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ConsentGrantRequest(BaseModel):
    loan_id: str
    consent_types: List[str]  # bank_statement, gst_data, energy_usage, carbon_audit


class ConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    consent_id: str
    user_id: str
    consent_type: str
    status: str
    redirect_url: Optional[str] = None
    artefact: Optional[Any] = None
    granted_at: Optional[datetime] = None
    revoked_at: Optional[datetime] = None
    created_at: datetime
