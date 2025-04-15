# 从实际实现导入服务
from app.services.ai_dialog_service import get_ai_dialog_service

# 重新导出，保持导入兼容性
__all__ = ['get_ai_dialog_service'] 