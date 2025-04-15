from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import uuid4

from app.models.user import User, UserCreate

class UserRepository:
    """用户数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        """创建新用户"""
        user = User(
            id=str(uuid4()),
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,  # 实际应用中应该哈希处理
            avatar=user_data.avatar,
            is_admin=user_data.is_admin
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """通过ID获取用户"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """通过用户名获取用户"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """通过邮箱获取用户"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_all_users(self) -> List[User]:
        """获取所有用户"""
        return self.db.query(User).all()
    
    def update_user(self, user_id: str, data: dict) -> Optional[User]:
        """更新用户信息"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        for key, value in data.items():
            setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def delete_user(self, user_id: str) -> bool:
        """删除用户"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        return True
    
    def check_admin_exists(self) -> bool:
        """检查是否存在管理员账号"""
        admin = self.db.query(User).filter(User.is_admin == True).first()
        return admin is not None
    
    def create_default_admin(self) -> User:
        """创建默认管理员账号"""
        # 检查默认管理员是否已存在
        admin = self.get_user_by_username("admin")
        if admin:
            return admin
        
        # 创建默认管理员
        admin_data = UserCreate(
            username="admin",
            email="admin@example.com",
            password="admin123",
            avatar="https://api.dicebear.com/6.x/initials/svg?seed=Admin",
            is_admin=True
        )
        
        return self.create_user(admin_data) 