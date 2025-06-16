# AI Educational SaaS 本地一键部署教程（使用 start.sh）

本教程适用于在本地开发环境（如 macOS、Windows、Linux）下，使用 start.sh 脚本一键启动前后端服务。

---

## 1. 环境准备

- 已安装 Python 3（推荐 3.8 及以上）
- 已安装 Node.js 和 npm（推荐 Node.js 18+）
- 已 clone 本项目代码到本地

### 检查 Python 版本
```bash
python3 --version
```

### 检查 Node.js 和 npm 版本
```bash
node -v
npm -v
```

---

## 2. 一键启动服务

在项目根目录下执行：
```bash
bash start.sh
```
脚本会自动完成：
- 检查并创建 Python 虚拟环境
- 安装后端依赖（requirements.txt）
- 启动 Django 后端服务（默认端口 8000）
- 安装前端依赖（frontend/package.json）
- 启动 React 前端服务（默认端口 3000）

---

## 3. 访问服务

- 前端页面：http://localhost:3000
- 后端 API：http://localhost:8000/api/

---

## 4. 常见问题

- **端口被占用**：如 3000 或 8000 端口被占用，请先关闭占用进程或修改端口。
- **依赖安装失败**：请检查网络、npm/pip 源，或手动安装依赖。
- **虚拟环境问题**：如 venv 激活失败，可手动删除 backend/venv 目录后重试。
- **前端白屏/接口 500**：请检查后端服务是否正常启动，数据库迁移是否完成。

---

## 5. 停止服务

按下 `Ctrl+C` 即可停止所有服务，脚本会自动清理相关进程。

---

## 6. 其他说明

- 本地开发建议前后端分开调试，代码热更新友好。
- 如需自定义端口、环境变量等，可修改 start.sh 脚本或相关配置文件。
- 如需生产部署，请参考 DEPLOY_PROD_ON_ALIYUN.md。

---

如有问题请联系项目维护者。 