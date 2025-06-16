#!/bin/bash

# 自动化部署文件同步脚本
# 只同步最近3个镜像文件和部署相关文件

set -e

SRC_DIR="$(cd "$(dirname "$0")"; pwd)"
DEST_DIR="$SRC_DIR/../AI-Educational-Saas-Docker-Image"

# 找到最近3个 tar 文件
TAR_FILES=$(ls -t "$SRC_DIR"/ai-educational-saas-*.tar | head -n3)
for TAR in $TAR_FILES; do
  cp "$TAR" "$DEST_DIR"/
  echo "[INFO] 已复制: $TAR"
done

# 复制部署相关文件
cp "$SRC_DIR"/docker_start.sh "$SRC_DIR"/nginx.conf "$DEST_DIR"/

cd "$DEST_DIR"

# Git 操作
if git status --porcelain | grep .; then
  git add ai-educational-saas-*.tar docker_start.sh nginx.conf
  git commit -m "chore: update deploy files $(date '+%Y-%m-%d %H:%M:%S')"
  git push
  echo "[INFO] 部署文件已同步并推送到远程仓库。"
else
  echo "[INFO] 没有文件变更，无需提交。"
fi

# 可选：自动删除目标目录下多余的旧 tar 文件，只保留3个
cd "$DEST_DIR"
ls -t ai-educational-saas-*.tar | tail -n +4 | xargs rm -f || true 