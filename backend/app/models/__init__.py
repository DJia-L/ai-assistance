# 数据模型包
from .database import Base, engine, get_db
from .conversation import Conversation, Message
from .user import User
from .knowledge_base import KnowledgeBase, KnowledgeDocument

# 创建数据库表
def create_tables():
    Base.metadata.create_all(bind=engine) 