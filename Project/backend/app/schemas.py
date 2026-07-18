from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TreeSummary(BaseModel):
    id: int
    name: str
    zoneId: int
    temperature: float
    humidity: float
    light: float
    tempStatus: str = "normal"
    humidStatus: str = "normal"
    lightStatus: str = "normal"
    online: bool
    pumpOn: bool
    pumpMode: str = "auto"
    lastUpdated: str


class ZoneSummary(BaseModel):
    id: int
    name: str
    trees: List[TreeSummary]


class DashboardSummary(BaseModel):
    treeCount: int
    zoneCount: int
    tempMin: float
    tempMax: float
    tempAvg: float
    humidMin: float
    humidMax: float
    humidAvg: float
    lightMin: float
    lightMax: float
    lightAvg: float


class ThresholdItem(BaseModel):
    parameter: str
    min_value: float
    max_value: float


class SettingsPayload(BaseModel):
    theme_mode: str = "dark"
    language: str = "th"
    refresh_rate_s: int = 5
    alert_sound: bool = True
    email_alert: bool = True


class HistoryRecord(BaseModel):
    id: int
    user: str
    email: str
    action: str
    status: str
    ip: str
    device: str
    timestamp: str


class AlertItem(BaseModel):
    id: int
    treeId: Optional[int] = None
    zoneId: Optional[int] = None
    type: str
    message: str
    isRead: bool
    createdAt: str
