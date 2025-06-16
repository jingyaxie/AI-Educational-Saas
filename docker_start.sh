#!/bin/bash

# 设置错误时退出
set -e

echo "开始部署..."

IMAGE_NAME=ai-educational-saas
CONTAINER_NAME=ai-educational-saas
PORT=8000
NGINX_CONF=/etc/nginx/conf.d/your_project.conf
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
DOMAIN_OR_IP=${DOMAIN_OR_IP:-_}

# 1. 创建必要的目录
echo "创建必要的目录..."
mkdir -p /data/frontend_dist
mkdir -p /data/static
mkdir -p /data/media

# 2. 构建前端
echo "构建前端..."
cd frontend
npm install
npm run build
cp -r build/* /data/frontend_dist/
cd ..

# 3. 设置 Nginx 配置
echo "配置 Nginx..."
# 备份现有配置
if [ -f /etc/nginx/conf.d/your_project.conf ]; then
    cp /etc/nginx/conf.d/your_project.conf /etc/nginx/conf.d/your_project.conf.backup
fi

# 创建新的 Nginx 配置
cat > /etc/nginx/conf.d/your_project.conf << 'EOL'
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /static/ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /media/ {
        root /usr/share/nginx/html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOL

# 检查 Nginx 配置
echo "检查 Nginx 配置..."
nginx -t

# 如果配置正确，重新加载 Nginx
if [ $? -eq 0 ]; then
    echo "Nginx 配置正确，重新加载..."
    nginx -s reload
else
    echo "Nginx 配置有误，请检查错误信息"
    exit 1
fi

# 4. 构建并启动 Docker 容器
echo "构建并启动 Docker 容器..."
docker compose up -d --build

echo "部署完成！"
echo "前端静态资源目录: /data/frontend_dist"
echo "Django 静态目录: /data/static"
echo "Django 媒体目录: /data/media"
echo "API地址: http://$DOMAIN_OR_IP:$PORT" 