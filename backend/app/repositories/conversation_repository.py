from sqlalchemy.orm import Session
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.sql import func

from app.models.conversation import Conversation, Message, ConversationCreate, MessageCreate

class ConversationRepository:
    """对话仓库类，处理对话和消息的数据库操作"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_conversation(self, user_id: str, data: ConversationCreate) -> Conversation:
        """创建新对话"""
        # 创建新对话
        conversation_id = str(uuid.uuid4())
        conversation = Conversation(
            id=conversation_id,
            title=data.title,
            user_id=user_id,
            model_type=data.model_type
        )
        self.db.add(conversation)
        
        # 创建初始消息
        if data.messages:
            for msg_data in data.messages:
                message = Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    role=msg_data.role,
                    content=msg_data.content
                )
                self.db.add(message)
        
        self.db.commit()
        self.db.refresh(conversation)
        return conversation
    
    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        """获取对话详情"""
        return self.db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.is_deleted == False
        ).first()
    
    def get_user_conversations(self, user_id: str, model_type: Optional[str] = None) -> List[Conversation]:
        """获取用户的所有对话"""
        query = self.db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.is_deleted == False
        )
        
        # 如果指定了模型类型，按模型类型过滤
        if model_type:
            query = query.filter(Conversation.model_type == model_type)
        
        # 按更新时间倒序排序
        return query.order_by(Conversation.updated_at.desc()).all()
    
    def update_conversation(self, conversation_id: str, title: Optional[str] = None) -> Optional[Conversation]:
        """更新对话标题"""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None
        
        if title:
            conversation.title = title
            conversation.updated_at = datetime.now()
            
        self.db.commit()
        self.db.refresh(conversation)
        return conversation
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """删除对话（软删除）"""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return False
        
        # 软删除
        conversation.is_deleted = True
        self.db.commit()
        return True
    
    def add_message(self, conversation_id: str, message_data: MessageCreate):
        """向对话中添加新消息"""
        # 根据ID查找对话
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return None
        
        # 确保metadata有默认值
        metadata = message_data.metadata if message_data.metadata is not None else {}
        
        # 创建新消息
        new_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role=message_data.role,
            content=message_data.content,
            message_metadata=metadata
        )
        
        # 添加消息到数据库
        self.db.add(new_message)
        
        # 更新对话的更新时间
        conversation.updated_at = func.now()
        
        # 提交更改
        self.db.commit()
        return new_message
    
    def get_messages(self, conversation_id: str) -> List[Message]:
        """获取对话的所有消息"""
        return self.db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at).all()
    
    def clear_user_conversations(self, user_id: str, model_type: Optional[str] = None) -> int:
        """清除用户的所有对话（按模型类型）"""
        query = self.db.query(Conversation).filter(
            Conversation.user_id == user_id,
            Conversation.is_deleted == False
        )
        
        # 如果指定了模型类型，按模型类型过滤
        if model_type:
            query = query.filter(Conversation.model_type == model_type)
        
        # 获取要删除的对话
        conversations = query.all()
        count = len(conversations)
        
        # 批量软删除
        for conversation in conversations:
            conversation.is_deleted = True
        
        self.db.commit()
        return count
    
    def get_conversations(self, user_id, model_type=None):
        """获取指定用户的所有对话（新API兼容方法）"""
        return self.get_user_conversations(user_id, model_type)
        
    async def save_conversation(
        self, 
        user_id: str, 
        model_type: str, 
        messages: List[Dict[str, Any]], 
        conversation_id: str = None
    ) -> Conversation:
        """保存整个对话及其消息历史"""
        # 如果没有conversation_id，创建新对话
        if not conversation_id:
            conversation_id = str(uuid.uuid4())
            
        # 检查对话是否已存在
        conversation = self.get_conversation(conversation_id)
        
        # 如果对话不存在，创建新对话
        if not conversation:
            # 从消息中获取对话标题（使用第一条用户消息）
            title = "新对话"
            for msg in messages:
                if msg["role"] == "user":
                    title = msg["content"][:30] + ("..." if len(msg["content"]) > 30 else "")
                    break
                
            # 创建新对话
            conversation = Conversation(
                id=conversation_id,
                title=title,
                user_id=user_id,
                model_type=model_type
            )
            self.db.add(conversation)
            self.db.flush()  # 确保conversation_id可用
        
        # 获取现有消息列表
        existing_messages = self.get_messages(conversation_id)
        existing_message_texts = [(msg.role, msg.content) for msg in existing_messages]
        
        # 添加新消息（避免重复）
        for msg in messages:
            # 检查消息是否已存在
            if (msg["role"], msg["content"]) not in existing_message_texts:
                message = Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    role=msg["role"],
                    content=msg["content"]
                )
                self.db.add(message)
        
        # 更新对话时间并提交
        conversation.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(conversation)
        
        return conversation 