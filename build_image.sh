#!/bin/bash

# 设置错误时退出
set -e

# 检查 Docker 是否启动
if ! docker info > /dev/null 2>&1; then
  echo "[错误] Docker 未启动，请先启动 Docker 后再运行本脚本。"
  exit 1
fi

echo "[1/3] 开始前端构建..."
cd frontend
if [ ! -d node_modules ] || [ package.json -nt node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo "依赖有变动，重新安装依赖..."
  npm install
else
  echo "依赖未变动，跳过 npm install"
fi
npm run build
cd ..
echo "[1/3] 前端构建完成！"

DATE_TAG=$(date +%Y%m%d-%H%M)
IMAGE_NAME="ai-educational-saas:$DATE_TAG"
TAR_NAME="ai-educational-saas-$DATE_TAG.tar"

set +e  # 允许后续命令出错但不中断脚本

echo "[2/3] 检查 Docker Buildx..."
if ! docker buildx version &> /dev/null; then
    echo "安装 Docker Buildx..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        mkdir -p ~/.docker/cli-plugins
        curl -SL https://github.com/docker/buildx/releases/download/v0.10.0/buildx-v0.10.0.linux-amd64 -o ~/.docker/cli-plugins/docker-buildx
        chmod +x ~/.docker/cli-plugins/docker-buildx
    fi
fi

echo "[2/3] 构建多架构 Docker 镜像..."
docker buildx create --name multiarch-builder --use || true
docker buildx inspect --bootstrap
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag ${IMAGE_NAME} \
    --load \
    .

set -e  # 重新开启遇错即停

echo "[3/3] 检查并导出镜像..."
if docker images | grep -q "${IMAGE_NAME}"; then
  docker save ${IMAGE_NAME} > ${TAR_NAME}
  echo "镜像已保存为: ${TAR_NAME}"
  ls -lh ${TAR_NAME}
else
  echo "[警告] 未找到镜像 ${IMAGE_NAME}，请检查 buildx 构建日志。"
  exit 2
fi

ls -t ai-educational-saas-*.tar | tail -n +2 | xargs rm -f || true

echo "[完成] 镜像构建完成！"
echo "镜像标签: ${IMAGE_NAME}"
echo "支持的架构: linux/amd64, linux/arm64" 