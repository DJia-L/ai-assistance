# 融媒体AI助手系统 - 部署指南

本文档提供融媒体AI助手系统后端的部署说明，包括开发环境和生产环境的部署步骤。

## 部署前准备

### 系统要求

- Python 3.8+
- 至少 4GB 内存
- 至少 10GB 可用磁盘空间
- 网络连通性，可访问DeepSeek API服务

### 环境变量配置

在项目根目录创建 `.env` 文件，配置以下环境变量：

```
# 基础配置
APP_ENV=development  # development, production
SECRET_KEY=your_secret_key  # 用于JWT签名
DEEPSEEK_API_KEY=your_deepseek_api_key  # DeepSeek API密钥

# 数据库配置
DATABASE_URL=sqlite:///app.db  # 默认使用SQLite
# 如果使用PostgreSQL: postgresql://user:password@localhost:5432/db_name

# 跨域配置
ALLOWED_ORIGINS=*  # 允许所有来源，生产环境应该指定具体域名

# 文件上传配置
MAX_UPLOAD_SIZE=10  # 单位: MB
```

## 开发环境部署

### 步骤1: 克隆代码库

```bash
git clone [repository_url]
cd backend
```

### 步骤2: 创建虚拟环境

```bash
# Windows环境
python -m venv venv
venv\Scripts\activate

# Linux/macOS环境
python3 -m venv venv
source venv/bin/activate
```

### 步骤3: 安装依赖

```bash
pip install -r requirements.txt
```

### 步骤4: 初始化数据库

系统会在首次运行时自动创建数据库表结构，无需额外初始化。

### 步骤5: 启动开发服务器

```bash
python -m app.main
```

服务器默认在 http://localhost:8000 启动。

## 生产环境部署

### 方式1: 使用Docker容器

#### 步骤1: 创建Dockerfile

在项目根目录创建 `Dockerfile` 文件:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 确保必要的目录存在
RUN mkdir -p uploads/documents uploads/embeddings

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 步骤2: 构建Docker镜像

```bash
docker build -t media-ai-assistant-backend .
```

#### 步骤3: 运行容器

```bash
docker run -d \
  --name media-ai-backend \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env \
  media-ai-assistant-backend
```

### 方式2: 服务器直接部署

#### 步骤1: 安装依赖

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 步骤2: 配置Gunicorn服务器

创建 `gunicorn_conf.py` 文件:

```python
# gunicorn_conf.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
accesslog = "access.log"
errorlog = "error.log"
```

#### 步骤3: 使用Systemd管理服务

创建 `/etc/systemd/system/media-ai-backend.service` 文件:

```
[Unit]
Description=Media AI Assistant Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
Environment="PATH=/path/to/backend/venv/bin"
ExecStart=/path/to/backend/venv/bin/gunicorn app.main:app -c gunicorn_conf.py
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务:

```bash
sudo systemctl enable media-ai-backend
sudo systemctl start media-ai-backend
```

#### 步骤4: 配置Nginx反向代理

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 上传大文件支持
        client_max_body_size 20M;
    }
}
```

### 方式3: 使用Docker Compose

创建 `docker-compose.yml` 文件:

```yaml
version: '3'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    env_file:
      - .env
    restart: always
    
  # 可选: 如果使用PostgreSQL数据库
  db:
    image: postgres:13
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_USER=postgres
      - POSTGRES_DB=media_ai
    restart: always

volumes:
  postgres_data:
```

启动服务:

```bash
docker-compose up -d
```

## 数据迁移与备份

### 数据库备份

#### SQLite备份

```bash
# 备份
cp app.db app.db.backup

# 恢复
cp app.db.backup app.db
```

#### PostgreSQL备份

```bash
# 备份
pg_dump -U postgres -d media_ai > media_ai_backup.sql

# 恢复
psql -U postgres -d media_ai < media_ai_backup.sql
```

### 文件存储备份

```bash
# 备份上传文件
tar -czf uploads_backup.tar.gz uploads/

# 恢复上传文件
tar -xzf uploads_backup.tar.gz
```

## 监控与维护

### 日志管理

系统日志位于以下位置:

- 应用日志: `app.log`
- 访问日志: `access.log` (使用Gunicorn时)
- 错误日志: `error.log` (使用Gunicorn时)

### 系统监控

建议使用以下工具监控系统:

- Prometheus + Grafana: 监控系统性能和API使用情况
- Sentry: 错误跟踪和异常监控

### 性能优化

- 对于高流量场景，建议使用PostgreSQL代替SQLite
- 使用Redis缓存常用数据和会话信息
- 考虑使用异步任务队列处理耗时操作

## 故障排除

### 常见问题

1. **API连接问题**
   - 检查DeepSeek API密钥是否正确配置
   - 确保服务器可以连接到外部API服务

2. **文件上传失败**
   - 检查上传目录权限
   - 验证`uploads`目录是否存在且可写

3. **服务启动失败**
   - 检查日志文件了解具体错误
   - 确认所有依赖已正确安装

4. **性能问题**
   - 优化数据库查询
   - 增加服务器资源

## 扩展与升级

### 水平扩展

对于高负载场景，可以考虑:

1. 使用负载均衡器分发请求到多个后端实例
2. 将数据库与应用服务分离
3. 使用Redis集群管理会话和缓存

### 系统升级

1. 备份数据库和上传文件
2. 拉取最新代码
3. 安装新依赖
4. 执行数据库迁移(如果有)
5. 重启服务

## 安全最佳实践

1. 使用强密码和长密钥
2. 定期更新依赖包
3. 在生产环境中指定具体的CORS域名
4. 使用HTTPS保护API通信
5. 实施速率限制防止API滥用 