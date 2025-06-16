#!/bin/bash

IMAGE_NAME=ai-educational-saas
CONTAINER_NAME=ai-educational-saas
PORT=8000
NGINX_CONF=/etc/nginx/conf.d/your_project.conf
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
DOMAIN_OR_IP=${DOMAIN_OR_IP:-_}

# 1. 创建静态资源目录
sudo mkdir -p /data/static /data/media /data/frontend_dist
sudo chown -R $(whoami):$(whoami) /data/static /data/media /data/frontend_dist

# 2. 确保 Nginx 配置目录存在
sudo mkdir -p /etc/nginx/conf.d/

# 3. 拷贝 nginx.conf 并用 envsubst 替换 server_name（在项目根目录执行）
cd "$PROJECT_ROOT"
if command -v envsubst >/dev/null 2>&1; then
  export DOMAIN_OR_IP
  envsubst < nginx.conf | sudo tee $NGINX_CONF
else
  echo "[警告] 未安装 envsubst，直接拷贝 nginx.conf，server_name 需手动修改。"
  sudo cp nginx.conf $NGINX_CONF
fi

# 4. 重载 Nginx
sudo nginx -s reload

# 5. 构建镜像
echo "[1/3] 构建 Docker 镜像..."
docker build -t $IMAGE_NAME .

# 6. 停止并删除已存在的同名容器
if [ $(docker ps -aq -f name=$CONTAINER_NAME) ]; then
    echo "[2/3] 停止并删除已有容器..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

# 7. 运行新容器，挂载静态资源和媒体目录
echo "[3/3] 启动新容器..."
docker run -d --name $CONTAINER_NAME \
    -p $PORT:8000 \
    -v /data/static:/app/backend/static \
    -v /data/media:/app/backend/media \
    -v /data/frontend_dist:/app/frontend_dist \
    $IMAGE_NAME

echo "部署完成！"
echo "前端静态资源目录: /data/frontend_dist"
echo "Django 静态目录: /data/static"
echo "Django 媒体目录: /data/media"
echo "API地址: http://$DOMAIN_OR_IP:$PORT" 