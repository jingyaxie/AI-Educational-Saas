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
rm -rf build dist
if [ ! -d node_modules ] || [ package.json -nt node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo "依赖有变动，重新安装依赖..."
  npm install --legacy-peer-deps
else
  echo "依赖未变动，跳过 npm install"
fi
npm run build
cd ..
echo "[1/3] 前端构建完成！"

DATE_TAG=$(date +%Y%m%d-%H%M)
IMAGE_NAME="ai-educational-saas:$DATE_TAG"
TAR_NAME="ai-educational-saas-$DATE_TAG.tar"

# 只构建本地平台镜像（适配 Alibaba Cloud Linux 3 x86_64）
docker build -t $IMAGE_NAME .

echo "[INFO] 镜像已构建: $IMAGE_NAME"

docker save -o $TAR_NAME $IMAGE_NAME

echo "[INFO] 镜像已保存为: $TAR_NAME"

# 只保留最近的 tar 文件，删除旧的（可选）
ls -t ai-educational-saas-*.tar | tail -n +2 | xargs rm -f || true

echo "[INFO] 只保留最新的镜像文件: $TAR_NAME"

# 自动检测 build 目录和镜像内容是否一致
BUILD_HASH=$(cat frontend/build/index.html | grep -o 'main\.[a-zA-Z0-9]*\.js' | head -n1)
IMG_HASH=$(docker run --rm $IMAGE_NAME sh -c "cat /app/frontend_dist/index.html | grep -o 'main\\.[a-zA-Z0-9]*\\.js' | head -n1")

if [ "$BUILD_HASH" = "$IMG_HASH" ]; then
  echo "[检测通过] build 目录和镜像内容一致: $BUILD_HASH"
else
  echo "[检测失败] build 目录 main.js: $BUILD_HASH, 镜像内 main.js: $IMG_HASH"
  echo "[警告] 镜像内容与本地 build 目录不一致，请检查 Dockerfile COPY 路径和 build 流程！"
  exit 1
fi

echo "[完成] 镜像构建完成！"
echo "镜像标签: ${IMAGE_NAME}"
echo "支持的架构: linux/amd64, linux/arm64" 