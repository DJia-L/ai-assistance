import os
import json
import uuid
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.services.deepseek_service import get_deepseek_service
from app.repositories.knowledge_repository import KnowledgeRepository
from app.services.embedding_service import get_embedding_service
import time

# 不再使用内存存储对话历史，使用数据库
# conversation_history = {}

class AIDialogService:
    def __init__(self):
        self.logger = logging.getLogger("ai_dialog_service")
        self.logger.info("Initialized AI Dialog Service")
        self.deepseek_service = get_deepseek_service()
        self.embedding_service = get_embedding_service()
    
    async def process_text_input(
        self, 
        text: str, 
        user_id: str, 
        conversation_id: str = None, 
        model_type: str = "deepseek",
        messages: List[Dict[str, Any]] = None,
        use_knowledge_base: bool = False
    ) -> Dict[str, Any]:
        """处理文本输入，调用AI模型获取回复"""
        try:
            # 确保用户ID存在
            if not user_id:
                user_id = "anonymous-" + str(int(time.time()))
            
            # 确保conversation_id存在
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            # 构建消息历史，包括系统提示
            api_messages = []
            
            # 添加系统提示
            if model_type == "deepseek":
                system_prompt = "你是一个由DeepSeek开发的AI助手，擅长回答各种问题，请提供准确、有帮助的回答。"
            elif model_type == "ai_xiaorong":
                system_prompt = "你是融媒体AI助手小融，擅长分析媒体内容、热点话题和数据，帮助媒体工作者提高工作效率。"
            elif model_type == "ai_xiaomi":
                system_prompt = "你是个人AI助手小秘，能够帮助用户处理日常任务、回答问题和提供个性化建议。"
            else:
                system_prompt = "你是一个AI助手，请用简洁、准确的方式回答问题。"
            
            api_messages.append({"role": "system", "content": system_prompt})
            
            # 使用前端传递的消息历史(如果有)
            if messages and len(messages) > 0:
                self.logger.info(f"使用前端传递的消息历史，共{len(messages)}条消息")
                # 添加前端传来的消息，但跳过可能的系统消息，以使用我们自己的系统提示
                for msg in messages:
                    if msg["role"] != "system":  # 跳过系统消息
                        api_messages.append(msg)
            else:
                # 如果没有历史消息，只添加当前用户问题
                self.logger.info("未收到消息历史，只使用当前消息")
                api_messages.append({"role": "user", "content": text})
            
            # 如果启用了知识库增强，查询相关知识
            knowledge_source = None
            if use_knowledge_base:
                knowledge_context, knowledge_source = await self.query_knowledge_base(text, user_id, model_type)
                if knowledge_context:
                    # 如果找到了相关知识，插入到倒数第二条消息之前
                    system_prompt = api_messages[0]["content"]
                    updated_system_prompt = f"{system_prompt}\n\n参考以下知识回答问题：\n{knowledge_context}"
                    api_messages[0]["content"] = updated_system_prompt
                    self.logger.info(f"找到相关知识，已添加到系统提示: {knowledge_source}")
            
            # 调用DeepSeek服务获取回复
            self.logger.info(f"调用DeepSeek服务，对话ID: {conversation_id}")
            self.logger.info(f"发送消息历史: {json.dumps(api_messages, ensure_ascii=False)}")
            response = await self.deepseek_service.chat_with_deepseek(api_messages)
            
            # 记录完整响应日志
            self.logger.info(f"DeepSeek API完整响应: {json.dumps(response, ensure_ascii=False)}")
            
            # 检查是否有错误
            if "success" in response and response["success"] == False:
                error_message = response.get("error", "未知错误")
                self.logger.error(f"AI服务返回错误: {error_message}")
                
                return {
                    "text": f"抱歉，AI服务暂时不可用: {error_message}",
                    "model": model_type,
                    "conversation_id": conversation_id,
                    "success": False,
                    "knowledge_source": None
                }
            
            # 提取AI回复内容
            if "choices" in response and len(response["choices"]) > 0:
                ai_message = response["choices"][0]["message"]
                ai_content = ai_message["content"]
                
                self.logger.info(f"从API提取到的AI回复: {ai_content}")
                
                # 返回成功响应
                return {
                    "text": ai_content,
                    "model": model_type,
                    "conversation_id": conversation_id,
                    "success": True,
                    "knowledge_source": knowledge_source
                }
            else:
                # API返回格式异常
                error_message = "API返回格式异常，无法获取AI回复"
                self.logger.error(f"{error_message}: {json.dumps(response, ensure_ascii=False)}")
                
                return {
                    "text": "抱歉，无法获取AI的回复。请稍后再试。",
                    "model": model_type,
                    "conversation_id": conversation_id,
                    "success": False,
                    "knowledge_source": None
                }
        except Exception as e:
            # 改进错误处理，提供更清晰的错误消息
            error_message = str(e)
            self.logger.error(f"处理请求时出错: {error_message}")
            self.logger.exception("详细堆栈跟踪:")
            
            # 格式化错误消息
            user_message = "抱歉，系统暂时无法处理您的请求。"
            if "connection" in error_message.lower():
                user_message += "网络连接出现问题，请稍后再试。"
            elif "timeout" in error_message.lower():
                user_message += "请求超时，请稍后重试。"
            else:
                user_message += "请稍后再试。"
            
            return {
                "text": user_message,
                "model": model_type,
                "conversation_id": conversation_id if conversation_id else str(uuid.uuid4()),
                "success": False,
                "knowledge_source": None
            }
    
    async def query_knowledge_base(self, query: str, user_id: str, model_type: str) -> tuple:
        """查询知识库获取与问题相关的内容"""
        try:
            from app.models.database import get_db
            db = next(get_db())
            repo = KnowledgeRepository(db)
            
            self.logger.info(f"查询知识库: 用户={user_id}, 模型={model_type}, 查询={query}")
            
            # 根据模型类型决定查询哪些知识库
            kb_list = []
            if model_type == "ai_xiaorong":
                # 公共知识库，所有用户共享
                public_kbs = repo.get_public_knowledge_bases()
                kb_list.extend(public_kbs)
                self.logger.info(f"查询公共知识库, 数量: {len(public_kbs)}")
            elif model_type == "ai_xiaomi":
                # 个人知识库，只看用户自己的
                personal_kbs = repo.get_user_knowledge_bases(user_id)
                kb_list.extend(personal_kbs)
                self.logger.info(f"查询个人知识库, 用户: {user_id}, 数量: {len(personal_kbs)}")
            
            # 如果没有知识库，直接返回
            if not kb_list:
                self.logger.info("没有找到可用的知识库")
                return None, None
            
            # 收集所有知识库的ID
            kb_ids = [kb.id for kb in kb_list]
            
            # 使用向量搜索获取相关文档内容
            try:
                # 调用向量搜索服务
                search_results = await self.embedding_service.search_similar_documents(query, kb_ids, top_k=3)
                
                if not search_results:
                    self.logger.info("没有找到相关内容")
                    return None, None
                
                # 提取搜索结果的上下文
                contexts = []
                knowledge_source_info = None
                
                for result in search_results:
                    # 获取知识库名称
                    kb = next((kb for kb in kb_list if kb.id == result["kb_id"]), None)
                    kb_name = kb.name if kb else "未知知识库"
                    
                    # 提取文本和相似度
                    context = {
                        "title": result["doc_title"],
                        "context": result["text"],
                        "kb_name": kb_name,
                        "similarity": result["similarity"]
                    }
                    contexts.append(context)
                    
                    # 记录第一个找到的知识来源
                    if not knowledge_source_info:
                        knowledge_source_info = f"{kb_name} - {result['doc_title']}"
                
                # 构建知识上下文
                if contexts:
                    knowledge_context = "\n\n".join([
                        f"来源: {r['kb_name']} - {r['title']}\n{r['context']}"
                        for r in contexts
                    ])
                    
                    self.logger.info(f"找到相关知识: {len(contexts)}条")
                    return knowledge_context, knowledge_source_info
                
                self.logger.info("没有找到相关上下文")
                return None, None
                
            except Exception as e:
                self.logger.error(f"向量搜索出错: {str(e)}")
                self.logger.exception("向量搜索详细错误:")
                
                # 当向量搜索失败时，尝试使用简单文本搜索作为后备方案
                results = []
                knowledge_source_info = None
                
                for kb in kb_list:
                    docs = repo.search_documents(kb.id, query)
                    if docs:
                        # 提取最相关的部分
                        for doc in docs:
                            # 提取匹配到查询的上下文
                            context = ""
                            if hasattr(doc, 'content') and doc.content:
                                query_index = doc.content.lower().find(query.lower())
                                if query_index >= 0:
                                    # 提取更大的上下文
                                    start = max(0, query_index - 300)
                                    end = min(len(doc.content), query_index + len(query) + 300)
                                    context = doc.content[start:end]
                                else:
                                    # 如果找不到确切匹配，使用文档的前500个字符
                                    context = doc.content[:500]
                            
                            if context:
                                results.append({
                                    "title": doc.title,
                                    "context": context,
                                    "kb_name": kb.name
                                })
                                
                                # 记录第一个找到的知识来源
                                if not knowledge_source_info:
                                    knowledge_source_info = f"{kb.name} - {doc.title}"
                
                # 如果有搜索结果，构建知识上下文
                if results:
                    # 取最相关的前3个结果
                    top_results = results[:3]
                    knowledge_context = "\n\n".join([
                        f"来源: {r['kb_name']} - {r['title']}\n{r['context']}"
                        for r in top_results
                    ])
                    
                    self.logger.info(f"通过文本搜索找到相关知识: {len(top_results)}条")
                    return knowledge_context, knowledge_source_info
                
                self.logger.info("没有找到相关知识")
                return None, None
            
        except Exception as e:
            self.logger.error(f"查询知识库出错: {str(e)}")
            self.logger.exception("知识库查询详细错误:")
            return None, None
    
    async def process_audio_input(
        self, 
        audio_file_path: str, 
        user_id: str, 
        conversation_id: Optional[str] = None, 
        model_type: str = "deepseek"
    ) -> Dict[str, Any]:
        """处理语音输入，转换为文本后返回AI回复"""
        self.logger.info(f"Processing audio input from file: {audio_file_path} for user: {user_id}")
        
        # 模拟语音转文本，实际应用中应调用真实的语音识别API
        simulated_text = "这是一段模拟的语音转文本结果"
        
        # 调用文本处理方法
        return await self.process_text_input(simulated_text, user_id, conversation_id, model_type)

# 创建服务实例
_service_instance = None

def get_ai_dialog_service():
    """获取AI对话服务的单例实例"""
    global _service_instance
    if _service_instance is None:
        _service_instance = AIDialogService()
    return _service_instance 