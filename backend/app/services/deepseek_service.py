import os
import json
from typing import Dict, List, Any, Optional
import asyncio
import logging
from dotenv import load_dotenv
import requests
import time
import httpx

# DeepSeek API客户端
class DeepSeekClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        # 根据官方文档设置正确的API URL
        self.base_url = "https://api.deepseek.com"  # 无需额外的 /v1 路径
        self.logger = logging.getLogger("deepseek_client")
        self.logger.info("初始化DeepSeek API客户端")
        self.logger.info(f"使用API基础URL: {self.base_url}")
        
        # 根据官方文档设置正确的请求头
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def chat_completion(self, messages: List[Dict[str, str]], model: str = "deepseek-chat") -> Dict[str, Any]:
        """调用DeepSeek聊天完成API"""
        try:
            # 根据官方文档使用正确的API路径和模型
            endpoint = "/v1/chat/completions"
            
            # 详细记录请求信息
            self.logger.info(f"准备调用DeepSeek API: {self.base_url}{endpoint}")
            self.logger.info(f"使用模型: {model}")
            self.logger.info(f"消息数量: {len(messages)}")
            self.logger.info(f"API密钥: {self.api_key[:5]}...{self.api_key[-5:]}")
            
            # 打印完整消息内容
            self.logger.info(f"消息内容: {json.dumps(messages, ensure_ascii=False)}")
            
            # 构建请求数据 - 完全按照官方示例的格式
            data = {
                "model": "deepseek-chat",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
                "stream": False
            }
            
            self.logger.info(f"发送请求体: {json.dumps(data, ensure_ascii=False)}")
            
            # 记录完整的请求URL和头信息
            self.logger.info(f"请求URL: {self.base_url}{endpoint}")
            self.logger.info(f"请求头: {json.dumps(self.headers, ensure_ascii=False)}")
            
            # 在异步函数中使用同步请求需要使用loop.run_in_executor
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(
                    f"{self.base_url}{endpoint}",
                    headers=self.headers,
                    json=data,
                    timeout=30
                )
            )
            
            self.logger.info(f"收到响应状态码: {response.status_code}")
            self.logger.info(f"响应头: {response.headers}")
            
            # 检查响应状态
            if response.status_code != 200:
                error_msg = f"API返回非200状态码: {response.status_code}"
                self.logger.error(error_msg)
                self.logger.error(f"响应内容: {response.text}")
                
                # 尝试解析错误响应
                try:
                    error_json = response.json()
                    # 确保错误消息是字符串格式
                    error_detail = json.dumps(error_json, ensure_ascii=False) if isinstance(error_json, dict) else str(error_json)
                    error_msg = f"API错误: {error_detail}"
                    self.logger.error(f"错误详情: {error_msg}")
                except:
                    error_msg = f"API错误: {response.text}"
                    self.logger.error(f"无法解析错误响应为JSON: {response.text}")
                
                # 返回格式化的错误信息
                return {
                    "error": True,
                    "message": error_msg,
                    "choices": [{
                        "message": {
                            "role": "assistant",
                            "content": f"抱歉，调用AI服务失败: {error_msg}"
                        }
                    }]
                }
            
            # 解析JSON响应
            response_json = response.json()
            self.logger.info(f"响应JSON完整内容: {json.dumps(response_json, ensure_ascii=False)}")
            
            # 处理成功响应
            if "choices" in response_json and len(response_json["choices"]) > 0:
                content = response_json["choices"][0]["message"]["content"]
                self.logger.info(f"成功获取响应内容: {content}")
            else:
                self.logger.warning(f"响应中没有choices字段或为空: {json.dumps(response_json, ensure_ascii=False)}")
            
            # 返回JSON数据
            return response_json
            
        except requests.exceptions.RequestException as e:
            error_msg = f"DeepSeek API请求失败: {str(e)}"
            self.logger.error(error_msg)
            # 记录详细错误信息
            self.logger.error(f"错误详情: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json() if e.response.text else {}
                    error_detail = json.dumps(error_detail, ensure_ascii=False)
                except:
                    error_detail = e.response.text[:500]
                self.logger.error(f"错误响应: {error_detail}")
            # 返回格式化的错误信息
            return {
                "error": True,
                "message": error_msg,
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": f"抱歉，连接AI服务失败: {error_msg}"
                    }
                }]
            }
        except Exception as e:
            self.logger.error(f"意外错误: {str(e)}")
            self.logger.exception("详细异常堆栈:")
            return {
                "error": True,
                "message": f"意外错误: {str(e)}",
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": f"抱歉，发生意外错误: {str(e)}"
                    }
                }]
            }

class DeepSeekService:
    """DeepSeek API服务客户端"""
    
    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "sk-08943f26f4374dc0b122f8ede6144b1d")
        self.api_base = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com")
        self.timeout = 120  # 增加超时时间到120秒
        self.logger = logging.getLogger("deepseek_service")
        self.logger.info("初始化DeepSeek服务")
        
        # 如果缺少API密钥，记录警告
        if not self.api_key:
            self.logger.warning("未设置DEEPSEEK_API_KEY环境变量，将使用默认响应")
    
    async def chat_with_deepseek(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        与DeepSeek API进行对话
        
        Args:
            messages: 消息列表，包含对话历史
            
        Returns:
            API响应
        """
        try:
            if not self.api_key:
                # 如果API密钥未设置，返回模拟响应
                self.logger.warning("未设置API密钥，返回模拟响应")
                return self._get_mock_response(messages)
            
            # API端点
            endpoint = f"{self.api_base}/v1/chat/completions"
            
            # 确保API请求头中的Bearer token格式正确
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key.strip()}" if self.api_key else ""
            }
            
            # API请求体
            payload = {
                "model": "deepseek-chat",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            self.logger.info(f"发送请求到DeepSeek API: {endpoint}")
            
            # 发送请求
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    endpoint,
                    headers=headers,
                    json=payload
                )
                
                # 检查响应状态
                if response.status_code != 200:
                    self.logger.error(f"DeepSeek API返回错误: 状态码={response.status_code}, 响应={response.text}")
                    return {
                        "success": False,
                        "error": f"API响应错误: {response.status_code}",
                        "status_code": response.status_code
                    }
                
                # 解析响应
                result = response.json()
                return result
                
        except Exception as e:
            self.logger.error(f"DeepSeek API异常: {str(e)}")
            return {
                "success": False,
                "error": "服务器内部错误",
                "status_code": 500
            }
    
    def _get_mock_response(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        生成模拟响应，用于API密钥未设置的情况
        
        Args:
            messages: 消息列表
            
        Returns:
            模拟的API响应
        """
        # 获取最后一条用户消息
        user_message = "Hello"
        for msg in reversed(messages):
            if msg["role"] == "user":
                user_message = msg["content"]
                break
        
        # 简单的模拟响应
        return {
            "id": "mock-response-id",
            "object": "chat.completion",
            "created": 1616268760,
            "model": "deepseek-chat",
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": f"这是一个模拟响应，因为未设置DeepSeek API密钥。您的消息是: {user_message}\n\n请配置正确的API密钥以连接到DeepSeek服务。"
                    },
                    "finish_reason": "stop"
                }
            ]
        }

# 单例服务
_deepseek_service = None

def get_deepseek_service() -> DeepSeekService:
    """获取DeepSeek服务单例"""
    global _deepseek_service
    if _deepseek_service is None:
        _deepseek_service = DeepSeekService()
    return _deepseek_service

    async def generate_article(self, topic: str, keywords: List[str], length: str = "medium") -> Dict[str, Any]:
        """生成文章内容"""
        prompt = f"""
        请根据以下信息生成一篇新闻稿：
        主题：{topic}
        关键词：{', '.join(keywords)}
        长度：{length}
        格式：请生成JSON格式，包含标题(title)、正文(content)、摘要(summary)和推荐标签(tags)
        """
        
        try:
            messages = [
                {"role": "system", "content": "你是一位专业的媒体内容创作助手，擅长创作新闻稿件、评论文章和各类媒体内容。"},
                {"role": "user", "content": prompt}
            ]
            response = await self.chat_with_deepseek(messages)
            
            # 解析响应
            content = response["choices"][0]["message"]["content"]
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                # 如果返回的不是有效JSON，进行简单处理
                return {
                    "title": "AI生成文章",
                    "content": content,
                    "summary": content[:100] + "...",
                    "tags": keywords
                }
                
        except Exception as e:
            self.logger.error(f"生成文章失败: {str(e)}")
            return {"error": f"生成文章失败: {str(e)}"}
    
    async def analyze_media_performance(self, content: str, platform: str) -> Dict[str, Any]:
        """分析媒体内容表现预测"""
        prompt = f"""
        请分析以下内容在{platform}平台的潜在表现：
        内容：{content[:500]}...
        
        请从以下几个方面进行分析并以JSON格式返回：
        1. 预计阅读完成率
        2. 预计互动率
        3. 传播潜力评分
        4. 改进建议
        """
        
        try:
            messages = [
                {"role": "system", "content": "你是一位专业的媒体数据分析专家，擅长预测内容表现和提供优化建议。"},
                {"role": "user", "content": prompt}
            ]
            response = await self.chat_with_deepseek(messages)
            
            # 解析响应
            content = response["choices"][0]["message"]["content"]
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                return {"error": "解析响应失败，返回格式不是有效的JSON"}
                
        except Exception as e:
            self.logger.error(f"分析媒体表现失败: {str(e)}")
            return {"error": f"分析媒体表现失败: {str(e)}"}
    
    async def generate_video_script(self, topic: str, duration: str = "3min") -> Dict[str, Any]:
        """生成视频脚本"""
        prompt = f"""
        请为以下主题生成一个视频脚本：
        主题：{topic}
        时长：{duration}
        
        请以JSON格式返回，包含以下字段：
        1. 标题(title)
        2. 场景列表(scenes)，每个场景包含: 场景描述(description)、台词/旁白(script)、建议镜头(shot)
        3. 配乐建议(music_suggestion)
        4. 目标受众(target_audience)
        """
        
        try:
            messages = [
                {"role": "system", "content": "你是一位专业的视频脚本撰写专家，擅长创作简洁有力、画面感强的视频内容。"},
                {"role": "user", "content": prompt}
            ]
            response = await self.chat_with_deepseek(messages)
            
            # 解析响应
            content = response["choices"][0]["message"]["content"]
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                return {"error": "解析响应失败，返回格式不是有效的JSON"}
                
        except Exception as e:
            self.logger.error(f"生成视频脚本失败: {str(e)}")
            return {"error": f"生成视频脚本失败: {str(e)}"}
    
    async def analyze_hot_topics(self) -> Dict[str, Any]:
        """分析热点话题"""
        prompt = """
        请基于当前的社会热点，分析并推荐适合媒体报道的热点话题。
        
        请以JSON格式返回，包含以下字段：
        1. 热点话题列表(topics)，每个话题包含: 话题名称(name)、热度评分(heat_score)、持续时间预测(duration)、适合平台(platforms)
        2. 话题关联分析(relations)
        3. 报道角度建议(angles)
        """
        
        try:
            messages = [
                {"role": "system", "content": "你是一位专业的媒体热点分析师，擅长发现和分析社会热点话题，并提供报道建议。"},
                {"role": "user", "content": prompt}
            ]
            response = await self.chat_with_deepseek(messages)
            
            # 解析响应
            content = response["choices"][0]["message"]["content"]
            try:
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                return {"error": "解析响应失败，返回格式不是有效的JSON"}
                
        except Exception as e:
            self.logger.error(f"分析热点话题失败: {str(e)}")
            return {"error": f"分析热点话题失败: {str(e)}"} 