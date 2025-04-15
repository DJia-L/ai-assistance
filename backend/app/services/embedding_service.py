import os
import logging
import numpy as np
from typing import List, Dict, Any, Optional
import json
from app.repositories.knowledge_repository import KnowledgeRepository
from app.models.database import get_db
import pickle
import httpx
import asyncio

class EmbeddingService:
    """文本向量化服务，将文本转换为向量表示以便相似度搜索"""
    
    def __init__(self):
        self.logger = logging.getLogger("embedding_service")
        self.logger.info("Initialized Embedding Service")
        
        # 向量存储目录
        self.embedding_dir = os.path.join(os.getcwd(), "uploads", "embeddings")
        os.makedirs(self.embedding_dir, exist_ok=True)
        
        # 缓存最近使用的向量，提高查询性能
        self.embedding_cache = {}
        self.max_cache_size = 100  # 最多缓存的文档数
        
        # 使用DeepSeek Embedding API 
        self.api_url = "https://api.deepseek.com/v1/embeddings"
        self.api_key = os.environ.get("DEEPSEEK_API_KEY", "")
        
        # 文本分块大小
        self.chunk_size = 1000  # 每块字符数
        self.chunk_overlap = 200  # 重叠字符数

    async def process_document_embedding(self, doc_id: str) -> bool:
        """处理文档向量化"""
        try:
            # 获取数据库会话
            db = next(get_db())
            repo = KnowledgeRepository(db)
            
            # 获取文档信息
            doc = repo.get_document_by_id(doc_id)
            if not doc:
                self.logger.error(f"文档不存在: {doc_id}")
                return False
            
            # 检查文档是否已处理完成
            if doc.status != "completed":
                self.logger.error(f"文档尚未处理完成，无法进行向量化: {doc_id}")
                repo.update_document(doc_id, {"embedding_status": "failed", "embedding_error": "文档尚未处理完成"})
                return False
            
            # 检查文档内容
            if not hasattr(doc, 'content') or not doc.content:
                self.logger.error(f"文档内容为空，无法进行向量化: {doc_id}")
                repo.update_document(doc_id, {"embedding_status": "failed", "embedding_error": "文档内容为空"})
                return False
            
            # 更新文档状态为处理中
            repo.update_document(doc_id, {"embedding_status": "processing"})
            
            # 文本分块
            text_chunks = self._create_text_chunks(doc.content)
            
            # 生成向量
            try:
                chunk_embeddings = []
                for chunk in text_chunks:
                    embedding = await self._generate_embedding(chunk)
                    if embedding:
                        chunk_embeddings.append({
                            "text": chunk,
                            "embedding": embedding
                        })
                
                if not chunk_embeddings:
                    error_msg = "无法生成文档向量"
                    self.logger.error(error_msg)
                    repo.update_document(doc_id, {"embedding_status": "failed", "embedding_error": error_msg})
                    return False
                
                # 保存向量到文件
                embedding_file = os.path.join(self.embedding_dir, f"{doc_id}.pkl")
                with open(embedding_file, 'wb') as f:
                    pickle.dump(chunk_embeddings, f)
                
                # 更新文档状态为完成
                repo.update_document(doc_id, {
                    "embedding_status": "completed",
                    "embedding_file": embedding_file
                })
                
                self.logger.info(f"文档向量化成功: {doc_id}, 共{len(chunk_embeddings)}个文本块")
                return True
                
            except Exception as e:
                error_msg = f"向量化文档时出错: {str(e)}"
                self.logger.error(error_msg)
                self.logger.exception("向量化详细错误:")
                repo.update_document(doc_id, {"embedding_status": "failed", "embedding_error": error_msg})
                return False
                
        except Exception as e:
            self.logger.error(f"处理文档向量化服务出错: {str(e)}")
            self.logger.exception("详细错误:")
            return False
    
    def _create_text_chunks(self, text: str) -> List[str]:
        """将文本分成小块以便处理"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = min(start + self.chunk_size, len(text))
            
            # 如果不是在文本末尾，尝试找一个合适的分割点
            if end < len(text):
                # 优先在段落处切分
                paragraph_end = text.rfind('\n\n', start, end)
                if paragraph_end != -1 and paragraph_end > start + self.chunk_size // 2:
                    end = paragraph_end + 2  # 包含换行符
                else:
                    # 其次在句子处切分
                    sentence_end = max(
                        text.rfind('.', start, end),
                        text.rfind('!', start, end),
                        text.rfind('?', start, end),
                        text.rfind('\n', start, end)
                    )
                    if sentence_end != -1 and sentence_end > start + self.chunk_size // 2:
                        end = sentence_end + 1  # 包含句号
            
            # 添加文本块
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # 移动到下一个起始位置，考虑重叠
            start = end - self.chunk_overlap if end < len(text) else end
            
            # 避免无进展情况
            if start >= end:
                start = end
        
        return chunks
    
    async def _generate_embedding(self, text: str) -> Optional[List[float]]:
        """使用API生成文本向量"""
        if not self.api_key:
            self.logger.error("未设置API密钥，无法生成向量")
            return None
        
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            data = {
                "input": text,
                "model": "deepseek-embedding"
            }
            
            # 模拟API调用，实际中应该调用真实的API
            # 在开发阶段，可以生成随机向量代替真实API调用
            # 由于没有实际的API密钥，我们暂时使用随机向量
            if not self.api_key or self.api_key == "":
                self.logger.warning("使用随机向量代替真实API调用(开发环境)")
                return np.random.randn(1536).tolist()  # 模拟1536维向量
            
            # 实际API调用
            async with httpx.AsyncClient() as client:
                response = await client.post(self.api_url, json=data, headers=headers)
                result = response.json()
                
                if "data" in result and result["data"] and "embedding" in result["data"][0]:
                    return result["data"][0]["embedding"]
                else:
                    self.logger.error(f"API返回格式异常: {result}")
                    return None
                
        except Exception as e:
            self.logger.error(f"生成向量时出错: {str(e)}")
            self.logger.exception("详细错误:")
            return None
    
    async def search_similar_documents(self, query: str, kb_ids: List[str], top_k: int = 5) -> List[Dict[str, Any]]:
        """搜索与查询相似的文档内容"""
        try:
            # 获取数据库会话
            db = next(get_db())
            repo = KnowledgeRepository(db)
            
            # 获取查询向量
            query_embedding = await self._generate_embedding(query)
            if not query_embedding:
                self.logger.error("无法生成查询向量")
                return []
            
            results = []
            
            # 处理每个知识库
            for kb_id in kb_ids:
                # 获取知识库下的所有文档
                docs = repo.get_documents_by_kb_id(kb_id)
                
                # 过滤出已完成向量化的文档
                valid_docs = [doc for doc in docs if doc.embedding_status == "completed"]
                
                # 对每个文档计算相似度
                for doc in valid_docs:
                    if not hasattr(doc, 'embedding_file') or not doc.embedding_file:
                        continue
                    
                    # 加载文档向量
                    embedding_file = doc.embedding_file
                    
                    # 尝试从缓存中获取
                    if embedding_file in self.embedding_cache:
                        chunk_embeddings = self.embedding_cache[embedding_file]
                    else:
                        try:
                            with open(embedding_file, 'rb') as f:
                                chunk_embeddings = pickle.load(f)
                            
                            # 更新缓存
                            self.embedding_cache[embedding_file] = chunk_embeddings
                            
                            # 如果缓存过大，移除最早添加的项
                            if len(self.embedding_cache) > self.max_cache_size:
                                oldest_key = next(iter(self.embedding_cache))
                                del self.embedding_cache[oldest_key]
                                
                        except Exception as e:
                            self.logger.error(f"加载向量文件出错: {str(e)}")
                            continue
                    
                    # 计算每个文本块的相似度
                    similarities = []
                    for i, chunk_data in enumerate(chunk_embeddings):
                        chunk_text = chunk_data["text"]
                        chunk_embedding = chunk_data["embedding"]
                        
                        # 计算余弦相似度
                        similarity = self._cosine_similarity(query_embedding, chunk_embedding)
                        
                        similarities.append({
                            "chunk_index": i,
                            "text": chunk_text,
                            "similarity": similarity,
                            "doc_id": doc.id,
                            "doc_title": doc.title,
                            "kb_id": kb_id
                        })
                    
                    # 添加到结果中
                    results.extend(similarities)
            
            # 按相似度排序并获取top_k结果
            results.sort(key=lambda x: x["similarity"], reverse=True)
            return results[:top_k]
            
        except Exception as e:
            self.logger.error(f"搜索相似文档时出错: {str(e)}")
            self.logger.exception("详细错误:")
            return []
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """计算两个向量的余弦相似度"""
        try:
            vec1 = np.array(vec1)
            vec2 = np.array(vec2)
            
            dot_product = np.dot(vec1, vec2)
            norm_vec1 = np.linalg.norm(vec1)
            norm_vec2 = np.linalg.norm(vec2)
            
            if norm_vec1 == 0 or norm_vec2 == 0:
                return 0.0
                
            return dot_product / (norm_vec1 * norm_vec2)
        except Exception as e:
            self.logger.error(f"计算余弦相似度时出错: {str(e)}")
            return 0.0

# 创建全局实例
_embedding_service = EmbeddingService()

def get_embedding_service():
    """获取EmbeddingService实例"""
    return _embedding_service 