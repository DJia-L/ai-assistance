from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, Path
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil
import logging
from datetime import datetime

from app.models.database import get_db
from app.models.knowledge_base import (
    KnowledgeBaseCreate, 
    KnowledgeBaseResponse, 
    KnowledgeBaseDetail,
    KnowledgeDocumentResponse,
    KnowledgeDocumentCreate
)
from app.repositories.knowledge_repository import KnowledgeRepository
from app.services.task_manager import get_task_manager
from app.services.document_processor import get_document_processor
from app.services.embedding_service import get_embedding_service
from app.api.auth import get_current_user
from app.models.user import UserResponse

# 配置日志
logger = logging.getLogger("api.knowledge_base")

router = APIRouter(prefix="/api/kb", tags=["知识库"])

# 上传文件的存储目录
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "documents")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# 验证管理员身份
async def verify_admin(current_user: UserResponse = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="权限不足，需要管理员权限")
    return current_user


# 获取用户的知识库列表
@router.get("", response_model=List[KnowledgeBaseResponse])
async def get_knowledge_bases(
    db: Session = Depends(get_db),
    include_public: bool = True
):
    """获取用户可访问的知识库列表"""
    try:
        logger.info(f"获取知识库列表, include_public={include_public}")
        repo = KnowledgeRepository(db)
        
        # 测试阶段: 直接返回所有公共知识库
        if include_public:
            logger.info("获取公共知识库")
            public_kbs = repo.get_public_knowledge_bases()
            logger.info(f"找到{len(public_kbs)}个公共知识库")
            return public_kbs
        
        return []
    except Exception as e:
        logger.error(f"获取知识库列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取知识库列表失败: {str(e)}")


# 管理员: 获取所有知识库
@router.get("/all", response_model=List[KnowledgeBaseResponse])
async def get_all_knowledge_bases(
    db: Session = Depends(get_db)
):
    """获取所有知识库（管理员专用）"""
    try:
        logger.info("获取所有知识库")
        repo = KnowledgeRepository(db)
        all_kbs = repo.get_all_knowledge_bases()
        logger.info(f"找到{len(all_kbs)}个知识库")
        return all_kbs
    except Exception as e:
        logger.error(f"获取所有知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取所有知识库失败: {str(e)}")


# 公共: 获取所有公共知识库
@router.get("/public", response_model=List[KnowledgeBaseResponse])
async def get_public_knowledge_bases(db: Session = Depends(get_db)):
    """获取所有公共知识库"""
    try:
        logger.info("获取公共知识库")
        repo = KnowledgeRepository(db)
        public_kbs = repo.get_public_knowledge_bases()
        logger.info(f"找到{len(public_kbs)}个公共知识库")
        return public_kbs
    except Exception as e:
        logger.error(f"获取公共知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取公共知识库失败: {str(e)}")


# 用户: 获取用户的个人知识库
@router.get("/user/{user_id}", response_model=List[KnowledgeBaseResponse])
async def get_user_knowledge_bases(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """获取指定用户的个人知识库"""
    try:
        # 检查权限
        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="没有权限访问该用户的知识库")
            
        logger.info(f"获取用户{user_id}的个人知识库")
        repo = KnowledgeRepository(db)
        user_kbs = repo.get_user_knowledge_bases(user_id)
        logger.info(f"找到{len(user_kbs)}个个人知识库")
        return user_kbs
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取用户知识库失败: {str(e)}")


# 获取知识库详情
@router.get("/{kb_id}", response_model=KnowledgeBaseDetail)
async def get_knowledge_base_details(
    kb_id: str,
    db: Session = Depends(get_db)
):
    """获取知识库详情"""
    try:
        logger.info(f"获取知识库详情: {kb_id}")
        repo = KnowledgeRepository(db)
        kb = repo.get_knowledge_base_by_id(kb_id)
        
        if not kb:
            logger.warning(f"知识库不存在: {kb_id}")
            raise HTTPException(status_code=404, detail="知识库不存在")
        
        # 获取知识库下的所有文档
        documents = repo.get_documents_by_kb_id(kb_id)
        logger.info(f"知识库{kb_id}包含{len(documents)}个文档")
        
        # 构造响应数据
        result = KnowledgeBaseDetail.from_orm(kb)
        result.documents = [KnowledgeDocumentResponse.from_orm(doc) for doc in documents]
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取知识库详情失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取知识库详情失败: {str(e)}")


# 创建新知识库
@router.post("", response_model=KnowledgeBaseResponse)
async def create_knowledge_base(
    kb_data: KnowledgeBaseCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """创建新知识库"""
    try:
        logger.info(f"创建新知识库: {kb_data.name}, 类型: {kb_data.type}")
        repo = KnowledgeRepository(db)
        
        # 创建知识库
        if kb_data.type == "personal" and not kb_data.user_id:
            # 测试阶段: 如果没有提供用户ID，使用默认管理员
            admin = repo.get_user_by_username_or_email("admin")
            if admin:
                logger.info(f"使用默认管理员ID: {admin.id}")
                kb_data.user_id = admin.id
            else:
                logger.warning("未找到默认管理员")
        
        kb = repo.create_knowledge_base(kb_data)
        logger.info(f"知识库创建成功: {kb.id}")
        return kb
    except Exception as e:
        logger.error(f"创建知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"创建知识库失败: {str(e)}")


# 更新知识库
@router.put("/{kb_id}", response_model=KnowledgeBaseResponse)
async def update_knowledge_base(
    kb_id: str,
    kb_data: KnowledgeBaseCreate,
    db: Session = Depends(get_db)
):
    """更新知识库信息"""
    try:
        logger.info(f"更新知识库: {kb_id}")
        repo = KnowledgeRepository(db)
        kb = repo.get_knowledge_base_by_id(kb_id)
        
        if not kb:
            logger.warning(f"知识库不存在: {kb_id}")
            raise HTTPException(status_code=404, detail="知识库不存在")
        
        # 不允许更改知识库类型
        if kb_data.type != kb.type:
            logger.warning(f"尝试更改知识库类型: {kb.type} -> {kb_data.type}")
            raise HTTPException(status_code=400, detail="不允许更改知识库类型")
        
        # 更新知识库
        updated_kb = repo.update_knowledge_base(kb_id, kb_data.dict())
        if not updated_kb:
            logger.error(f"更新知识库失败: {kb_id}")
            raise HTTPException(status_code=500, detail="更新知识库失败")
        
        logger.info(f"知识库更新成功: {kb_id}")
        return updated_kb
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"更新知识库失败: {str(e)}")


# 删除知识库
@router.delete("/{kb_id}")
async def delete_knowledge_base(
    kb_id: str,
    db: Session = Depends(get_db)
):
    """删除知识库"""
    try:
        logger.info(f"删除知识库: {kb_id}")
        repo = KnowledgeRepository(db)
        kb = repo.get_knowledge_base_by_id(kb_id)
        
        if not kb:
            logger.warning(f"知识库不存在: {kb_id}")
            raise HTTPException(status_code=404, detail="知识库不存在")
        
        # 删除知识库下的所有文档文件
        docs = repo.get_documents_by_kb_id(kb_id)
        logger.info(f"删除知识库{kb_id}下的{len(docs)}个文档")
        
        for doc in docs:
            if os.path.exists(doc.file_path):
                try:
                    os.remove(doc.file_path)
                except Exception as e:
                    logger.warning(f"删除文件失败: {doc.file_path}, 错误: {str(e)}")
            
            # 删除向量文件
            if hasattr(doc, 'embedding_file') and doc.embedding_file and os.path.exists(doc.embedding_file):
                try:
                    os.remove(doc.embedding_file)
                except Exception as e:
                    logger.warning(f"删除向量文件失败: {doc.embedding_file}, 错误: {str(e)}")
        
        # 删除知识库
        success = repo.delete_knowledge_base(kb_id)
        
        if not success:
            logger.error(f"删除知识库失败: {kb_id}")
            raise HTTPException(status_code=500, detail="删除知识库失败")
        
        logger.info(f"知识库删除成功: {kb_id}")
        return {"message": "知识库已成功删除"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除知识库失败: {str(e)}")


# 上传文档到知识库
@router.post("/{kb_id}/document", response_model=KnowledgeDocumentResponse)
async def upload_document(
    kb_id: str,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上传文档到知识库"""
    try:
        logger.info(f"上传文档到知识库: {kb_id}, 标题: {title}")
        repo = KnowledgeRepository(db)
        kb = repo.get_knowledge_base_by_id(kb_id)
        
        if not kb:
            logger.warning(f"知识库不存在: {kb_id}")
            raise HTTPException(status_code=404, detail="知识库不存在")
        
        # 获取文件扩展名并检查是否支持
        file_extension = os.path.splitext(file.filename)[1].lower() if file.filename else ""
        logger.info(f"文件类型: {file_extension}")
        
        # 生成唯一文件名并保存文件
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        logger.info(f"保存文件到: {file_path}")
        
        try:
            # 保存上传的文件
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # 创建文档记录
            doc_data = KnowledgeDocumentCreate(
                title=title,
                file_path=file_path,
                kb_id=kb_id,
                status="processing"  # 初始状态为处理中
            )
            
            doc = repo.create_document(doc_data)
            logger.info(f"文档创建成功: {doc.id}")
            
            # 添加异步处理任务
            task_manager = get_task_manager()
            task_id = task_manager.add_document_task(doc.id)
            logger.info(f"添加文档处理任务: {task_id}")
            
            # 清除相关缓存
            clear_cache(f"get_knowledge_base_details:{kb_id}")
            
            return doc
        
        except Exception as e:
            # 如果出错，删除已上传的文件
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logger.warning(f"上传失败，删除文件: {file_path}")
                except:
                    pass
            raise e
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传文档失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"上传文档失败: {str(e)}")


# 获取文档详情
@router.get("/document/{doc_id}", response_model=KnowledgeDocumentResponse)
async def get_document(
    doc_id: str,
    db: Session = Depends(get_db)
):
    """获取文档详情"""
    try:
        logger.info(f"获取文档详情: {doc_id}")
        repo = KnowledgeRepository(db)
        doc = repo.get_document_by_id(doc_id)
        
        if not doc:
            logger.warning(f"文档不存在: {doc_id}")
            raise HTTPException(status_code=404, detail="文档不存在")
        
        return doc
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取文档详情失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取文档详情失败: {str(e)}")


# 删除文档
@router.delete("/document/{doc_id}")
async def delete_document(
    doc_id: str,
    db: Session = Depends(get_db)
):
    """删除文档"""
    try:
        logger.info(f"删除文档: {doc_id}")
        repo = KnowledgeRepository(db)
        doc = repo.get_document_by_id(doc_id)
        
        if not doc:
            logger.warning(f"文档不存在: {doc_id}")
            raise HTTPException(status_code=404, detail="文档不存在")
        
        # 删除文件
        if os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
                logger.info(f"已删除文件: {doc.file_path}")
            except Exception as e:
                logger.warning(f"删除文件失败: {doc.file_path}, 错误: {str(e)}")
        
        # 删除向量文件
        if hasattr(doc, 'embedding_file') and doc.embedding_file and os.path.exists(doc.embedding_file):
            try:
                os.remove(doc.embedding_file)
                logger.info(f"已删除向量文件: {doc.embedding_file}")
            except Exception as e:
                logger.warning(f"删除向量文件失败: {doc.embedding_file}, 错误: {str(e)}")
        
        # 删除数据库记录
        success = repo.delete_document(doc_id)
        
        if not success:
            logger.error(f"删除文档记录失败: {doc_id}")
            raise HTTPException(status_code=500, detail="删除文档失败")
        
        # 清除相关缓存
        clear_cache(f"get_knowledge_base_details:{doc.kb_id}")
        
        logger.info(f"文档删除成功: {doc_id}")
        return {"message": "文档已成功删除"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除文档失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"删除文档失败: {str(e)}")


# 获取任务状态
@router.get("/task/{task_id}")
async def get_task_status(
    task_id: str,
    db: Session = Depends(get_db)
):
    """获取任务状态"""
    try:
        logger.info(f"获取任务状态: {task_id}")
        task_manager = get_task_manager()
        task = task_manager.get_task_status(task_id)
        
        if not task:
            logger.warning(f"任务不存在: {task_id}")
            raise HTTPException(status_code=404, detail="任务不存在")
        
        return task
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取任务状态失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取任务状态失败: {str(e)}")


# 获取待处理任务列表
@router.get("/tasks/pending")
async def get_pending_tasks():
    """获取待处理任务列表"""
    try:
        logger.info("获取待处理任务列表")
        task_manager = get_task_manager()
        tasks = task_manager.get_pending_tasks()
        logger.info(f"找到{len(tasks)}个待处理任务")
        return tasks
    except Exception as e:
        logger.error(f"获取待处理任务列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取待处理任务列表失败: {str(e)}")


# 获取最近任务列表
@router.get("/tasks/recent")
async def get_recent_tasks(limit: int = Query(10, ge=1, le=50)):
    """获取最近任务列表"""
    try:
        logger.info(f"获取最近任务列表, limit={limit}")
        task_manager = get_task_manager()
        tasks = task_manager.get_recent_tasks(limit)
        logger.info(f"找到{len(tasks)}个最近任务")
        return tasks
    except Exception as e:
        logger.error(f"获取最近任务列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"获取最近任务列表失败: {str(e)}")


# 手动触发文档处理
@router.post("/document/{doc_id}/process")
async def process_document(
    doc_id: str,
    db: Session = Depends(get_db)
):
    """手动触发文档处理"""
    try:
        logger.info(f"手动触发文档处理: {doc_id}")
        repo = KnowledgeRepository(db)
        doc = repo.get_document_by_id(doc_id)
        
        if not doc:
            logger.warning(f"文档不存在: {doc_id}")
            raise HTTPException(status_code=404, detail="文档不存在")
        
        # 添加处理任务
        task_manager = get_task_manager()
        task_id = task_manager.add_document_task(doc.id)
        logger.info(f"添加文档处理任务: {task_id}")
        
        return {"message": "文档处理任务已添加", "task_id": task_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"触发文档处理失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"触发文档处理失败: {str(e)}")


# 手动触发向量化
@router.post("/document/{doc_id}/embed")
async def embed_document(
    doc_id: str,
    db: Session = Depends(get_db)
):
    """手动触发文档向量化"""
    try:
        logger.info(f"手动触发文档向量化: {doc_id}")
        repo = KnowledgeRepository(db)
        doc = repo.get_document_by_id(doc_id)
        
        if not doc:
            logger.warning(f"文档不存在: {doc_id}")
            raise HTTPException(status_code=404, detail="文档不存在")
        
        # 检查文档状态
        if doc.status != "completed":
            logger.warning(f"文档未处理完成: {doc_id}, 状态: {doc.status}")
            raise HTTPException(status_code=400, detail="文档尚未处理完成，无法进行向量化")
        
        # 添加向量化任务
        task_manager = get_task_manager()
        task_id = task_manager.add_embedding_task(doc.id)
        logger.info(f"添加文档向量化任务: {task_id}")
        
        return {"message": "文档向量化任务已添加", "task_id": task_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"触发文档向量化失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"触发文档向量化失败: {str(e)}")


# 搜索知识库
@router.get("/{kb_id}/search")
async def search_knowledge_base(
    kb_id: str,
    query: str = Query(..., min_length=1),
    top_k: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """在知识库中搜索相关内容"""
    try:
        logger.info(f"搜索知识库: {kb_id}, 查询: {query}, top_k: {top_k}")
        repo = KnowledgeRepository(db)
        kb = repo.get_knowledge_base_by_id(kb_id)
        
        if not kb:
            logger.warning(f"知识库不存在: {kb_id}")
            raise HTTPException(status_code=404, detail="知识库不存在")
        
        # 调用向量搜索服务
        embedding_service = get_embedding_service()
        results = await embedding_service.search_similar_documents(query, [kb_id], top_k)
        logger.info(f"搜索结果: {len(results) if isinstance(results, list) else '非列表结果'}")
        
        return results
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"搜索知识库失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"搜索知识库失败: {str(e)}") 