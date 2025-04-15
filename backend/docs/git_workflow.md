# 融媒体AI助手系统 - Git代码仓库管理指南

本文档提供融媒体AI助手系统后端项目的Git代码仓库管理指南，包括分支策略、提交规范和常用操作流程。

## 仓库结构

```
backend/                    # 后端项目根目录
├── .git/                   # Git仓库元数据
├── .github/                # GitHub配置文件(如有)
│   └── workflows/          # GitHub Actions工作流配置
├── app/                    # 应用主目录
├── docs/                   # 文档目录
├── uploads/                # 上传文件目录(不纳入版本控制)
├── tests/                  # 测试代码目录
├── .gitignore              # Git忽略文件配置
├── .env.example            # 环境变量示例文件
└── README.md               # 项目说明文档
```

## 分支管理策略

项目采用"Git Flow"分支模型进行管理：

### 主要分支

- **main**: 主分支，包含稳定的生产版本代码
- **develop**: 开发分支，包含最新的开发版本代码

### 辅助分支

- **feature/xxx**: 功能分支，用于开发新功能
- **bugfix/xxx**: 修复分支，用于修复开发中的bug
- **hotfix/xxx**: 热修复分支，用于修复生产环境的紧急问题
- **release/x.x.x**: 发布分支，用于准备版本发布

## 工作流程

### 1. 功能开发流程

1. 从`develop`分支创建新的功能分支
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/new-feature-name
   ```

2. 在功能分支上进行开发
   ```bash
   # 进行代码修改
   git add .
   git commit -m "feat: 添加新功能"
   ```

3. 定期从`develop`分支同步最新代码
   ```bash
   git checkout develop
   git pull
   git checkout feature/new-feature-name
   git merge develop
   # 解决合并冲突(如有)
   ```

4. 功能完成后，创建Pull Request合并到`develop`分支
   - 提交PR前运行测试确保代码质量
   - 至少需要一名团队成员审核通过
   - 确保CI/CD流水线通过所有检查

5. 合并后删除功能分支
   ```bash
   git checkout develop
   git pull
   git branch -d feature/new-feature-name
   ```

### 2. 版本发布流程

1. 从`develop`分支创建发布分支
   ```bash
   git checkout develop
   git pull
   git checkout -b release/x.x.x
   ```

2. 在发布分支上进行最终测试和修复
   ```bash
   # 修复发现的问题
   git add .
   git commit -m "fix: 修复发布问题"
   ```

3. 版本准备就绪后，合并到`main`和`develop`分支
   ```bash
   # 合并到main
   git checkout main
   git merge release/x.x.x
   git tag -a vx.x.x -m "版本x.x.x发布"
   git push origin main --tags
   
   # 合并到develop
   git checkout develop
   git merge release/x.x.x
   git push origin develop
   ```

4. 删除发布分支
   ```bash
   git branch -d release/x.x.x
   ```

### 3. 热修复流程

1. 从`main`分支创建热修复分支
   ```bash
   git checkout main
   git pull
   git checkout -b hotfix/issue-description
   ```

2. 修复问题
   ```bash
   # 修复紧急问题
   git add .
   git commit -m "fix: 修复紧急问题"
   ```

3. 修复完成后，合并到`main`和`develop`分支
   ```bash
   # 合并到main并创建标签
   git checkout main
   git merge hotfix/issue-description
   git tag -a vx.x.x+1 -m "热修复x.x.x+1"
   git push origin main --tags
   
   # 合并到develop
   git checkout develop
   git merge hotfix/issue-description
   git push origin develop
   ```

4. 删除热修复分支
   ```bash
   git branch -d hotfix/issue-description
   ```

## 提交规范

项目采用Angular风格的提交消息规范：

```
<类型>[可选作用域]: <描述>

[可选正文]

[可选脚注]
```

### 提交类型

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档变更
- **style**: 代码样式调整（不影响代码功能）
- **refactor**: 代码重构（不新增功能也不修复bug）
- **perf**: 性能优化
- **test**: 添加或修改测试代码
- **chore**: 构建过程或辅助工具的变动

### 提交示例

```
feat(auth): 添加用户登录验证功能

- 添加JWT认证逻辑
- 集成用户密码加密

Closes #123
```

## 版本管理

项目使用语义化版本（Semantic Versioning）进行版本管理：

- **主版本号**: 不兼容的API变更
- **次版本号**: 向下兼容的功能新增
- **修订号**: 向下兼容的问题修复

示例: 1.0.0, 1.1.0, 1.1.1

## Git操作最佳实践

### 1. 保持提交小而集中

每个提交应只包含一个逻辑变更，便于代码审核和问题排查。

### 2. 编写有意义的提交消息

提交消息应清晰描述变更内容，而不仅仅是做了什么。

### 3. 经常合并主分支

定期从主分支（develop）同步代码，减少合并冲突的风险。

### 4. 在推送前进行本地测试

确保代码在本地通过所有测试后再推送到远程仓库。

### 5. 使用.gitignore忽略不需要的文件

避免将敏感信息、临时文件、日志文件等提交到仓库。

项目标准.gitignore内容：
```
# 环境配置
.env
.venv
env/
venv/
ENV/

# 上传文件
uploads/
!uploads/.gitkeep

# 数据库文件
*.db
*.sqlite3

# 日志
*.log
logs/

# Python缓存
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/

# IDE文件
.idea/
.vscode/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db
```

## 常用Git命令

### 基本操作

```bash
# 克隆仓库
git clone [repository_url]

# 查看状态
git status

# 添加文件
git add [file]  # 单个文件
git add .       # 所有文件

# 提交更改
git commit -m "提交信息"

# 查看日志
git log
git log --oneline --graph  # 简洁图形化显示

# 拉取最新代码
git pull
```

### 分支操作

```bash
# 列出所有分支
git branch

# 创建新分支
git checkout -b [branch_name]

# 切换分支
git checkout [branch_name]

# 合并分支
git merge [branch_name]

# 删除分支
git branch -d [branch_name]  # 安全删除
git branch -D [branch_name]  # 强制删除
```

### 标签操作

```bash
# 创建标签
git tag -a v1.0.0 -m "版本1.0.0发布"

# 列出标签
git tag

# 推送标签
git push origin [tag_name]
git push origin --tags  # 推送所有标签
```

## CI/CD集成

项目推荐与CI/CD工具集成，实现自动化测试和部署：

1. **每次提交**: 运行代码风格检查和单元测试
2. **合并到develop**: 自动部署到测试环境
3. **发布新版本**: 自动部署到生产环境

## 代码审核流程

1. 开发者提交Pull Request
2. 至少一名团队成员进行代码审核
3. CI/CD验证通过
4. 解决所有审核意见
5. 合并到目标分支

## 常见问题与解决

### Q: 如何处理合并冲突?

A: 当发生合并冲突时：
1. 使用`git status`查看冲突文件
2. 编辑冲突文件，解决冲突
3. 使用`git add`标记冲突已解决
4. 使用`git commit`完成合并

### Q: 如何撤销上一次提交?

A: 使用以下命令撤销上一次提交：
```bash
git reset --soft HEAD~1  # 保留更改但撤销提交
# 或
git reset --hard HEAD~1  # 撤销提交并丢弃更改(谨慎使用)
```

### Q: 如何查看文件的修改历史?

A: 使用以下命令：
```bash
git log --follow [file]  # 查看文件的提交历史
git blame [file]         # 查看文件每一行的最后修改者
``` 