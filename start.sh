#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 清理函数
cleanup() {
    echo -e "${YELLOW}正在清理进程...${NC}"
    # 查找并终止后端进程
    if [ -f "backend/backend.pid" ]; then
        kill $(cat backend/backend.pid) 2>/dev/null || true
        rm backend/backend.pid
    fi
    # 查找并终止前端进程
    if [ -f "frontend/frontend.pid" ]; then
        kill $(cat frontend/frontend.pid) 2>/dev/null || true
        rm frontend/frontend.pid
    fi
    echo -e "${GREEN}清理完成${NC}"
}

# 设置退出时的清理
trap cleanup EXIT

# 检查必要的命令是否存在
check_requirements() {
    echo -e "${YELLOW}检查环境要求...${NC}"
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}错误: 未找到 python3${NC}"
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: 未找到 npm${NC}"
        exit 1
    fi
}

# 检查目录是否存在
check_directories() {
    if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
        echo -e "${RED}错误: 未找到必要的目录${NC}"
        exit 1
    fi
}

# 启动后端
start_backend() {
    echo -e "${YELLOW}启动后端服务...${NC}"
    cd backend || exit 1
    
    # 检查虚拟环境
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}创建虚拟环境...${NC}"
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # 检查依赖
    if [ ! -f "requirements.txt" ]; then
        echo -e "${RED}错误: 未找到 requirements.txt${NC}"
        exit 1
    fi
    
    # 安装依赖
    echo -e "${YELLOW}安装后端依赖...${NC}"
    pip install -r requirements.txt
    
    # 启动服务
    nohup python3 manage.py runserver 0.0.0.0:8000 > backend.log 2>&1 &
    echo $! > backend.pid
    
    # 等待服务启动
    sleep 5
    if ! curl -s http://localhost:8000 > /dev/null; then
        echo -e "${RED}错误: 后端服务启动失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}后端服务已启动${NC}"
    cd ..
}

# 启动前端
start_frontend() {
    echo -e "${YELLOW}启动前端服务...${NC}"
    cd frontend || exit 1
    
    # 检查 package.json
    if [ ! -f "package.json" ]; then
        echo -e "${RED}错误: 未找到 package.json${NC}"
        exit 1
    fi
    
    # 安装依赖
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install
    
    # 启动服务
    nohup npm start > frontend.log 2>&1 &
    echo $! > frontend.pid
    
    # 等待服务启动
    sleep 10
    if ! curl -s http://localhost:3000 > /dev/null; then
        echo -e "${RED}错误: 前端服务启动失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}前端服务已启动${NC}"
    cd ..
}

# 主函数
main() {
    echo -e "${YELLOW}开始启动服务...${NC}"
    
    # 检查环境
    check_requirements
    check_directories
    
    # 启动服务
    start_backend
    start_frontend
    
    echo -e "${GREEN}服务启动成功！${NC}"
    echo -e "后端地址: ${GREEN}http://localhost:8000${NC}"
    echo -e "前端地址: ${GREEN}http://localhost:3000${NC}"
    echo -e "${YELLOW}按 Ctrl+C 停止服务${NC}"
    
    # 保持脚本运行
    wait
}

# 运行主函数
main 