# 融媒体AI助手系统 - 开发指南

本文档为融媒体AI助手系统后端的开发者提供详细的开发指南，包括环境设置、代码规范和常见开发任务的操作方法。

## 开发环境配置

### 推荐工具

- **IDE**: Visual Studio Code 或 PyCharm
- **API测试工具**: Postman 或 Insomnia
- **版本控制**: Git
- **数据库工具**: DBeaver 或 SQLite Browser

### 本地开发环境设置

1. 克隆代码库
   ```bash
   git clone [repository_url]
   cd backend
   ```

2. 创建虚拟环境
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/macOS
   source venv/bin/activate
   ```

3. 安装开发依赖
   ```bash
   pip install -r requirements.txt
   pip install pytest pytest-cov flake8 black isort
   ```

4. 配置环境变量
   创建`.env`文件，填入必要的环境变量：
   ```
   APP_ENV=development
   SECRET_KEY=dev_secret_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

5. 启动开发服务器
   ```bash
   python -m app.main
   ```

## 项目结构和模块说明

### 核心模块

- **app/api/**: 所有API路由定义
  - `auth.py`: 用户认证接口
  - `ai_dialog.py`: AI对话接口
  - `article_analysis.py`: 文章分析接口
  - `knowledge_base.py`: 知识库管理接口

- **app/models/**: 数据模型定义
  - `user.py`: 用户模型
  - `conversation.py`: 对话模型
  - `knowledge_base.py`: 知识库模型

- **app/services/**: 业务逻辑层
  - `deepseek_service.py`: DeepSeek API调用服务
  - `ai_dialog_service.py`: 对话处理服务
  - `document_processor.py`: 文档处理服务
  - `embedding_service.py`: 文本嵌入服务
  - `task_manager.py`: 后台任务管理

- **app/repositories/**: 数据访问层
  - `user_repository.py`: 用户数据操作
  - `conversation_repository.py`: 对话数据操作
  - `knowledge_repository.py`: 知识库数据操作

- **app/utils/**: 工具函数

## 代码规范

### Python编码规范

项目遵循PEP 8编码规范，并使用以下工具确保代码质量：

- **black**: 代码格式化
- **flake8**: 代码质量检查
- **isort**: 导入排序

### 命名约定

- **文件名**: 使用小写字母和下划线，如`user_repository.py`
- **类名**: 使用CamelCase，如`UserRepository`
- **方法名**: 使用小写字母和下划线，如`get_user_by_id`
- **变量名**: 使用小写字母和下划线，如`user_id`
- **常量**: 使用大写字母和下划线，如`MAX_MESSAGE_LENGTH`

### 注释规范

所有函数和方法应包含DocString，说明功能、参数和返回值：

```python
def get_user_by_id(user_id: str) -> User:
    """
    通过ID获取用户信息
    
    Args:
        user_id: 用户ID
        
    Returns:
        User对象，如果找不到则返回None
    """
    # 实现代码
```

## 常见开发任务

### 1. 添加新的API接口

1. 在适当的API模块中定义新接口:

```python
@router.post("/new_endpoint")
async def new_endpoint(
    request_data: RequestModel,
    db: Session = Depends(get_db)
):
    """新接口说明"""
    # 实现代码
    return {"result": "success"}
```

2. 如果需要创建新的API模块，遵循以下步骤:
   - 在`app/api/`目录下创建新的Python文件
   - 定义`router`对象
   - 在`app/main.py`中注册路由

### 2. 添加新的数据模型

1. 在`app/models/`目录中创建或修改数据模型文件:

```python
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.database import Base

class NewModel(Base):
    __tablename__ = "new_models"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    # 其他字段...
```

2. 在`app/models/__init__.py`中导入新模型，确保系统启动时创建表

### 3. 添加新的服务

1. 在`app/services/`目录中创建新服务文件:

```python
class NewService:
    def __init__(self):
        # 初始化服务
        
    async def service_method(self, param1, param2):
        # 实现方法
        
# 获取服务实例的工厂函数
def get_new_service() -> NewService:
    return NewService()
```

2. 在需要使用该服务的地方导入和使用:

```python
from app.services.new_service import get_new_service

@router.get("/endpoint")
async def endpoint():
    service = get_new_service()
    result = await service.service_method(param1, param2)
    return {"result": result}
```

### 4. 添加数据库迁移

如果需要修改数据库结构，建议手动执行以下步骤:

1. 备份现有数据库
2. 修改模型定义
3. 使用SQLAlchemy的`create_all()`创建新表或字段

**注意**: 项目当前未使用自动迁移工具，重要变更需谨慎测试

## 测试

### 单元测试

使用pytest进行单元测试:

```bash
# 运行所有测试
pytest

# 运行特定测试文件
pytest test_api.py

# 生成测试覆盖率报告
pytest --cov=app
```

### 测试策略

- **API测试**: 测试API接口的功能和异常处理
- **服务测试**: 测试服务层的业务逻辑
- **模型测试**: 测试数据模型的CRUD操作

测试用例应该覆盖:
- 正常操作路径
- 边界条件和异常情况
- 权限控制

## 调试技巧

### 日志调试

系统使用标准Python日志模块，可以添加日志进行调试:

```python
import logging

logger = logging.getLogger("app.module_name")
logger.debug("调试信息")
logger.info("一般信息")
logger.warning("警告信息")
logger.error("错误信息")
```

### API调试

可以使用FastAPI的自动生成文档进行API调试:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 常见问题解答

### Q: 如何处理大文件上传?

A: 系统使用分块上传处理大文件，详见`knowledge_base.py`中的文件上传接口。

### Q: 如何添加新的AI模型支持?

A: 在`deepseek_service.py`中添加新的API调用方法，然后在`ai_dialog_service.py`中添加相应的处理逻辑。

### Q: 如何优化数据库查询性能?

A: 对于频繁访问的数据，考虑添加索引或使用缓存层。确保查询只获取需要的字段。

## 贡献指南

### 分支管理

- `main`: 主分支，包含稳定版本
- `develop`: 开发分支，新功能合并到此分支
- 功能分支: 从`develop`分支创建，命名为`feature/feature-name`
- 修复分支: 从`main`分支创建，命名为`hotfix/issue-description`

### 提交规范

提交信息应遵循以下格式:

```
[类型]: 简短描述

详细描述（可选）
```

类型包括:
- feat: 新功能
- fix: 修复bug
- docs: 文档变更
- style: 代码风格变更（不影响功能）
- refactor: 代码重构
- test: 添加测试
- chore: 构建过程或辅助工具变动

### 代码审查

所有代码变更应通过Pull Request进行，并至少由一名其他开发者审查。

## 性能优化建议

1. **数据库优化**:
   - 为频繁查询的字段添加索引
   - 使用批量操作代替循环单条操作

2. **API优化**:
   - 实现分页机制，限制返回数据量
   - 使用异步处理长时间运行的任务

3. **AI调用优化**:
   - 实现模型响应缓存
   - 设置合理的超时和重试策略 