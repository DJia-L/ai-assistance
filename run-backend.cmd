@echo off
title AI助手后端服务
echo =============================
echo    AI助手后端服务
echo =============================
echo.

cd backend
if not exist venv (
    echo 创建虚拟环境...
    python -m venv venv
)

call venv\Scripts\activate

set /p INSTALL_DEPS=是否需要安装依赖？(y/n): 
if /i "%INSTALL_DEPS%"=="y" (
    echo 安装依赖...
    python -m pip install --upgrade pip
    pip install fastapi uvicorn python-multipart pydantic python-dotenv
    pip install PyJWT sqlalchemy httpx aiosqlite requests
    pip install pandas numpy chardet python-jose passlib
    pip install pymupdf python-docx
    pip install APScheduler beautifulsoup4 aiohttp
)

if not exist .env (
    echo 创建配置文件...
    echo DATABASE_URL=sqlite:///./app.db> .env
    echo DEEPSEEK_API_KEY=your_api_key_here>> .env
    echo DEEPSEEK_API_BASE=https://api.deepseek.com>> .env
    echo SECRET_KEY=your_secret_key_here>> .env
    echo ALGORITHM=HS256>> .env
    echo ACCESS_TOKEN_EXPIRE_MINUTES=60>> .env
    echo DEFAULT_ADMIN_USERNAME=admin>> .env
    echo DEFAULT_ADMIN_PASSWORD=admin123>> .env
    echo DEFAULT_ADMIN_EMAIL=admin@example.com>> .env
)

if not exist uploads mkdir uploads
if not exist uploads\documents mkdir uploads\documents
if not exist uploads\embeddings mkdir uploads\embeddings

echo 启动服务...
echo 后端API将在 http://localhost:8000 运行
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause 