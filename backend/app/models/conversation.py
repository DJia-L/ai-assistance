from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import uuid4

# 导入Base类
from .database import Base

# 定义SQLAlchemy ORM模型
class Conversation(Base):
    """对话模型"""
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(200), nullable=False)
    user_id = Column(String(36), nullable=False)
    model_type = Column(String(20), nullable=False)  # deepseek, ai_xiaorong, ai_xiaomi
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    
    # 关联到消息表
    messages = relationship("Message", cascade="all, delete-orphan")

class Message(Base):
    """消息记录模型"""
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    message_metadata = Column(JSON, nullable=True, default=dict)  # 可以存储知识库来源等元数据
    created_at = Column(DateTime, default=func.now())
    
    # 关联到对话表
    conversation = relationship("Conversation", back_populates="messages")

# Pydantic模型用于API请求和响应
class MessageCreate(BaseModel):
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        orm_mode = True
        # 添加字段映射，将ORM的message_metadata映射到API的metadata
        alias_generator = lambda field: "metadata" if field == "message_metadata" else field
        
    @classmethod
    def from_orm(cls, obj):
        # 处理SQLAlchemy对象转换为Pydantic模型
        # 显式将message_metadata转换为metadata
        data = {
            "id": obj.id,
            "role": obj.role,
            "content": obj.content,
            "metadata": obj.message_metadata if hasattr(obj, "message_metadata") else None,
            "created_at": obj.created_at
        }
        return cls(**data)

class ConversationCreate(BaseModel):
    title: str
    model_type: str
    messages: Optional[List[MessageCreate]] = []

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    messages: Optional[List[MessageCreate]] = None

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    model_type: str
    messages: List[MessageResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True 