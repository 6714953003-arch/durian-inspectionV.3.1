from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(128), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(16), default="operator")
    created_at = Column(DateTime, default=datetime.utcnow)


class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(64), nullable=True)
    email = Column(String(128), nullable=True)
    action = Column(String(16), nullable=False)
    status = Column(String(16), nullable=False)
    ip_address = Column(String(45), nullable=True)
    device = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), nullable=False)
    trees = relationship("Tree", back_populates="zone", cascade="all, delete-orphan")


class Tree(Base):
    __tablename__ = "trees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(64), nullable=False)
    device_id = Column(String(64), unique=True, nullable=False)
    online = Column(Boolean, default=False)
    last_seen_at = Column(DateTime, nullable=True)
    zone = relationship("Zone", back_populates="trees")


class TreeLatestReading(Base):
    __tablename__ = "tree_latest_readings"

    tree_id = Column(Integer, ForeignKey("trees.id", ondelete="CASCADE"), primary_key=True)
    temperature = Column(Numeric(5, 2), nullable=True)
    humidity = Column(Numeric(5, 2), nullable=True)
    light = Column(Numeric(8, 2), nullable=True)
    soil_moisture = Column(Numeric(5, 2), nullable=True)
    ph = Column(Numeric(4, 2), nullable=True)
    temp_status = Column(String(16), default="normal")
    humid_status = Column(String(16), default="normal")
    light_status = Column(String(16), default="normal")
    pump_on = Column(Boolean, default=False)
    pump_mode = Column(String(16), default="auto")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tree_id = Column(Integer, ForeignKey("trees.id", ondelete="CASCADE"), nullable=False)
    temperature = Column(Numeric(5, 2), nullable=True)
    humidity = Column(Numeric(5, 2), nullable=True)
    light = Column(Numeric(8, 2), nullable=True)
    soil_moisture = Column(Numeric(5, 2), nullable=True)
    ph = Column(Numeric(4, 2), nullable=True)
    recorded_at = Column(DateTime, nullable=False)


class PumpCommand(Base):
    __tablename__ = "pump_commands"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tree_id = Column(Integer, ForeignKey("trees.id", ondelete="CASCADE"), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=True)
    mode = Column(String(16), nullable=False)
    issued_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Threshold(Base):
    __tablename__ = "thresholds"

    parameter = Column(String(32), primary_key=True)
    min_value = Column(Numeric(8, 2), nullable=False)
    max_value = Column(Numeric(8, 2), nullable=False)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    theme_mode = Column(String(16), default="dark")
    language = Column(String(16), default="th")
    refresh_rate_s = Column(Integer, default=5)
    alert_sound = Column(Boolean, default=True)
    email_alert = Column(Boolean, default=True)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tree_id = Column(Integer, ForeignKey("trees.id", ondelete="CASCADE"), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=True)
    type = Column(String(16), nullable=False)
    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
