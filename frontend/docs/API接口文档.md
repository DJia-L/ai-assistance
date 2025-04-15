# 融媒体AI助手系统API接口文档

## 目录

- [基础信息](#基础信息)
- [认证方式](#认证方式)
- [AI对话](#ai对话)
- [语音交互](#语音交互) 
- [稿件分析](#稿件分析)
- [热点话题](#热点话题)
- [知识库管理](#知识库管理)
- [错误处理](#错误处理)

## 基础信息

- **基础URL**: `http://localhost:8000`
- **API版本**: v1
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

系统采用JWT（JSON Web Token）认证机制。所有需要认证的API都需要在HTTP请求头中包含授权令牌。

**请求头格式**:
```
Authorization: Bearer {token}
```

获取令牌流程:
1. 用户登录接口获取token
2. 将token添加到后续请求的Authorization头中

## AI对话

### 发送消息

请求AI模型进行对话交互。

**URL**: `/api/ai-dialog/send-message`

**方法**: POST

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| user_id | string | 是 | 用户ID |
| messages | array | 是 | 消息数组，包含对话历史 |
| model | string | 是 | 模型名称，可选值：'deepseek'、'airong'、'aimi' |
| use_knowledge_base | boolean | 否 | 是否使用知识库增强回答 |
| kb_id | string | 否 | 知识库ID，当use_knowledge_base为true时使用 |

**messages数组元素格式**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| role | string | 是 | 角色，可选值：'user'、'assistant'、'system' |
| content | string | 是 | 消息内容 |

**请求示例**:
```json
{
  "user_id": "user123",
  "messages": [
    {
      "role": "user",
      "content": "你好，请帮我分析一下这篇文章的主要观点"
    }
  ],
  "model": "deepseek",
  "use_knowledge_base": false
}
```

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.response | string | AI回复内容 |
| data.conversation_id | string | 对话ID |

**响应示例**:
```json
{
  "success": true,
  "message": "消息发送成功",
  "data": {
    "response": "你好！我很乐意帮你分析文章的主要观点。不过，你似乎还没有提供具体的文章内容。如果你能分享文章的内容或链接，我会对其进行详细分析，包括主要论点、支持证据和写作风格等方面。",
    "conversation_id": "conv_12345"
  }
}
```

### 获取用户对话历史

获取特定用户的对话历史记录。

**URL**: `/api/ai-dialog/conversations/{user_id}`

**方法**: GET

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| user_id | string | 是 | 用户ID |

**查询参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| model | string | 否 | 模型名称，筛选特定模型的对话 |
| limit | number | 否 | 返回结果数量限制，默认20 |
| offset | number | 否 | 结果偏移量，用于分页 |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | array | 对话列表 |

**data数组元素格式**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 对话ID |
| title | string | 对话标题 |
| messages | array | 消息数组 |
| created_at | string | 创建时间，ISO格式 |
| updated_at | string | 更新时间，ISO格式 |
| model | string | 使用的AI模型 |

**响应示例**:
```json
{
  "success": true,
  "message": "获取对话历史成功",
  "data": [
    {
      "id": "conv_12345",
      "title": "关于融媒体内容的讨论",
      "messages": [
        {
          "role": "user",
          "content": "如何提高短视频内容质量？",
          "timestamp": "2023-04-10T08:30:45Z"
        },
        {
          "role": "assistant",
          "content": "提高短视频内容质量可以从以下几个方面入手：...",
          "timestamp": "2023-04-10T08:30:50Z"
        }
      ],
      "created_at": "2023-04-10T08:30:45Z",
      "updated_at": "2023-04-10T08:30:50Z",
      "model": "deepseek"
    }
  ]
}
```

### 更新对话

更新对话信息，如标题或消息内容。

**URL**: `/api/ai-dialog/conversation/{conversation_id}`

**方法**: PUT

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| conversation_id | string | 是 | 对话ID |

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| title | string | 否 | 对话标题 |
| messages | array | 否 | 更新后的消息数组 |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 更新后的对话信息 |

### 删除对话

删除特定对话记录。

**URL**: `/api/ai-dialog/conversation/{conversation_id}`

**方法**: DELETE

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| conversation_id | string | 是 | 对话ID |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |

## 语音交互

### 语音转文本

将用户语音转换为文本。

**URL**: `/api/ai-dialog/voice/speech-to-text`

**方法**: POST

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- |  --- |
| audio | file | 是 | 音频文件，支持格式：mp3, wav, ogg |
| language | string | 否 | 语言代码，默认为'zh-CN' |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.text | string | 转换后的文本内容 |

### 文本转语音

将AI回复文本转换为语音。

**URL**: `/api/ai-dialog/voice/text-to-speech`

**方法**: POST

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| text | string | 是 | 要转换的文本内容 |
| voice_id | string | 否 | 语音ID，用于指定特定的声音风格 |
| language | string | 否 | 语言代码，默认为'zh-CN' |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |
| data.audio_url | string | 生成的音频文件URL |

## 稿件分析

### 内容分析

分析文章内容，提供质量评估和优化建议。

**URL**: `/api/article-analysis/content`

**方法**: POST

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| content | string | 是 | 文章内容 |
| title | string | 否 | 文章标题 |
| analysis_type | string | 否 | 分析类型，可选值：'general'、'seo'、'readability'，默认'general' |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 分析结果 |
| data.score | number | 内容质量评分（0-100） |
| data.summary | string | 内容摘要 |
| data.keywords | array | 关键词列表 |
| data.recommendations | array | 改进建议列表 |

### 稿件统计

获取用户稿件数量、热度等统计数据。

**URL**: `/api/article-analysis/stats`

**方法**: GET

**查询参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| user_id | string | 是 | 用户ID |
| start_date | string | 否 | 开始日期，格式：YYYY-MM-DD |
| end_date | string | 否 | 结束日期，格式：YYYY-MM-DD |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 统计数据 |
| data.total_articles | number | 文章总数 |
| data.total_views | number | 总浏览量 |
| data.average_engagement | number | 平均互动率 |
| data.platform_distribution | object | 各平台分发情况 |
| data.trend | array | 趋势数据（按日期） |

## 热点话题

### 获取热点话题

获取当前热点话题列表。

**URL**: `/api/hot-topics`

**方法**: GET

**查询参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| category | string | 否 | 话题类别，如'news'、'entertainment'、'tech' |
| limit | number | 否 | 返回结果数量限制，默认20 |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | array | 热点话题列表 |

**data数组元素格式**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 话题ID |
| title | string | 话题标题 |
| description | string | 话题描述 |
| heat_index | number | 热度指数 |
| trend | string | 趋势，可选值：'rising'、'falling'、'stable' |
| related_keywords | array | 相关关键词 |
| updated_at | string | 更新时间，ISO格式 |

### 话题分析

对特定话题进行深度分析。

**URL**: `/api/hot-topics/{topic_id}/analysis`

**方法**: GET

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| topic_id | string | 是 | 话题ID |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 分析数据 |
| data.summary | string | 话题摘要 |
| data.user_interest | object | 用户兴趣分析 |
| data.platform_distribution | object | 各平台分发情况 |
| data.content_suggestions | array | 内容创作建议 |

## 知识库管理

### 创建知识库

创建一个新的知识库。

**URL**: `/api/knowledge-base`

**方法**: POST

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| name | string | 是 | 知识库名称 |
| description | string | 否 | 知识库描述 |
| user_id | string | 是 | 用户ID |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 知识库信息 |
| data.id | string | 知识库ID |
| data.name | string | 知识库名称 |
| data.description | string | 知识库描述 |
| data.created_at | string | 创建时间，ISO格式 |

### 上传文档到知识库

将文档上传到指定知识库。

**URL**: `/api/knowledge-base/{kb_id}/documents`

**方法**: POST

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| kb_id | string | 是 | 知识库ID |

**请求参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| file | file | 是(与url二选一) | 文档文件，支持格式：pdf, doc, docx, txt |
| url | string | 是(与file二选一) | 网页URL |
| title | string | 否 | 文档标题，不提供时使用文件名或网页标题 |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 文档信息 |
| data.id | string | 文档ID |
| data.title | string | 文档标题 |
| data.status | string | 处理状态，可选值：'processing'、'completed'、'failed' |
| data.task_id | string | 处理任务ID，用于查询处理状态 |

### 获取知识库列表

获取用户的知识库列表。

**URL**: `/api/knowledge-base/list/{user_id}`

**方法**: GET

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| user_id | string | 是 | 用户ID |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | array | 知识库列表 |

**data数组元素格式**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 知识库ID |
| name | string | 知识库名称 |
| description | string | 知识库描述 |
| document_count | number | 包含的文档数量 |
| created_at | string | 创建时间，ISO格式 |
| updated_at | string | 更新时间，ISO格式 |

### 获取任务状态

查询文档处理任务的状态。

**URL**: `/api/tasks/{task_id}/status`

**方法**: GET

**URL参数**:

| 参数名 | 类型 | 必须 | 说明 |
| --- | --- | --- | --- |
| task_id | string | 是 | 任务ID |

**响应参数**:

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 任务信息 |
| data.id | string | 任务ID |
| data.status | string | 处理状态，可选值：'pending'、'processing'、'completed'、'failed' |
| data.progress | number | 处理进度（0-100） |
| data.error | string | 错误信息，仅在status为'failed'时有值 |

## 错误处理

### 错误码

| 状态码 | 错误码 | 说明 |
| --- | --- | --- |
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未授权，需要登录 |
| 403 | FORBIDDEN | 权限不足 |
| 404 | NOT_FOUND | 资源不存在 |
| 429 | TOO_MANY_REQUESTS | 请求频率超限 |
| 500 | INTERNAL_SERVER_ERROR | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  }
}
```

## 版本历史

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0.0 | 2025-01-01 | 初始版本 |
| v1.1.0 | 2025-03-15 | 增加知识库管理接口 |
| v1.2.0 | 2025-04-10 | 增加语音交互接口 |

---

文档最后更新日期：2025年4月14日 