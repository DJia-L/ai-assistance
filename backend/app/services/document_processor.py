import os
import logging
import tempfile
from typing import Optional, Dict, Any, List
import fitz  # PyMuPDF用于处理PDF
import docx  # python-docx用于处理DOCX
from pathlib import Path
import csv
import json
import chardet
from app.repositories.knowledge_repository import KnowledgeRepository
from app.models.database import get_db

class DocumentProcessor:
    """文档处理服务，用于从不同格式的文件中提取文本内容"""
    
    SUPPORTED_EXTENSIONS = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.csv': 'text/csv',
        '.json': 'application/json',
    }
    
    def __init__(self):
        self.logger = logging.getLogger("document_processor")
        self.logger.info("Initialized Document Processor Service")
    
    async def process_document(self, doc_id: str) -> bool:
        """处理文档，提取文本内容并保存到数据库"""
        try:
            # 获取数据库会话
            db = next(get_db())
            repo = KnowledgeRepository(db)
            
            # 获取文档信息
            doc = repo.get_document_by_id(doc_id)
            if not doc:
                self.logger.error(f"文档不存在: {doc_id}")
                return False
            
            # 检查文件是否存在
            if not os.path.exists(doc.file_path):
                self.logger.error(f"文件不存在: {doc.file_path}")
                # 更新文档状态为失败
                repo.update_document(doc_id, {"status": "failed", "error_message": "文件不存在"})
                return False
            
            # 获取文件扩展名
            file_extension = os.path.splitext(doc.file_path)[1].lower()
            
            # 检查文件类型是否支持
            if file_extension not in self.SUPPORTED_EXTENSIONS:
                error_msg = f"不支持的文件类型: {file_extension}"
                self.logger.error(error_msg)
                repo.update_document(doc_id, {"status": "failed", "error_message": error_msg})
                return False
            
            # 根据文件类型提取文本
            try:
                extracted_text = await self.extract_text(doc.file_path, file_extension)
                if not extracted_text:
                    error_msg = "无法从文档中提取文本内容"
                    self.logger.error(error_msg)
                    repo.update_document(doc_id, {"status": "failed", "error_message": error_msg})
                    return False
                
                # 更新文档内容和状态
                repo.update_document(doc_id, {
                    "content": extracted_text,
                    "status": "completed",
                    "embedding_status": "pending"  # 标记为待向量化
                })
                
                self.logger.info(f"文档处理成功: {doc_id}")
                return True
                
            except Exception as e:
                error_msg = f"处理文档时出错: {str(e)}"
                self.logger.error(error_msg)
                self.logger.exception("文档处理详细错误:")
                repo.update_document(doc_id, {"status": "failed", "error_message": error_msg})
                return False
                
        except Exception as e:
            self.logger.error(f"文档处理服务出错: {str(e)}")
            self.logger.exception("详细错误:")
            return False
    
    async def extract_text(self, file_path: str, file_extension: str) -> Optional[str]:
        """根据文件类型提取文本内容"""
        try:
            if file_extension == '.pdf':
                return await self._extract_pdf_text(file_path)
            elif file_extension in ['.docx']:
                return await self._extract_docx_text(file_path)
            elif file_extension == '.txt' or file_extension == '.md':
                return await self._extract_plain_text(file_path)
            elif file_extension == '.csv':
                return await self._extract_csv_text(file_path)
            elif file_extension == '.json':
                return await self._extract_json_text(file_path)
            else:
                self.logger.error(f"未实现的文件类型处理: {file_extension}")
                return None
        except Exception as e:
            self.logger.error(f"提取文本时出错: {str(e)}")
            self.logger.exception("提取文本详细错误:")
            return None
    
    async def _extract_pdf_text(self, file_path: str) -> str:
        """从PDF文件中提取文本"""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            self.logger.error(f"提取PDF文本时出错: {str(e)}")
            raise
    
    async def _extract_docx_text(self, file_path: str) -> str:
        """从DOCX文件中提取文本"""
        text = ""
        try:
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            self.logger.error(f"提取DOCX文本时出错: {str(e)}")
            raise
    
    async def _extract_plain_text(self, file_path: str) -> str:
        """从纯文本文件中提取文本"""
        try:
            # 检测文件编码
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                detected = chardet.detect(raw_data)
                encoding = detected['encoding'] or 'utf-8'
            
            # 使用检测到的编码打开文件
            with open(file_path, 'r', encoding=encoding) as f:
                return f.read()
        except Exception as e:
            self.logger.error(f"提取纯文本时出错: {str(e)}")
            raise
    
    async def _extract_csv_text(self, file_path: str) -> str:
        """从CSV文件中提取文本"""
        try:
            text = []
            # 检测文件编码
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                detected = chardet.detect(raw_data)
                encoding = detected['encoding'] or 'utf-8'
            
            with open(file_path, 'r', encoding=encoding, newline='') as f:
                reader = csv.reader(f)
                for row in reader:
                    text.append(','.join(row))
            return '\n'.join(text)
        except Exception as e:
            self.logger.error(f"提取CSV文本时出错: {str(e)}")
            raise
    
    async def _extract_json_text(self, file_path: str) -> str:
        """从JSON文件中提取文本"""
        try:
            # 检测文件编码
            with open(file_path, 'rb') as f:
                raw_data = f.read()
                detected = chardet.detect(raw_data)
                encoding = detected['encoding'] or 'utf-8'
            
            with open(file_path, 'r', encoding=encoding) as f:
                data = json.load(f)
            return json.dumps(data, ensure_ascii=False, indent=2)
        except Exception as e:
            self.logger.error(f"提取JSON文本时出错: {str(e)}")
            raise

# 创建全局实例
_document_processor = DocumentProcessor()

def get_document_processor():
    """获取DocumentProcessor实例"""
    return _document_processor 