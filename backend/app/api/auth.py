from fastapi import APIRouter, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
import uuid
import secrets
import logging

# 导入数据库依赖
from app.models.database import get_db
from app.models.user import UserCreate, UserResponse, UserLogin, Token, TokenData
from app.repositories.user_repository import UserRepository

# 创建路由
router = APIRouter(
    prefix="/auth",
    tags=["认证"],
    responses={404: {"description": "Not found"}},
)

# 配置日志
logger = logging.getLogger("api.auth")

# 生成安全的令牌
def create_token(data: dict) -> str:
    # 简单令牌实现，实际应用中应使用JWT
    token = secrets.token_hex(32)
    # 在实际项目中应将令牌存储在数据库或Redis中，并与用户关联
    return token

# 创建默认管理员账户
def create_default_admin(db: Session):
    """创建默认管理员账户"""
    repo = UserRepository(db)
    admin = repo.get_user_by_email("admin@example.com")
    if not admin:
        admin_data = UserCreate(
            username="admin",
            email="admin@example.com",
            password="admin123",  # 实际应用中应该使用强密码并且加密存储
            is_admin=True
        )
        repo.create_user(admin_data)
        logger.info("已创建默认管理员账户")

# 获取当前用户的依赖函数
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    获取当前登录用户信息的依赖函数
    """
    # 检查是否有Authorization头
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="未提供认证凭据"
        )
    
    # 从Authorization头部获取令牌
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="无效的认证格式，应为Bearer token"
        )
    
    token = authorization.replace("Bearer ", "")
    if not token:
        raise HTTPException(
            status_code=401,
            detail="未提供令牌"
        )
    
    # 验证令牌并获取用户信息
    # 这里简化处理，假设所有令牌都有效
    # 实际项目中应验证令牌并提取用户ID
    repo = UserRepository(db)
    
    # 临时解决方案：使用管理员账户
    # 注意：这只是演示用，实际项目中绝不应该这样做
    admin_user = repo.get_user_by_username("admin")
    if not admin_user:
        raise HTTPException(
            status_code=401,
            detail="无效的认证凭据"
        )
    
    return admin_user

# 用户信息接口
@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    """
    获取当前登录用户信息
    """
    return current_user

# 用户注册
@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    注册新用户
    """
    repo = UserRepository(db)
    
    # 检查用户名是否已存在
    if repo.get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=400,
            detail="用户名已被使用"
        )
    
    # 检查邮箱是否已存在
    if repo.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=400,
            detail="邮箱已被注册"
        )
    
    # 设置管理员权限（只有admin@example.com才能成为管理员）
    if user_data.email != "admin@example.com":
        user_data.is_admin = False
    
    # 创建用户
    user = repo.create_user(user_data)
    
    return user

# 用户登录
@router.post("/login", response_model=Token)
async def login_user(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    用户登录
    """
    repo = UserRepository(db)
    user = None
    
    # 通过用户名查找
    if login_data.username:
        user = repo.get_user_by_username(login_data.username)
    
    # 通过邮箱查找
    elif login_data.email:
        user = repo.get_user_by_email(login_data.email)
    
    # 验证用户名/邮箱和密码
    if not user or user.password != login_data.password:  # 实际应用中应该验证哈希密码
        raise HTTPException(
            status_code=401,
            detail="用户名/邮箱或密码错误"
        )
    
    # 生成访问令牌
    token = create_token({"sub": user.id})
    
    # 创建用户响应对象（不包含密码）
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar=user.avatar,
        is_admin=user.is_admin,
        created_at=user.created_at
    )
    
    return {
        "token": token,
        "token_type": "bearer",
        "user": user_response
    } 