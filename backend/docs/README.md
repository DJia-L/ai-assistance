# 融媒体AI助手系统 - 后端文档

## 项目概述

融媒体AI助手系统是一个基于DeepSeek大模型的智能媒体助手平台，为媒体工作者提供智能创作、内容分析和知识管理等功能。本项目是该系统的后端服务，提供API接口支持前端应用。

## 主要功能

1. **AI对话服务**：支持自然语言交互，为媒体工作者提供创作建议和内容分析
2. **知识库管理**：支持上传、管理和检索专业领域文档，增强AI响应的专业性
3. **文章分析**：提供文章内容分析、热点话题挖掘等功能
4. **媒体内容生成**：支持根据主题自动生成文章、视频脚本等内容

## 技术架构

- **框架**：FastAPI
- **大模型**：DeepSeek API
- **数据库**：SQLite / PostgreSQL
- **认证**：JWT认证
- **文档处理**：PDF、Word文档解析与向量化

## 快速开始

1. 克隆仓库
2. 安装依赖: `pip install -r requirements.txt`
3. 配置环境变量
4. 启动服务: `python -m app.main`

## 文档导航

- [架构设计](./architecture.md)
- [API参考](./api_reference.md)
- [部署指南](./deployment.md)
- [开发指南](./development.md)
- [Git代码仓库管理](./git_workflow.md)

## 环境要求

- Python 3.8+
- 操作系统: Windows/Linux/MacOS 