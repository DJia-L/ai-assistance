import functools
import json
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Tuple, Callable

# 配置日志
logger = logging.getLogger("utils.cache")

# 简单的内存缓存实现
_cache: Dict[str, Tuple[Any, datetime]] = {}

# 全局开关 - 临时禁用缓存
CACHE_ENABLED = False

# 不要缓存的端点列表
EXCLUDED_ENDPOINTS = [
    'process_text_input',    # AI对话处理
    'process_voice_input',   # 语音处理
    'send_message',          # 发送消息
    'ai_dialog',             # AI对话相关
    'knowledge_base'         # 知识库相关
]

def cache_result(ttl_seconds=300):
    """函数结果缓存装饰器
    
    参数:
        ttl_seconds: 缓存有效期（秒）
    
    返回:
        装饰后的函数
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # 如果缓存被全局禁用，直接执行函数
            if not CACHE_ENABLED:
                return await func(*args, **kwargs)
                
            # 检查函数名是否在排除列表中
            for excluded in EXCLUDED_ENDPOINTS:
                if excluded in func.__name__:
                    logger.info(f"跳过缓存: {func.__name__} (在排除列表中)")
                    return await func(*args, **kwargs)
            
            # 生成缓存键
            cache_key = f"{func.__name__}:{json.dumps(args)}:{json.dumps(str(kwargs))}"
            
            # 检查缓存中是否有结果
            if cache_key in _cache:
                result, timestamp = _cache[cache_key]
                if datetime.now() - timestamp < timedelta(seconds=ttl_seconds):
                    logger.info(f"从缓存获取结果: {cache_key}")
                    return result
            
            # 执行原始函数
            result = await func(*args, **kwargs)
            
            # 缓存结果
            _cache[cache_key] = (result, datetime.now())
            
            return result
        return wrapper
    return decorator

def clear_cache(pattern: str = None):
    """清除缓存
    
    参数:
        pattern: 可选，清除包含特定字符串的缓存键
    """
    global _cache
    if pattern:
        # 清除包含指定模式的缓存
        keys_to_delete = [key for key in _cache if pattern in key]
        for key in keys_to_delete:
            del _cache[key]
        logger.info(f"清除包含 '{pattern}' 的缓存，共 {len(keys_to_delete)} 项")
    else:
        # 清除所有缓存
        _cache = {}
        logger.info("清除所有缓存")

def get_cache_stats():
    """获取缓存统计信息"""
    return {
        "enabled": CACHE_ENABLED,
        "total_items": len(_cache),
        "keys": list(_cache.keys()),
        "memory_usage_estimate": sum(len(json.dumps(k)) + len(json.dumps(str(v[0]))) for k, v in _cache.items())
    } 