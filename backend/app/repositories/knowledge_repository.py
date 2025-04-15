from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
import uuid
import logging

from app.models.knowledge_base import (
    KnowledgeBase, KnowledgeDocument,
    KnowledgeBaseCreate, KnowledgeDocumentCreate
)
from app.models.user import User

# 配置日志
logger = logging.getLogger("repository.knowledge")

class KnowledgeRepository:
    """知识库仓库类，用于知识库和文档的数据库操作"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_username_or_email(self, username_or_email: str) -> Optional[User]:
        """通过用户名或邮箱获取用户"""
        user = self.db.query(User).filter(User.username == username_or_email).first()
        if not user:
            user = self.db.query(User).filter(User.email == username_or_email).first()
        return user
    
    def get_all_knowledge_bases(self) -> List[KnowledgeBase]:
        """获取所有知识库（管理员专用）"""
        try:
            return self.db.query(KnowledgeBase).all()
        except Exception as e:
            logger.error(f"获取所有知识库失败: {str(e)}")
            return []
    
    def get_public_knowledge_bases(self) -> List[KnowledgeBase]:
        """获取所有公共知识库"""
        try:
            return self.db.query(KnowledgeBase).filter(KnowledgeBase.type == "public").all()
        except Exception as e:
            logger.error(f"获取公共知识库失败: {str(e)}")
            return []
    
    def get_user_knowledge_bases(self, user_id: str) -> List[KnowledgeBase]:
        """获取用户的个人知识库"""
        try:
            return self.db.query(KnowledgeBase).filter(
                KnowledgeBase.user_id == user_id,
                KnowledgeBase.type == "personal"
            ).all()
        except Exception as e:
            logger.error(f"获取用户知识库失败: {str(e)}")
            return []
    
    def get_knowledge_base_by_id(self, kb_id: str) -> Optional[KnowledgeBase]:
        """根据ID获取知识库"""
        try:
            logger.info(f"正在获取知识库: {kb_id}")
            kb = self.db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
            if kb:
                logger.info(f"成功获取知识库: {kb_id}, 名称: {kb.name}")
            else:
                logger.warning(f"未找到知识库: {kb_id}")
            return kb
        except Exception as e:
            logger.error(f"根据ID获取知识库失败: {str(e)}")
            # 仅记录错误而不抛出异常，遵循原有设计
            return None
    
    def create_knowledge_base(self, kb_data: KnowledgeBaseCreate) -> KnowledgeBase:
        """创建新知识库"""
        try:
            # 确保类型字段正确
            kb_type = kb_data.type
            if kb_type not in ["public", "personal"]:
                kb_type = "personal"  # 默认为个人知识库
            
            # 创建知识库对象
            kb = KnowledgeBase(
                id=str(uuid.uuid4()),
                name=kb_data.name,
                description=kb_data.description,
                type=kb_type,
                user_id=kb_data.user_id if kb_type == "personal" else None
            )
            
            logger.info(f"创建知识库: {kb.name}, 类型: {kb.type}, 用户ID: {kb.user_id}")
            self.db.add(kb)
            self.db.commit()
            self.db.refresh(kb)
            logger.info(f"知识库创建成功, ID: {kb.id}")
            return kb
            
        except Exception as e:
            logger.error(f"创建知识库失败: {str(e)}")
            self.db.rollback()
            # 直接抛出异常，不创建临时对象
            raise e
    
    def update_knowledge_base(self, kb_id: str, kb_data: Dict[str, Any]) -> Optional[KnowledgeBase]:
        """更新知识库信息"""
        try:
            kb = self.get_knowledge_base_by_id(kb_id)
            if not kb:
                return None
            
            for key, value in kb_data.items():
                if hasattr(kb, key) and key != "id":
                    setattr(kb, key, value)
            
            self.db.commit()
            self.db.refresh(kb)
            return kb
        except Exception as e:
            logger.error(f"更新知识库失败: {str(e)}")
            self.db.rollback()
            return None
    
    def delete_knowledge_base(self, kb_id: str) -> bool:
        """删除知识库"""
        try:
            kb = self.get_knowledge_base_by_id(kb_id)
            if not kb:
                return False
            
            self.db.delete(kb)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"删除知识库失败: {str(e)}")
            self.db.rollback()
            return False
    
    def get_document_by_id(self, doc_id: str) -> Optional[KnowledgeDocument]:
        """根据ID获取文档"""
        return self.db.query(KnowledgeDocument).filter(KnowledgeDocument.id == doc_id).first()
    
    def get_documents_by_kb_id(self, kb_id: str) -> List[KnowledgeDocument]:
        """获取知识库下的所有文档"""
        return self.db.query(KnowledgeDocument).filter(KnowledgeDocument.kb_id == kb_id).all()
    
    def create_document(self, doc_data: KnowledgeDocumentCreate) -> KnowledgeDocument:
        """创建新文档"""
        doc = KnowledgeDocument(
            title=doc_data.title,
            file_path=doc_data.file_path,
            kb_id=doc_data.kb_id,
            status=doc_data.status
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc
    
    def update_document(self, doc_id: str, doc_data: dict) -> Optional[KnowledgeDocument]:
        """更新文档信息"""
        doc = self.get_document_by_id(doc_id)
        if not doc:
            return None
        
        for key, value in doc_data.items():
            setattr(doc, key, value)
        
        self.db.commit()
        self.db.refresh(doc)
        return doc
    
    def delete_document(self, doc_id: str) -> bool:
        """删除文档"""
        doc = self.get_document_by_id(doc_id)
        if not doc:
            return False
        
        self.db.delete(doc)
        self.db.commit()
        return True
    
    def search_documents(self, kb_id: str, query: str) -> List[KnowledgeDocument]:
        """在知识库中搜索文档（简单文本搜索）"""
        return self.db.query(KnowledgeDocument).filter(
            KnowledgeDocument.kb_id == kb_id,
            KnowledgeDocument.title.ilike(f"%{query}%")
        ).all() 