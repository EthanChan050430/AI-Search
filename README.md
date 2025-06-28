# AI搜索项目

## 项目描述
这是一个简洁的AI搜索页面，提供智能搜索和对话服务。

## 项目结构
```
ai-search-project/
├── ai-search.html          # AI搜索主页面
├── think-verification.js   # Think标签验证工具
├── scripts/
│   └── ai-search.js       # AI搜索核心脚本
└── images/                # 资源文件目录
    ├── AISEARCH.png       # AI搜索Logo
    ├── favicon.ico        # 网站图标
    ├── success.mp3        # 成功音效
    ├── tanke.jpg          # 头像图片
    ├── xiang.png          # 头像图片
    ├── xiaochun.png       # 头像图片
    ├── xingye.png         # 头像图片
    └── youxiang.png       # 头像图片
```

## 功能特性
- AI智能搜索对话
- 多模型支持 (GLM-4, GLM-4V, DeepSeek-R1, etc.)
- 文件上传支持
- 深度搜索功能
- AI绘图功能
- Think标签流式处理

## 使用说明
1. 直接打开 `ai-search.html` 文件
2. 在搜索框中输入问题或搜索内容
3. 选择合适的AI模型
4. 享受智能搜索和对话服务

## 配置说明
在 `scripts/ai-search.js` 文件中：
- 将 `YOUR_API_KEY` 替换为实际的API密钥
- 将 `BASE_URL` 替换为实际的API基础URL

## 注意事项
- 确保API密钥配置正确
- 需要网络连接以访问AI服务
- 建议使用现代浏览器以获得最佳体验

## 在线演示
可以直接下载项目文件到本地，然后用浏览器打开 `ai-search.html` 文件即可使用。

## 许可证
MIT License