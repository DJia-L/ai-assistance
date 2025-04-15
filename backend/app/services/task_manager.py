import asyncio
import logging
import time
from typing import Dict, Any, List, Optional, Callable
import uuid
import threading
from queue import Queue, Empty
from datetime import datetime
from app.services.document_processor import get_document_processor
from app.services.embedding_service import get_embedding_service

class TaskManager:
    """异步任务管理器，用于处理文档处理和向量化任务"""
    
    def __init__(self):
        self.logger = logging.getLogger("task_manager")
        self.logger.info("Initialized Task Manager")
        
        # 任务队列
        self.document_queue = Queue()
        self.embedding_queue = Queue()
        
        # 任务状态
        self.tasks = {}
        
        # 线程运行标志
        self.running = False
        
        # 初始化服务
        self.document_processor = get_document_processor()
        self.embedding_service = get_embedding_service()
    
    def start(self):
        """启动任务处理线程"""
        if self.running:
            return
        
        self.running = True
        
        # 启动文档处理线程
        self.document_thread = threading.Thread(
            target=self._document_worker,
            daemon=True
        )
        self.document_thread.start()
        
        # 启动向量化线程
        self.embedding_thread = threading.Thread(
            target=self._embedding_worker,
            daemon=True
        )
        self.embedding_thread.start()
        
        self.logger.info("Task Manager started")
    
    def stop(self):
        """停止任务处理线程"""
        self.running = False
        # 等待线程结束
        self.document_thread.join(timeout=2.0)
        self.embedding_thread.join(timeout=2.0)
        self.logger.info("Task Manager stopped")
    
    def add_document_task(self, doc_id: str) -> str:
        """添加文档处理任务"""
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = {
            "id": task_id,
            "type": "document_processing",
            "doc_id": doc_id,
            "status": "pending",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "completed_at": None,
            "error": None
        }
        
        # 添加到队列
        self.document_queue.put(task_id)
        self.logger.info(f"添加文档处理任务: {task_id} for doc_id: {doc_id}")
        
        return task_id
    
    def add_embedding_task(self, doc_id: str) -> str:
        """添加向量化任务"""
        task_id = str(uuid.uuid4())
        self.tasks[task_id] = {
            "id": task_id,
            "type": "document_embedding",
            "doc_id": doc_id,
            "status": "pending",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "completed_at": None,
            "error": None
        }
        
        # 添加到队列
        self.embedding_queue.put(task_id)
        self.logger.info(f"添加向量化任务: {task_id} for doc_id: {doc_id}")
        
        return task_id
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """获取任务状态"""
        return self.tasks.get(task_id)
    
    def get_pending_tasks(self) -> List[Dict[str, Any]]:
        """获取所有待处理任务"""
        return [task for task in self.tasks.values() 
                if task["status"] in ["pending", "processing"]]
    
    def get_recent_tasks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取最近的任务"""
        tasks_list = list(self.tasks.values())
        tasks_list.sort(key=lambda x: x["created_at"], reverse=True)
        return tasks_list[:limit]
    
    def _document_worker(self):
        """文档处理工作线程"""
        self.logger.info("Document processor worker started")
        
        while self.running:
            try:
                # 从队列获取任务，最多等待1秒
                try:
                    task_id = self.document_queue.get(timeout=1)
                except Empty:
                    continue
                
                # 获取任务详情
                task = self.tasks.get(task_id)
                if not task:
                    self.logger.error(f"任务不存在: {task_id}")
                    continue
                
                # 更新任务状态
                task["status"] = "processing"
                task["updated_at"] = datetime.now()
                
                # 调用文档处理服务
                doc_id = task["doc_id"]
                self.logger.info(f"开始处理文档: {doc_id}")
                
                # 创建事件循环运行异步任务
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                success = loop.run_until_complete(
                    self.document_processor.process_document(doc_id)
                )
                loop.close()
                
                # 更新任务状态
                if success:
                    task["status"] = "completed"
                    task["completed_at"] = datetime.now()
                    
                    # 文档处理成功后，自动添加向量化任务
                    self.add_embedding_task(doc_id)
                else:
                    task["status"] = "failed"
                    task["error"] = "文档处理失败"
                
                task["updated_at"] = datetime.now()
                self.logger.info(f"文档处理任务完成: {task_id}, 状态: {task['status']}")
                
            except Exception as e:
                self.logger.error(f"文档处理线程出错: {str(e)}")
                self.logger.exception("详细错误:")
                
                # 如果有活动任务，标记为失败
                if 'task_id' in locals() and 'task' in locals():
                    task["status"] = "failed"
                    task["error"] = str(e)
                    task["updated_at"] = datetime.now()
    
    def _embedding_worker(self):
        """向量化工作线程"""
        self.logger.info("Embedding worker started")
        
        while self.running:
            try:
                # 从队列获取任务，最多等待1秒
                try:
                    task_id = self.embedding_queue.get(timeout=1)
                except Empty:
                    continue
                
                # 获取任务详情
                task = self.tasks.get(task_id)
                if not task:
                    self.logger.error(f"任务不存在: {task_id}")
                    continue
                
                # 更新任务状态
                task["status"] = "processing"
                task["updated_at"] = datetime.now()
                
                # 调用向量化服务
                doc_id = task["doc_id"]
                self.logger.info(f"开始向量化文档: {doc_id}")
                
                # 创建事件循环运行异步任务
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                success = loop.run_until_complete(
                    self.embedding_service.process_document_embedding(doc_id)
                )
                loop.close()
                
                # 更新任务状态
                if success:
                    task["status"] = "completed"
                    task["completed_at"] = datetime.now()
                else:
                    task["status"] = "failed"
                    task["error"] = "向量化失败"
                
                task["updated_at"] = datetime.now()
                self.logger.info(f"向量化任务完成: {task_id}, 状态: {task['status']}")
                
            except Exception as e:
                self.logger.error(f"向量化线程出错: {str(e)}")
                self.logger.exception("详细错误:")
                
                # 如果有活动任务，标记为失败
                if 'task_id' in locals() and 'task' in locals():
                    task["status"] = "failed"
                    task["error"] = str(e)
                    task["updated_at"] = datetime.now()

# 创建全局实例
_task_manager = TaskManager()

def get_task_manager():
    """获取TaskManager实例"""
    return _task_manager

# 启动任务管理器
def start_task_manager():
    """启动任务管理器"""
    _task_manager.start()
    return _task_manager 