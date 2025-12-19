# 时间计算与可视化应用

一个功能完整的网页应用，用于时间计算与可视化展示，支持基于任意三个已知时间参数自动计算第四个未知参数，并提供直观的时间轴可视化。

## 功能特性

- **时间参数管理**：支持起始时间点、预约时间时长、行动时长、结束时间点的管理
- **自动计算功能**：基于任意三个已知时间参数，自动计算第四个未知时间参数
- **灵活的时间调整**：采用滚轮选择器进行时间参数调整，支持小时、分钟等时间单位的精确调整
- **直观的时间轴可视化**：清晰标记四个时间节点在时间轴上的位置，使用不同颜色区分不同类型的时间节点
- **响应式设计**：适配不同屏幕尺寸，在各种设备上都有良好的用户体验
- **时间格式切换**：支持12小时制/24小时制切换
- **一键重置功能**：可快速恢复默认设置

## 技术栈

- **Vue 3**：使用Composition API构建组件
- **Vite**：现代化的前端构建工具
- **Tailwind CSS**：实用优先的CSS框架
- **原生JavaScript**：轻量级开发，无额外依赖

## 安装与运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动

### 构建生产版本

```bash
npm run build
```

构建完成后，生产版本文件将生成在 `dist` 目录中

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
web_book_time_calc/
├── src/
│   ├── components/         # Vue组件
│   │   ├── TimeRoller.vue  # 时间滚轮选择器组件
│   │   └── TimeLine.vue    # 时间轴可视化组件
│   ├── App.vue             # 主应用组件
│   ├── main.js             # 应用入口
│   └── style.css           # 全局样式
├── dist/                   # 构建输出目录
├── index.html              # HTML模板
├── vite.config.js          # Vite配置
├── tailwind.config.js      # Tailwind CSS配置
├── postcss.config.js       # PostCSS配置
├── package.json            # 项目配置和依赖
└── README.md               # 项目说明文档
```

## 使用说明

1. 在时间参数卡片上选择要计算的目标（默认为结束时间）
2. 点击时间显示部分展开滚轮选择器
3. 调整任意三个时间参数，第四个参数将自动计算
4. 时间轴会实时更新，直观展示各时间节点的关系
5. 可以切换12/24小时制格式
6. 点击重置按钮恢复默认设置

## 构建输出

构建完成后，`dist` 目录将包含以下文件：

- `index.html`：主HTML文件
- `assets/index-*.css`：样式文件
- `assets/index-*.js`：JavaScript文件

这些文件可以直接部署到任何静态网站托管服务上。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

Apache License
