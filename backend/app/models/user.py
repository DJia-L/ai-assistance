from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import uuid4

from app.models.database import Base

# SQLAlchemy数据库模型
class User(Base):
    """用户数据模型"""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)  # 实际应用中应该存储哈希值
    avatar = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    knowledge_bases = relationship("KnowledgeBase", back_populates="user")
    
    def __repr__(self):
        return f"<User(id='{self.id}', username='{self.username}', email='{self.email}', is_admin={self.is_admin})>"

# Pydantic模型（用于API）
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    is_admin: bool = False
    avatar: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_admin: bool
    avatar: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class TokenData(BaseModel):
    """令牌数据模型"""
    sub: Optional[str] = None  # 用户ID

class Token(BaseModel):
    """令牌响应模型"""
    token: str
    token_type: str
    user: UserResponse 