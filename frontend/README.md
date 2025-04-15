# 融媒体AI助手系统前端

基于DeepSeek大模型的融媒体AI助手系统前端项目，为媒体工作者提供智能内容创作、分析和优化服务。

## 项目概述

融媒体AI助手系统是一个面向媒体行业的智能辅助工具，集成了DeepSeek大模型的智能对话、内容分析、创作辅助等多种功能，旨在提高媒体工作者的工作效率和内容质量。

![融媒体AI助手系统首页](https://placeholder-image.com/media-ai-assistant-frontend.png)

### 核心功能

- **多模型AI对话**：支持DeepSeek通用大模型、AI小融和AI小秘等多种AI模型
- **知识库增强**：支持上传和管理文档，增强AI的专业知识
- **稿件分析**：分析媒体内容的质量、传播价值和受众匹配度
- **热点话题**：挖掘当前热门话题，辅助内容创作和选题
- **智能编辑**：提供内容生成、优化和校对功能
- **语音交互**：支持语音输入和AI语音回复
- **用户画像**：分析用户特征，提供个性化内容推荐

## 快速开始

### 环境要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- 现代浏览器（Chrome, Firefox, Edge等）

### 安装步骤

1. 克隆代码仓库

```bash
git clone [仓库地址]
cd media-ai-assistant-frontend
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建`.env.local`文件，添加以下配置：

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_ENABLED=true
```

4. 启动开发服务器

```bash
npm run dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
media-ai-assistant-frontend/
├── src/                    # 源代码目录
│   ├── components/         # 组件
│   ├── pages/              # 页面
│   ├── config/             # 配置
│   ├── styles/             # 样式
│   ├── types/              # 类型定义
│   └── utils/              # 工具函数
├── docs/                   # 文档
├── public/                 # 静态资源
└── assets/                 # 其他资源
```

## 主要技术栈

- **React**: 用户界面库
- **Next.js**: React框架，提供SSR、路由等功能
- **TypeScript**: 类型安全的JavaScript超集
- **Ant Design**: UI组件库
- **Styled Components**: CSS-in-JS解决方案
- **Axios**: HTTP客户端

## 开发文档

详细的开发文档位于 `docs` 目录：

- [开发文档](./docs/开发文档.md) - 详细的项目开发说明
- [API接口文档](./docs/API接口文档.md) - 后端API接口说明
- [组件开发规范](./docs/组件开发规范.md) - 组件开发规范和最佳实践

## 贡献指南

1. Fork本仓库
2. 创建你的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 版本历史

- **v0.1.0** (2025-01-15): 初始版本，包含基本对话和分析功能
- **v0.2.0** (2025-02-28): 添加知识库管理和语音交互功能
- **v0.3.0** (2025-04-10): 添加用户画像和热点话题分析功能

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

项目维护团队 - [email@example.com](mailto:email@example.com)

项目链接: [https://github.com/your-org/media-ai-assistant-frontend](https://github.com/your-org/media-ai-assistant-frontend) 