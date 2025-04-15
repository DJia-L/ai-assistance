# 融媒体AI助手系统 - 架构设计

## 系统架构概览

融媒体AI助手系统采用典型的三层架构设计：

1. **API层**：处理HTTP请求，进行参数验证和权限控制
2. **服务层**：实现业务逻辑，调用大模型API和数据处理
3. **数据层**：负责数据持久化和查询

![系统架构图](./architecture.png)

## 目录结构

```
backend/
├── app/                  # 应用主目录
│   ├── api/              # API路由定义
│   │   ├── auth.py       # 认证相关接口
│   │   ├── ai_dialog.py  # AI对话接口
│   │   ├── article_analysis.py  # 文章分析接口  
│   │   └── knowledge_base.py    # 知识库管理接口
│   ├── models/           # 数据模型定义
│   │   ├── user.py       # 用户模型
│   │   ├── conversation.py      # 对话模型
│   │   └── knowledge_base.py    # 知识库模型
│   ├── repositories/     # 数据访问层
│   │   ├── user_repository.py
│   │   ├── conversation_repository.py
│   │   └── knowledge_repository.py
│   ├── services/         # 业务服务层
│   │   ├── deepseek_service.py  # DeepSeek API调用
│   │   ├── ai_dialog_service.py # 对话服务
│   │   ├── document_processor.py # 文档处理
│   │   ├── embedding_service.py  # 向量嵌入服务
│   │   └── task_manager.py      # 任务管理器
│   ├── utils/            # 工具函数
│   └── main.py           # 应用入口
├── uploads/              # 上传文件存储
│   ├── documents/        # 文档存储
│   └── embeddings/       # 嵌入向量存储
├── docs/                 # 文档目录
├── requirements.txt      # 依赖列表
└── app.db                # SQLite数据库文件
```

## 核心模块说明

### 1. API层 (app/api/)

API层定义了RESTful接口，处理HTTP请求并调用相应的服务。主要模块包括：

- **auth.py**: 用户认证和授权
- **ai_dialog.py**: AI对话相关接口
- **article_analysis.py**: 文章分析和生成
- **knowledge_base.py**: 知识库管理接口

### 2. 服务层 (app/services/)

服务层实现核心业务逻辑，包括：

- **deepseek_service.py**: 封装对DeepSeek API的调用
- **ai_dialog_service.py**: 对话处理逻辑
- **document_processor.py**: 文档解析和处理
- **embedding_service.py**: 文本向量化
- **task_manager.py**: 异步任务管理

### 3. 数据层 (app/repositories/ & app/models/)

- **models/**: 定义数据模型和数据库表结构
- **repositories/**: 实现数据访问逻辑

## 技术栈详解

### Web框架

- **FastAPI**: 高性能异步API框架，支持自动API文档生成

### 数据库

- **SQLite**: 开发环境默认数据库
- **PostgreSQL**: 可选生产环境数据库
- **SQLAlchemy**: ORM框架，简化数据库操作

### AI能力

- **DeepSeek API**: 提供大模型能力，支持对话生成和内容创作
- **向量数据库**: 通过文本嵌入实现语义检索

### 认证与安全

- **JWT**: 基于令牌的用户认证
- **Passlib**: 密码哈希和验证
- **CORS中间件**: 跨域资源共享控制

### 异步处理

- **APScheduler**: 任务调度
- **asyncio**: 异步IO操作

## 数据流

1. **用户请求流程**:
   - 前端发送API请求 -> API路由处理 -> 服务层逻辑 -> 数据存储/检索 -> 响应返回

2. **知识库处理流程**:
   - 文档上传 -> 文档处理 -> 文本分块 -> 生成嵌入向量 -> 存储向量与元数据

3. **AI对话流程**:
   - 用户问题 -> 历史消息检索 -> (可选)知识库检索 -> 调用DeepSeek API -> 存储对话记录 -> 返回回复

## 扩展性考虑

系统设计考虑了以下扩展点：

1. **模型切换**: 服务层抽象使系统可以方便地切换不同的AI模型提供商
2. **数据库替换**: 通过ORM实现数据访问抽象，便于切换不同的数据库系统
3. **知识库扩展**: 支持添加不同类型的文档处理器和向量存储 