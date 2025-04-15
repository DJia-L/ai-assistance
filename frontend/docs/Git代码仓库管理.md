# Git代码仓库管理规范

## 目录

- [分支管理策略](#分支管理策略)
- [提交规范](#提交规范)
- [代码审查流程](#代码审查流程)
- [版本发布流程](#版本发布流程)
- [Git工作流程](#git工作流程)
- [常用Git命令](#常用git命令)
- [冲突解决指南](#冲突解决指南)
- [标签管理](#标签管理)

## 分支管理策略

采用GitFlow分支模型，包含以下分支类型：

### 长期分支

- **master**: 主分支，保存正式发布的历史
  - 只接受来自`release`分支和`hotfix`分支的合并
  - 每次合并都应该打上版本标签
  - 受保护分支，禁止直接推送

- **develop**: 开发分支，最新的开发状态
  - 包含所有已完成的功能
  - 作为功能分支的集成分支
  - 受保护分支，禁止直接推送

### 临时分支

- **feature/\***: 功能分支，用于开发新功能
  - 命名规范：`feature/功能名称`，如`feature/user-profile`
  - 从`develop`分支创建
  - 完成后合并回`develop`分支
  - 完成合并后删除

- **release/\***: 发布分支，用于准备发布版本
  - 命名规范：`release/版本号`，如`release/v1.2.0`
  - 从`develop`分支创建
  - 只允许修复bug，不允许添加新功能
  - 完成后合并到`master`和`develop`分支
  - 完成合并后删除

- **hotfix/\***: 热修复分支，用于修复生产环境中的紧急问题
  - 命名规范：`hotfix/问题描述`，如`hotfix/login-error`
  - 从`master`分支创建
  - 完成后合并到`master`和`develop`分支
  - 完成合并后删除

### 分支操作流程

#### 功能开发流程

1. 从`develop`分支创建功能分支
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/new-feature
   ```

2. 在功能分支上进行开发和提交
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   ```

3. 完成开发后，推送功能分支到远程仓库
   ```bash
   git push origin feature/new-feature
   ```

4. 创建从`feature/new-feature`到`develop`的Pull Request
5. 代码审查通过后，合并PR并删除功能分支

#### 版本发布流程

1. 从`develop`分支创建发布分支
   ```bash
   git checkout develop
   git pull
   git checkout -b release/v1.2.0
   ```

2. 在发布分支上修复bug
   ```bash
   git add .
   git commit -m "fix: 修复xxx问题"
   ```

3. 推送发布分支到远程仓库
   ```bash
   git push origin release/v1.2.0
   ```

4. 创建从`release/v1.2.0`到`master`的Pull Request
5. 审查通过后，合并到`master`并打上版本标签
   ```bash
   git checkout master
   git pull
   git tag -a v1.2.0 -m "Version 1.2.0"
   git push origin v1.2.0
   ```

6. 将发布分支合并回`develop`
   ```bash
   git checkout develop
   git pull
   git merge release/v1.2.0
   git push origin develop
   ```

7. 删除发布分支
   ```bash
   git branch -d release/v1.2.0
   git push origin --delete release/v1.2.0
   ```

## 提交规范

采用Angular提交规范，使提交信息更加规范化和易于阅读。

### 提交格式

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- **feat**: 新功能
- **fix**: 修复bug
- **docs**: 文档变更
- **style**: 代码格式变更（不影响代码运行的变动，如空格、格式化、分号等）
- **refactor**: 代码重构（既不是新增功能，也不是修改bug的代码变动）
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具的变动
- **ci**: 持续集成相关
- **revert**: 回退先前的提交

### 作用域

指定提交影响的范围，如组件名称、模块名称等。

### 示例

```
feat(auth): 添加用户登录功能

- 实现用户名密码登录
- 添加登录页面UI
- 集成JWT认证

Closes #123
```

```
fix(api): 修复用户API调用失败问题

修复当网络状态不稳定时API调用失败的问题

Fixes #456
```

### 工具支持

使用commitlint和husky强制执行提交规范：

1. 安装依赖
   ```bash
   npm install --save-dev @commitlint/cli @commitlint/config-conventional husky
   ```

2. 配置commitlint
   ```bash
   echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
   ```

3. 配置husky
   ```bash
   npx husky install
   npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
   ```

## 代码审查流程

### 审查目标

- 代码质量
- 功能实现
- 性能考虑
- 安全性
- 代码风格
- 测试覆盖率

### 审查流程

1. 开发者提交Pull Request
   - PR标题遵循提交规范
   - PR描述应包含功能描述、相关问题链接等

2. 通知审查者
   - 指定至少一名审查者
   - 相关模块的负责人必须参与审查

3. 审查者进行代码审查
   - 使用GitHub/GitLab的审查功能
   - 提出改进建议或问题
   - 对重要改动进行讨论

4. 开发者根据反馈进行修改
   - 修改后提交新的commit或使用`git commit --amend`

5. 审查者批准PR
   - 至少需要一名审查者批准
   - 模块负责人必须批准

6. 合并PR
   - 优先使用"Squash and merge"方式，保持提交历史清晰
   - 使用PR标题作为合并提交的描述

### 审查清单

- 代码是否遵循项目的编码规范
- 是否有潜在的安全漏洞
- 是否有性能问题
- 是否有适当的错误处理
- 是否有适当的日志记录
- 是否有足够的测试覆盖
- 变量命名是否合理
- 注释是否充分和必要
- 是否有冗余代码
- 是否有边界情况处理

## 版本发布流程

采用语义化版本号（Semantic Versioning）进行版本管理。

### 版本号格式

`主版本号.次版本号.修订号[-预发布标识]`

- **主版本号**: 当做了不兼容的API修改
- **次版本号**: 当做了向下兼容的功能性新增
- **修订号**: 当做了向下兼容的问题修正
- **预发布标识**: alpha, beta, rc等

### 版本发布步骤

1. 确认所有要发布的功能已合并到`develop`分支

2. 创建发布分支
   ```bash
   git checkout develop
   git pull
   git checkout -b release/vX.Y.Z
   ```

3. 更新版本号
   - 修改`package.json`中的版本号
   - 更新CHANGELOG.md

4. 提交版本更新
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to vX.Y.Z"
   ```

5. 推送发布分支并创建PR
   ```bash
   git push origin release/vX.Y.Z
   ```

6. 审查并测试发布分支

7. 合并到`master`分支
   ```bash
   git checkout master
   git pull
   git merge release/vX.Y.Z --no-ff
   ```

8. 打上版本标签
   ```bash
   git tag -a vX.Y.Z -m "Version X.Y.Z"
   git push origin vX.Y.Z
   ```

9. 合并回`develop`分支
   ```bash
   git checkout develop
   git pull
   git merge release/vX.Y.Z --no-ff
   git push origin develop
   ```

10. 删除发布分支
    ```bash
    git branch -d release/vX.Y.Z
    git push origin --delete release/vX.Y.Z
    ```

11. 发布到npm或部署到生产环境
    ```bash
    npm publish
    # 或
    npm run deploy:prod
    ```

## Git工作流程

### 日常开发

1. 同步最新的`develop`分支
   ```bash
   git checkout develop
   git pull
   ```

2. 创建功能分支
   ```bash
   git checkout -b feature/new-feature
   ```

3. 进行开发并提交
   ```bash
   # 添加修改的文件
   git add <files>
   
   # 提交修改
   git commit -m "feat: 添加新功能"
   
   # 推送到远程仓库
   git push origin feature/new-feature
   ```

4. 定期从`develop`分支同步最新代码
   ```bash
   git checkout develop
   git pull
   git checkout feature/new-feature
   git merge develop
   # 解决冲突（如果有）
   ```

5. 完成功能开发，创建Pull Request并进行代码审查

6. PR被批准后，合并到`develop`分支

### 协作开发技巧

- 经常提交，保持提交粒度小而集中
- 使用`git rebase -i`整理提交历史
- 使用`git stash`暂存未完成的工作
- 使用描述性的分支名称
- 使用`git fetch`检查远程更新

## 常用Git命令

### 基本操作

```bash
# 克隆仓库
git clone <repository-url>

# 查看状态
git status

# 查看差异
git diff

# 添加文件
git add <file>
git add .  # 添加所有修改

# 提交更改
git commit -m "commit message"

# 查看提交历史
git log
git log --oneline --graph  # 简洁图形化显示

# 拉取更新
git pull

# 推送更新
git push origin <branch>
```

### 分支操作

```bash
# 列出所有分支
git branch

# 创建分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换分支
git checkout -b <branch-name>

# 合并分支
git merge <branch-name>

# 删除分支
git branch -d <branch-name>
git push origin --delete <branch-name>  # 删除远程分支
```

### 高级操作

```bash
# 暂存工作区
git stash
git stash pop  # 恢复暂存

# 标签管理
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# 变基
git rebase <branch>
git rebase -i HEAD~3  # 交互式变基，整理最近3个提交

# 撤销提交
git reset --soft HEAD~1  # 撤销最近一次提交，保留修改
git reset --hard HEAD~1  # 撤销最近一次提交，丢弃修改

# 查看远程仓库
git remote -v
```

## 冲突解决指南

### 预防冲突

- 经常同步最新的`develop`分支
- 保持功能分支生命周期短
- 避免多人同时修改同一文件的同一区域
- 使用小功能分支而不是大功能分支

### 解决合并冲突

1. 发现冲突后，Git会在文件中标记冲突区域：
   ```
   <<<<<<< HEAD
   当前分支的代码
   =======
   要合并的分支的代码
   >>>>>>> feature/branch-name
   ```

2. 手动编辑文件解决冲突，保留需要的代码，删除冲突标记

3. 添加解决后的文件
   ```bash
   git add <conflicted-file>
   ```

4. 完成合并
   ```bash
   git commit
   ```

### 使用工具解决冲突

可以使用以下工具简化冲突解决：

- VSCode的合并冲突解决器
- Beyond Compare
- GitKraken
- SourceTree

### 放弃合并

如果需要放弃当前合并操作：

```bash
git merge --abort
```

## 标签管理

使用标签标记重要的提交点，如版本发布。

### 创建标签

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐）
git tag -a v1.0.0 -m "Version 1.0.0"

# 对特定提交创建标签
git tag -a v1.0.0 -m "Version 1.0.0" <commit-hash>
```

### 查看标签

```bash
# 列出所有标签
git tag

# 查看标签详情
git show v1.0.0
```

### 推送标签

```bash
# 推送特定标签
git push origin v1.0.0

# 推送所有标签
git push origin --tags
```

### 删除标签

```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

### 检出标签

```bash
# 检出特定标签
git checkout v1.0.0

# 从标签创建分支
git checkout -b branch-name v1.0.0
```

---

本文档最后更新日期：2025年4月14日 