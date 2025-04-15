from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
# 移除GZip中间件
# from fastapi.middleware.gzip import GZipMiddleware
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv
import logging
from logging.config import dictConfig

# 导入数据库和模型
from app.models import create_tables
from app.models.database import get_db, engine, Base

# 导入API路由
from app.api import auth, ai_dialog, article_analysis, knowledge_base
from app.services.task_manager import start_task_manager

# 加载环境变量
load_dotenv()

# 配置日志
logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
            "formatter": "default",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "level": "INFO",
            "formatter": "default",
            "filename": "app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "encoding": "utf-8",
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"],
    },
}

dictConfig(logging_config)
logger = logging.getLogger(__name__)

# 确保必要的目录存在
def ensure_directories():
    """确保应用运行所需的目录结构存在"""
    # 创建上传目录
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)
        logger.info(f"创建上传目录: {uploads_dir}")
    else:
        logger.info(f"上传目录已存在: {uploads_dir}")
    
    # 创建文档存储目录
    documents_dir = os.path.join(uploads_dir, "documents")
    if not os.path.exists(documents_dir):
        os.makedirs(documents_dir)
        logger.info(f"创建文档目录: {documents_dir}")
    else:
        logger.info(f"文档目录已存在: {documents_dir}")
    
    # 创建嵌入存储目录
    embeddings_dir = os.path.join(uploads_dir, "embeddings")
    if not os.path.exists(embeddings_dir):
        os.makedirs(embeddings_dir)
        logger.info(f"创建嵌入目录: {embeddings_dir}")
    else:
        logger.info(f"嵌入目录已存在: {embeddings_dir}")

# 初始化数据库
Base.metadata.create_all(bind=engine)

# 配置应用
app = FastAPI(
    title="融媒体AI助手 API",
    description="为融媒体AI助手提供后端服务的API",
    version="0.1.0"
)

# 移除GZip中间件
# 添加GZip压缩中间件
# app.add_middleware(GZipMiddleware, minimum_size=1000)  # 对于大于1KB的响应启用压缩

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应设置为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(ai_dialog.router)
app.include_router(article_analysis.router)
app.include_router(knowledge_base.router)

# 创建数据库表
create_tables()

# 启动任务管理器
@app.on_event("startup")
async def startup_event():
    logger.info("启动应用")
    # 确保必要的目录结构存在
    ensure_directories()
    # 获取数据库会话
    db = next(get_db())
    # 创建默认管理员
    auth.create_default_admin(db)
    # 启动任务管理器
    task_manager = start_task_manager()
    logger.info("应用启动完成，默认管理员账号已处理，任务管理器已启动")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("关闭应用")
    # 可以在这里添加清理代码

@app.get("/")
def read_root():
    return {"status": "online", "version": "0.1.0", "message": "欢迎使用融媒体AI助手系统后端API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 