# 初始化app.services包
from .ai_dialog_service import get_ai_dialog_service
from .deepseek_service import get_deepseek_service

__all__ = ['get_ai_dialog_service', 'get_deepseek_service'] 