# LVGL Font Converter

一个基于Vue开发的LVGL字体转换工具网页应用，支持将TTF、WOFF、WOFF2、OTF格式的字体文件转换为LVGL格式的字体文件。

## 技术栈

- Vue 2.6.14
- lv_font_conv 1.5.3
- js-yaml 4.1.1
- Webpack 4.x

## 功能特性

- 支持单次上传字体文件，同时输出多种字号的转换文件
- 提供Range和Symbols参数的JSON/YAML文件导入功能
- 支持设置字体名称、字号、bpp（bits per pixel）等参数
- 直观易用的界面设计
- 稳定高效的转换过程
- 输出文件符合LVGL字体规范

## 安装步骤

1. 确保已安装Node.js（建议版本14.x或更高）

2. 克隆或下载项目到本地

3. 进入项目目录
   ```bash
   cd web_lvgl_font_convert
   ```

4. 安装依赖
   ```bash
   yarn install
   ```
   或使用npm
   ```bash
   npm install
   ```

## 运行步骤

1. 启动开发服务器
   ```bash
   yarn serve
   ```
   或使用npm
   ```bash
   npm run serve
   ```

2. 等待开发服务器启动完成，控制台会显示访问地址
   ```
   App running at:
   - Local:   http://localhost:8080/
   - Network: http://your-ip:8080/
   ```

3. 在浏览器中访问上述地址，即可使用LVGL字体转换工具

## 使用说明

1. **上传字体文件**：点击"Font File"输入框，选择要转换的字体文件（支持TTF、WOFF、WOFF2、OTF格式）

2. **设置字体名称**：在"Font Name"输入框中输入转换后的字体名称

3. **设置字体大小**：在"Font Sizes"输入框中输入要转换的字号，多个字号用逗号分隔（如：16,24,32）

4. **设置BPP**：在"Bits per Pixel"下拉菜单中选择bpp值（1-4，值越大，字体越平滑）

5. **导入配置文件**（可选）：点击"Import Range/Symbols from JSON/YAML"输入框，选择包含Range和Symbols参数的JSON或YAML文件

6. **设置Unicode Range**（可选）：在"Unicode Range"文本框中输入要包含的Unicode范围，多个范围用逗号分隔（如：0x20-0x7F,0x410-0x44F）

7. **设置Symbols**（可选）：在"Symbols"文本框中输入要包含的具体字符

8. **开始转换**：点击"Convert"按钮，等待转换完成

9. **下载转换文件**：转换完成后，在"Output"区域会显示生成的文件列表，点击文件名即可下载

## 配置文件说明

### JSON格式示例

```json
{
  "range": "0x20-0x7F,0x410-0x44F,0x451",
  "symbols": "Hello World! 你好，世界！"
}
```

### YAML格式示例

```yaml
# LVGL Font Converter Parameters Example
# This file demonstrates how to configure Range and Symbols for LVGL font conversion

# Unicode Ranges (hexadecimal format)
# Format: comma-separated ranges or single values
range: 0x20-0x7F, 0x410-0x44F, 0x451

# Symbols to include
# Multi-line symbols are supported without escaping newlines
symbols: |
  Hello World!
  你好，世界！
  こんにちは世界！
  Привет, мир!
  العربية
  🌍✨
  0123456789
  !@#$%^&*()_+-=[]{}|;:,.<>?
```

## 项目结构

```
web_lvgl_font_convert/
├── public/              # 静态资源目录
│   ├── favicon.ico      # 网站图标
│   └── index.html       # HTML模板
├── src/                 # 源代码目录
│   ├── assets/          # 资源文件
│   │   └── logo.png     # Vue logo
│   ├── components/      # 组件目录
│   │   └── HelloWorld.vue  # 默认组件（未使用）
│   ├── App.vue          # 主应用组件
│   └── main.js          # 应用入口文件
├── font_params_example.json  # JSON示例配置文件
├── font_params_example.yaml  # YAML示例配置文件
├── package.json         # 项目配置文件
├── vue.config.js        # Vue CLI配置文件
└── README.md            # 项目说明文档
```

## 注意事项

1. 转换过程中请不要关闭浏览器窗口
2. 建议不要同时转换过多字号，以免影响转换速度
3. 转换大字体文件时，可能需要较长时间，请耐心等待
4. 生成的字体文件将保存在浏览器下载目录中

## 构建生产版本

如果需要部署到生产环境，可以执行以下命令构建生产版本：

```bash
# 使用yarn
yarn build

# 或使用npm
npm run build
```

构建完成后，生成的文件将保存在`dist`目录中，可以部署到任何静态文件服务器上。
