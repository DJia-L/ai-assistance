from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import os
import uuid
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
import logging
import json
import time
from fastapi.responses import JSONResponse

# 导入数据库依赖
from app.models.database import get_db
from app.repositories.conversation_repository import ConversationRepository
from app.models.conversation import Conversation, Message, ConversationCreate, ConversationResponse, MessageCreate
from app.models.user import User
from app.models.knowledge_base import KnowledgeBase
from app.api.auth import get_current_user
from app.services.ai_dialog_service import get_ai_dialog_service

# 设置日志记录器
logger = logging.getLogger("api.ai_dialog")

# 定义路由 - 修改前缀以匹配前端请求
router = APIRouter(
    prefix="/api/ai",
    tags=["AI对话"],
    responses={404: {"description": "Not found"}},
)

# 请求和响应模型
class TextInputRequest(BaseModel):
    text: str
    user_id: str
    conversation_id: Optional[str] = None
    model_type: str = "deepseek"  # deepseek, ai_xiaorong, ai_xiaomi
    messages: Optional[List[Dict[str, Any]]] = None  # 消息格式：[{"role": "user"|"assistant"|"system", "content": "消息内容"}]
    use_knowledge_base: bool = False  # 是否使用知识库增强
    knowledge_base_id: Optional[str] = None

class DialogResponse(BaseModel):
    text: str
    model: str
    conversation_id: str
    success: bool
    knowledge_source: Optional[str] = None
    related_data: Optional[Dict[str, Any]] = None

class ModelOption(BaseModel):
    id: str
    name: str
    description: str

class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]

# 文本对话API - 修改路径以匹配前端请求
@router.post("/chat", response_model=DialogResponse)
async def dialog_with_text(
    request: TextInputRequest,
    db: Session = Depends(get_db)
):
    """
    处理文本输入，调用AI模型获取回复
    
    Args:
        request: 文本输入请求
        db: 数据库会话
        
    Returns:
        AI回复内容
    """
    try:
        # 获取当前时间作为开始时间
        start_time = time.time()
        
        # 记录请求信息
        logger = logging.getLogger("api.ai_dialog")
        logger.info(f"收到对话请求: user_id={request.user_id}, model={request.model_type}, 使用知识库={request.use_knowledge_base}")
        
        # 创建服务和存储库实例
        service = get_ai_dialog_service()
        repo = ConversationRepository(db)
        
        # 设置超时时间
        timeout = 120  # 120秒超时
        
        # 使用asyncio.wait_for来控制超时
        try:
            response = await asyncio.wait_for(
                service.process_text_input(
                    text=request.text,
                    user_id=request.user_id,
                    conversation_id=request.conversation_id,
                    model_type=request.model_type,
                    messages=request.messages,
                    use_knowledge_base=request.use_knowledge_base
                ),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            logger.error(f"AI响应超时 (>{timeout}秒)")
            return JSONResponse(
                status_code=408,
                content={
                    "success": False,
                    "error": f"AI响应超时，请稍后重试或尝试更短的问题",
                    "status_code": 408
                }
            )
            
        # 计算响应时间
        response_time = time.time() - start_time
        logger.info(f"AI响应时间: {response_time:.2f}秒")
        
        # 保存对话记录
        try:
            # 提取必要的字段
            text = response.get("text", "")
            model_type = request.model_type
            conversation_id = response.get("conversation_id", request.conversation_id)
            
            # 构建当前对话的消息
            current_messages = []
            if request.messages:
                current_messages = request.messages.copy()
            
            # 添加当前用户消息和AI回复
            current_messages.append({"role": "user", "content": request.text})
            current_messages.append({"role": "assistant", "content": text})
            
            # 保存到数据库
            conversation = await repo.save_conversation(
                user_id=request.user_id,
                model_type=model_type,
                messages=current_messages,
                conversation_id=conversation_id
            )
            saved_conversation_id = conversation.id
        except Exception as e:
            logger.error(f"保存对话记录失败: {str(e)}")
            # 即使保存失败也返回AI响应
            saved_conversation_id = response.get("conversation_id", request.conversation_id)
            
        return {
            "success": True,
            "text": response.get("text", ""),
            "conversation_id": saved_conversation_id,
            "model": request.model_type
        }
        
    except Exception as e:
        logger.error(f"处理对话请求失败: {str(e)}")
        error_message = str(e)
        status_code = 500
        
        if "rate limit" in error_message.lower():
            status_code = 429
            error_message = "请求过于频繁，请稍后再试"
        elif "invalid api key" in error_message.lower():
            status_code = 401
            error_message = "AI服务认证失败"
        elif "context length" in error_message.lower():
            status_code = 413
            error_message = "对话内容过长，请尝试开始新的对话"
            
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "error": error_message,
                "status_code": status_code
            }
        )

# 获取用户对话历史
@router.get("/conversations", response_model=None)
async def get_conversations(
    user_id: Optional[str] = None,
    model_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户的对话历史
    """
    try:
        # 验证用户ID
        if user_id and user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="没有权限查看其他用户的对话")
            
        # 获取对话列表
        repo = ConversationRepository(db)
        conversations = repo.get_conversations(
            user_id=user_id or current_user.id,
            model_type=model_type
        )
        return conversations
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取对话列表失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 获取对话详情
@router.get("/conversations/{conversation_id}", response_model=None)
async def get_conversation(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取对话详情，包括所有消息
    """
    try:
        # 获取对话
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
            
        # 验证权限
        if conversation.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="没有权限查看该对话")
            
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取对话详情失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 更新对话
@router.put("/conversations/{conversation_id}", response_model=None)
async def update_conversation(
    conversation_id: str,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新对话信息，包括消息历史
    """
    try:
        # 获取对话
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="对话不存在")
            
        # 验证权限
        if conversation.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="没有权限更新该对话")
        
        # 如果传入了标题，更新标题
        if data.get('title'):
            conversation.title = data['title']
            
        # 处理消息更新
        if data.get('messages'):
            # 设置消息数量上限
            MAX_MESSAGES_PER_CONVERSATION = 100
            messages = data['messages']
            
            # 如果消息数量超过上限，只保留最新的消息
            if len(messages) > MAX_MESSAGES_PER_CONVERSATION:
                messages = messages[-MAX_MESSAGES_PER_CONVERSATION:]
                
            # 删除现有消息
            db.query(Message).filter(Message.conversation_id == conversation_id).delete()
            
            # 添加新消息
            for msg in messages:
                new_message = Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    role=msg['role'],
                    content=msg['content'],
                    created_at=datetime.now()
                )
                db.add(new_message)
            
        # 更新对话时间
        conversation.updated_at = datetime.now()
        db.commit()
            
        return {"status": "success", "message": "对话已更新"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新对话失败: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 删除指定对话
@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """
    删除特定对话
    """
    repo = ConversationRepository(db)
    result = repo.delete_conversation(conversation_id)
    
    if result:
        return {"success": True, "message": "对话已删除"}
    else:
        raise HTTPException(status_code=404, detail="未找到指定的对话")

# 清除用户所有对话
@router.delete("/conversations/user/{user_id}")
async def clear_user_conversations(
    user_id: str,
    model_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    清除用户的所有对话历史记录，可按模型类型清除
    """
    repo = ConversationRepository(db)
    count = repo.clear_user_conversations(user_id, model_type)
    
    if model_type:
        return {"success": True, "message": f"已清除{count}条 {model_type} 对话历史"}
    else:
        return {"success": True, "message": f"已清除{count}条对话历史"}

# 语音对话API
@router.post("/voice", response_model=DialogResponse)
async def dialog_with_voice(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    model_type: str = Form("deepseek"),
    conversation_id: Optional[str] = Form(None),
    audio_file: UploadFile = File(...)
):
    """
    基于语音的AI对话API
    """
    # 获取AI对话服务
    service = await get_ai_dialog_service()
    
    # 检查模型类型
    if model_type not in ["deepseek", "ai_xiaorong", "ai_xiaomi"]:
        raise HTTPException(status_code=400, detail="不支持的模型类型")
    
    # 保存上传的音频文件
    audio_dir = os.path.join(os.getcwd(), "temp", "audio")
    os.makedirs(audio_dir, exist_ok=True)
    
    # 生成唯一文件名
    file_extension = os.path.splitext(audio_file.filename)[1]
    temp_file_name = f"{uuid.uuid4()}{file_extension}"
    temp_file_path = os.path.join(audio_dir, temp_file_name)
    
    # 写入文件
    with open(temp_file_path, "wb") as buffer:
        content = await audio_file.read()
        buffer.write(content)
    
    # 处理语音对话
    response = await service.process_audio_input(
        audio_file_path=temp_file_path,
        user_id=user_id,
        conversation_id=conversation_id,
        model_type=model_type
    )
    
    # 添加后台任务清理临时文件
    def cleanup_temp_file():
        try:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
        except Exception as e:
            print(f"Failed to delete temp file: {e}")
    
    background_tasks.add_task(cleanup_temp_file)
    
    # 如果响应不成功
    if not response.get("success", False):
        error_detail = response.get("error", "语音对话处理失败")
        if isinstance(error_detail, dict):
            error_detail = json.dumps(error_detail, ensure_ascii=False)
        elif not isinstance(error_detail, str):
            error_detail = str(error_detail)
            
        raise HTTPException(
            status_code=500, 
            detail=error_detail
        )
    
    return response

# 获取可用的AI模型选项
@router.get("/models", response_model=List[ModelOption])
async def get_available_models():
    """
    获取系统支持的AI模型选项
    """
    models = [
        {
            "id": "deepseek",
            "name": "DeepSeek",
            "description": "基础大模型，提供通用AI对话能力"
        },
        {
            "id": "ai_xiaorong",
            "name": "AI小融",
            "description": "融媒体知识增强版，结合公有知识库，支持单位内部信息查询"
        },
        {
            "id": "ai_xiaomi",
            "name": "AI小秘",
            "description": "个人助理增强版，结合个人私有知识库，提供个性化规划和建议"
        }
    ]
    return models 