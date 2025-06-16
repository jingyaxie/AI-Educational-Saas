# ---- 构建前端 ----
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# ---- 构建后端 ----
FROM python:3.10-slim AS backend-build
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN python -m venv /opt/venv \
    && . /opt/venv/bin/activate \
    && pip install --upgrade pip \
    && pip install -r requirements.txt
COPY backend ./

# ---- 生产镜像 ----
FROM python:3.10-slim
ENV VIRTUAL_ENV=/opt/venv
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
WORKDIR /app

# 拷贝后端代码和虚拟环境
COPY --from=backend-build /opt/venv /opt/venv
COPY --from=backend-build /app/backend ./backend

# 拷贝前端构建产物到单独目录
COPY --from=frontend-build /app/frontend/build ./frontend_dist

# 端口
EXPOSE 8000

# 启动命令（gunicorn，生产推荐）
CMD ["bash", "-c", "cd backend && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn account_system.wsgi:application --bind 0.0.0.0:8000"] 