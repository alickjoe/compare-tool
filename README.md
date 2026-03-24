# 文本对比工具

一个现代化的文本对比工具，支持多种格式的语法检查和格式化。

## 功能特性

- **文本对比**: 支持并排对比和内联对比两种模式
- **差异高亮**: 新增、删除、修改行用不同颜色标记
- **格式支持**: JSON、XML、HTML、YAML、Shell、INI、纯文本
- **语法检查**: 实时检测语法错误
- **格式化**: 一键格式化代码
- **响应式设计**: 支持桌面和移动设备
- **深色模式**: 支持亮色/暗色主题切换

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 部署方式

### 方式一：纯静态部署 (Nginx)

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录内容复制到 Nginx 的 web 目录：
```bash
cp -r dist/* /var/www/html/
```

3. Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 方式二：Docker 部署

```bash
# 构建镜像
docker build -t text-compare-tool .

# 运行容器
docker run -d -p 3000:80 --name text-compare text-compare-tool
```

### 方式三：Docker Compose 部署

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### Nginx 反向代理配置

如果使用 Docker 部署并通过 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 方式四：子路径部署（如 /compare）

如果需要在现有服务器的子路径下运行（如 `https://your-domain.com/compare/`）：

1. **修改 `vite.config.ts` 中的 `base` 配置**（已配置为 `/compare/`）

2. **重新构建**：
```bash
npm run build
# 或
docker-compose build
```

3. **Nginx 反向代理配置**（HTTPS + 子路径）：
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 文本对比工具 - 子路径配置
    location /compare/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 静态资源缓存优化
    location ~* ^/compare/assets/.*\.(js|css|png|svg|woff2?)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 你现有的其他配置...
}
```

4. **启动 Docker 容器**：
```bash
docker run -d -p 127.0.0.1:3000:80 --name text-compare text-compare-tool
```

访问地址：`https://your-domain.com/compare/`

> 详细配置示例请参考 `nginx-proxy-example.conf` 文件

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- diff.js (文本对比算法)
- js-yaml (YAML 解析)

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## License

MIT
