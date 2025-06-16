#!/bin/bash

# 设置错误时退出
set -e

echo "开始构建镜像..."

DATE_TAG=$(date +%Y%m%d-%H%M)
IMAGE_NAME="ai-educational-saas:$DATE_TAG"
TAR_NAME="ai-educational-saas-$DATE_TAG.tar"

# 检查 Docker 是否支持多架构构建
if ! docker buildx version &> /dev/null; then
    echo "安装 Docker Buildx..."
    # 对于 Mac，Docker Desktop 已经包含了 buildx
    # 对于 Linux，需要安装
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        mkdir -p ~/.docker/cli-plugins
        curl -SL https://github.com/docker/buildx/releases/download/v0.10.0/buildx-v0.10.0.linux-amd64 -o ~/.docker/cli-plugins/docker-buildx
        chmod +x ~/.docker/cli-plugins/docker-buildx
    fi
fi

# 1. 构建前端
echo "构建前端..."
cd frontend
npm install
npm run build
cd ..

# 2. 构建多架构 Docker 镜像
echo "构建多架构 Docker 镜像..."
# 创建并使用新的构建器实例
docker buildx create --name multiarch-builder --use || true
docker buildx inspect --bootstrap

# 构建并推送多架构镜像
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag ${IMAGE_NAME} \
    --load \
    .

# 3. 保存镜像到文件
echo "保存镜像到文件..."
# 只保存 amd64 架构的镜像（用于 CentOS 服务器）
docker save ${IMAGE_NAME} > ${TAR_NAME}

# 4. 只保留最新的 tar 文件，删除旧的（可选）
ls -t ai-educational-saas-*.tar | tail -n +2 | xargs rm -f || true

echo "镜像构建完成！"
echo "镜像已保存为: ${TAR_NAME}"
echo "镜像标签: ${IMAGE_NAME}"
echo "支持的架构: linux/amd64, linux/arm64" 