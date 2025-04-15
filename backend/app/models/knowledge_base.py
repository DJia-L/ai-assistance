from sqlalchemy import Column, String, Text, ForeignKey, DateTime, func, Enum, Boolean, Index
from sqlalchemy.orm import relationship
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
import enum

from app.models.database import Base

# SQLAlchemy数据库模型
class KnowledgeBaseType(str, enum.Enum):
    PUBLIC = "public"
    PERSONAL = "personal"

class EmbeddingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class KnowledgeBase(Base):
    """知识库数据模型"""
    __tablename__ = "knowledge_bases"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(String(20), default="public")  # public, personal
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 定义索引来优化查询
    __table_args__ = (
        Index('idx_kb_user_id', 'user_id'),  # 优化按用户ID查询
        Index('idx_kb_type', 'type'),  # 优化按类型查询
        Index('idx_kb_created_at', 'created_at'),  # 优化按创建时间排序
    )
    
    # 关系
    documents = relationship("KnowledgeDocument", back_populates="knowledge_base", cascade="all, delete")
    user = relationship("User", back_populates="knowledge_bases")

    def __repr__(self):
        return f"<KnowledgeBase(id='{self.id}', name='{self.name}', type='{self.type}')>"


class KnowledgeDocument(Base):
    """知识库文档数据模型"""
    __tablename__ = "knowledge_documents"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    kb_id = Column(String(36), ForeignKey("knowledge_bases.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="pending")  # pending, processing, completed, failed
    embedding_file = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 定义索引来优化查询
    __table_args__ = (
        Index('idx_document_kb_id', 'kb_id'),  # 优化按知识库ID查询
        Index('idx_document_status', 'status'),  # 优化按状态查询
        Index('idx_document_created_at', 'created_at'),  # 优化按创建时间排序
    )
    
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")

    def __repr__(self):
        return f"<KnowledgeDocument(id='{self.id}', title='{self.title}')>"

# Pydantic模型用于API请求和响应
class KnowledgeDocumentBase(BaseModel):
    title: str
    file_path: str
    status: str = "processing"

class KnowledgeDocumentCreate(KnowledgeDocumentBase):
    kb_id: str

class KnowledgeDocumentResponse(BaseModel):
    id: str
    title: str
    file_path: str
    kb_id: str
    status: str
    embedding_status: str
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class KnowledgeBaseBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: str

class KnowledgeBaseCreate(KnowledgeBaseBase):
    user_id: Optional[str] = None

class KnowledgeBaseResponse(KnowledgeBaseBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class KnowledgeBaseDetail(KnowledgeBaseResponse):
    documents: List[KnowledgeDocumentResponse] = []

    class Config:
        orm_mode = True

class KnowledgeBaseWithDocuments(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    type: str
    user_id: Optional[str] = None
    documents: List[KnowledgeDocumentResponse]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True 