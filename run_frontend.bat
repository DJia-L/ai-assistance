@echo off
title 融媒体AI助手前端服务
echo ======================================
echo       融媒体AI助手前端服务
echo ======================================
echo.

rem 检查是否安装了Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未找到Node.js! 请安装Node.js后重试。
    goto :error
)

rem 切换到前端目录
cd frontend
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未找到frontend目录！
    goto :error
)

rem 检查依赖是否已安装
if not exist node_modules (
    echo 正在安装前端依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 goto :error
)

rem 检查环境变量文件
if not exist .env.local (
    echo 警告: 未找到.env.local文件，将创建默认配置...
    echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 > .env.local
    echo 已创建默认环境配置，请根据需要修改.env.local文件。
) else (
    echo 环境配置文件已存在。
)

echo 正在启动前端开发服务器...
echo.
echo 前端服务将在 http://localhost:3000 运行
echo.
echo 按Ctrl+C终止服务
echo ----------------------------------------

rem 启动开发服务器
call npm run dev

goto :end

:error
echo.
echo 启动前端服务器时出现错误，请检查上面的错误信息。
pause
exit /b 1

:end
echo.
echo 前端服务已停止。
pause 