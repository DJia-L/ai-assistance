# 融媒体AI助手系统 - API参考文档

本文档提供融媒体AI助手系统后端API的详细说明。所有API采用RESTful风格设计，返回JSON格式数据。

## 基础信息

- **基础URL**: `http://localhost:8000`（本地开发环境）
- **认证方式**: JWT令牌认证，在请求头中添加 `Authorization: Bearer {token}`
- **默认响应格式**: JSON

## 状态码说明

| 状态码 | 描述 |
|-------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 408 | 请求超时 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## API列表

### 1. 认证与用户管理 API

#### 1.1 用户注册

- **URL**: `/api/auth/register`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "example_user",
    "email": "user@example.com",
    "password": "secure_password",
    "full_name": "Example User"
  }
  ```
- **响应**:
  ```json
  {
    "id": "user_uuid",
    "username": "example_user",
    "email": "user@example.com",
    "full_name": "Example User",
    "is_active": true,
    "is_admin": false,
    "created_at": "2023-01-01T00:00:00Z"
  }
  ```

#### 1.2 用户登录

- **URL**: `/api/auth/login`
- **方法**: POST
- **请求体**:
  ```json
  {
    "username": "example_user",
    "password": "secure_password"
  }
  ```
- **响应**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "user_uuid",
      "username": "example_user",
      "email": "user@example.com",
      "full_name": "Example User",
      "is_admin": false
    }
  }
  ```

#### 1.3 获取当前用户信息

- **URL**: `/api/auth/me`
- **方法**: GET
- **认证**: 需要
- **响应**:
  ```json
  {
    "id": "user_uuid",
    "username": "example_user",
    "email": "user@example.com",
    "full_name": "Example User",
    "is_active": true,
    "is_admin": false,
    "created_at": "2023-01-01T00:00:00Z"
  }
  ```

### 2. AI对话 API

#### 2.1. 发送对话请求

- **URL**: `/api/ai/chat`
- **方法**: POST
- **认证**: 需要
- **请求体**:
  ```json
  {
    "text": "用户输入的文本",
    "user_id": "user_uuid",
    "conversation_id": "conv_uuid",  // 可选，新对话不需要
    "model_type": "deepseek",
    "use_knowledge_base": false,
    "knowledge_base_id": null  // 可选，使用知识库时需要
  }
  ```
- **响应**:
  ```json
  {
    "text": "AI回复的文本内容",
    "model": "deepseek",
    "conversation_id": "conv_uuid",
    "success": true,
    "knowledge_source": null,  // 使用知识库时会包含引用源
    "related_data": null
  }
  ```

#### 2.2 获取用户对话列表

- **URL**: `/api/ai/conversations?user_id={user_id}&model_type={model_type}`
- **方法**: GET
- **认证**: 需要
- **参数**:
  - `user_id`: 用户ID (可选)
  - `model_type`: 模型类型 (可选)
- **响应**:
  ```json
  [
    {
      "id": "conv_uuid",
      "title": "对话标题",
      "user_id": "user_uuid",
      "model_type": "deepseek",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:10:00Z",
      "message_count": 10
    }
  ]
  ```

#### 2.3 获取对话详情

- **URL**: `/api/ai/conversations/{conversation_id}`
- **方法**: GET
- **认证**: 需要
- **响应**:
  ```json
  {
    "id": "conv_uuid",
    "title": "对话标题",
    "user_id": "user_uuid",
    "model_type": "deepseek",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:10:00Z",
    "messages": [
      {
        "id": "msg_uuid",
        "role": "user",
        "content": "用户消息",
        "created_at": "2023-01-01T00:00:00Z"
      },
      {
        "id": "msg_uuid",
        "role": "assistant",
        "content": "AI回复",
        "created_at": "2023-01-01T00:00:10Z"
      }
    ]
  }
  ```

### 3. 知识库 API

#### 3.1 获取知识库列表

- **URL**: `/api/kb?include_public=true`
- **方法**: GET
- **认证**: 需要
- **参数**:
  - `include_public`: 是否包含公共知识库 (默认true)
- **响应**:
  ```json
  [
    {
      "id": "kb_uuid",
      "name": "知识库名称",
      "description": "知识库描述",
      "type": "public",
      "user_id": "user_uuid",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z",
      "document_count": 5
    }
  ]
  ```

#### 3.2 创建知识库

- **URL**: `/api/kb`
- **方法**: POST
- **认证**: 需要
- **请求体**:
  ```json
  {
    "name": "知识库名称",
    "description": "知识库详细描述",
    "type": "personal",  // personal 或 public
    "user_id": "user_uuid"
  }
  ```
- **响应**:
  ```json
  {
    "id": "kb_uuid",
    "name": "知识库名称",
    "description": "知识库描述",
    "type": "personal",
    "user_id": "user_uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z"
  }
  ```

#### 3.3 获取知识库详情

- **URL**: `/api/kb/{kb_id}`
- **方法**: GET
- **认证**: 需要
- **响应**:
  ```json
  {
    "id": "kb_uuid",
    "name": "知识库名称",
    "description": "知识库描述",
    "type": "public",
    "user_id": "user_uuid",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2023-01-01T00:00:00Z",
    "documents": [
      {
        "id": "doc_uuid",
        "title": "文档标题",
        "file_name": "example.pdf",
        "file_size": 1024,
        "file_type": "application/pdf",
        "status": "processed",
        "created_at": "2023-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### 3.4 上传文档到知识库

- **URL**: `/api/kb/{kb_id}/document`
- **方法**: POST
- **认证**: 需要
- **请求体**: multipart/form-data
  - `title`: 文档标题
  - `file`: 文件
- **响应**:
  ```json
  {
    "id": "doc_uuid",
    "kb_id": "kb_uuid",
    "title": "文档标题",
    "file_name": "example.pdf",
    "file_path": "/uploads/documents/doc_uuid.pdf",
    "file_size": 1024,
    "file_type": "application/pdf",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00Z",
    "task_id": "task_uuid"
  }
  ```

#### 3.5 搜索知识库

- **URL**: `/api/kb/{kb_id}/search?query=搜索关键词&top_k=5`
- **方法**: GET
- **认证**: 需要
- **参数**:
  - `query`: 搜索关键词
  - `top_k`: 返回结果数量
- **响应**:
  ```json
  {
    "results": [
      {
        "document_id": "doc_uuid",
        "document_title": "文档标题",
        "content": "匹配的内容片段...",
        "score": 0.85,
        "metadata": {
          "page": 1,
          "source": "example.pdf"
        }
      }
    ],
    "query": "搜索关键词"
  }
  ```

### 4. 文章分析 API

#### 4.1 生成文章

- **URL**: `/api/article/generate`
- **方法**: POST
- **认证**: 需要
- **请求体**:
  ```json
  {
    "topic": "文章主题",
    "keywords": ["关键词1", "关键词2"],
    "length": "medium",  // short, medium, long
    "user_id": "user_uuid"
  }
  ```
- **响应**:
  ```json
  {
    "article_id": "article_uuid",
    "title": "生成的文章标题",
    "content": "生成的文章内容...",
    "summary": "文章摘要",
    "word_count": 1000,
    "keywords": ["关键词1", "关键词2"],
    "created_at": "2023-01-01T00:00:00Z"
  }
  ```

#### 4.2 分析文章

- **URL**: `/api/article/analyze`
- **方法**: POST
- **认证**: 需要
- **请求体**:
  ```json
  {
    "content": "待分析的文章内容...",
    "user_id": "user_uuid"
  }
  ```
- **响应**:
  ```json
  {
    "analysis_id": "analysis_uuid",
    "summary": "文章摘要",
    "keywords": ["关键词1", "关键词2"],
    "sentiment": "positive",
    "readability": "medium",
    "word_count": 1000,
    "topics": ["主题1", "主题2"],
    "suggestions": ["建议1", "建议2"]
  }
  ```

## 错误响应格式

所有API错误响应使用统一格式：

```json
{
  "success": false,
  "error": "错误描述信息",
  "status_code": 400
}
```

## 实用工具与端点

### 1. 健康检查

- **URL**: `/api/health`
- **方法**: GET
- **认证**: 不需要
- **响应**:
  ```json
  {
    "status": "healthy"
  }
  ```

### 2. 任务状态查询

- **URL**: `/api/kb/task/{task_id}`
- **方法**: GET
- **认证**: 需要
- **响应**:
  ```json
  {
    "task_id": "task_uuid",
    "status": "completed",  // pending, processing, completed, failed
    "progress": 100,
    "message": "处理完成",
    "result": {...}
  }
  ``` 