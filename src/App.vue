<template>
  <div id="app">
    <!-- Language toggle button -->
    <div class="language-toggle">
      <button @click="toggleLanguage">{{ language === 'zh' ? 'English' : '中文' }}</button>
    </div>
    
    <h1>{{ t.title }}</h1>
    <div class="container">
      <div class="input-section">
        <h2>{{ t.inputSettings }}</h2>
        
        <!-- Font File Upload -->
        <div class="form-group">
          <label for="fontFile">{{ t.fontFile }}</label>
          <div class="file-upload-wrapper">
            <input type="file" id="fontFile" accept=".ttf,.woff,.woff2,.otf" @change="handleFontFileChange" class="file-input">
            <button type="button" class="file-btn">{{ t.chooseFile }}</button>
            <span class="file-name" v-if="fontFileName">{{ t.selectedFile }}: {{ fontFileName }}</span>
          </div>
        </div>

        <!-- Font Name -->
        <div class="form-group">
          <label for="fontName">{{ t.fontName }}</label>
          <input type="text" id="fontName" v-model="fontName" placeholder="e.g. arial_40">
        </div>

        <!-- Font Sizes -->
        <div class="form-group">
          <label for="fontSizes">{{ t.fontSizes }}</label>
          <input type="text" id="fontSizes" v-model="fontSizes" placeholder="e.g. 16,24,32,40">
        </div>

        <!-- Bits per Pixel -->
        <div class="form-group">
          <label for="bpp">{{ t.bpp }}</label>
          <select id="bpp" v-model="bpp">
            <option value="1">1 bit-per-pixel (bitonal)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4" selected>4 (smoothest)</option>
            <option value="8">8 (highest quality)</option>
          </select>
        </div>

        <!-- Fallback Font -->
        <div class="form-group">
          <label for="fallback">{{ t.fallback }}</label>
          <input type="text" id="fallback" v-model="fallback" :placeholder="t.fallbackPlaceholder">
        </div>

        <!-- Enable Font Compression -->
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="enableCompression">
            {{ t.enableCompression }}
          </label>
        </div>

        <!-- Horizontal Subpixel Rendering -->
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="enableSubpixelRendering">
            {{ t.enableSubpixelRendering }}
          </label>
        </div>

        <!-- Use Color Info -->
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="useColorInfo">
            {{ t.useColorInfo }}
          </label>
        </div>

        <!-- Config Import (YAML only) -->
        <div class="form-group">
          <label for="configImport">{{ t.configImport }}</label>
          <div class="file-upload-wrapper">
            <input type="file" id="configImport" accept=".yaml,.yml" @change="handleConfigImport" class="file-input">
            <button type="button" class="file-btn">{{ t.chooseFile }}</button>
          </div>
        </div>

        <!-- Unicode Range -->
        <div class="form-group">
          <label for="range">{{ t.unicodeRange }}</label>
          <textarea id="range" v-model="range" rows="3" placeholder="Enter Unicode ranges separated by commas"></textarea>
        </div>

        <!-- Symbols -->
        <div class="form-group">
          <label for="symbols">{{ t.symbols }}</label>
          <textarea id="symbols" v-model="symbols" rows="3" placeholder="Enter specific characters"></textarea>
        </div>

        <!-- Convert Button -->
        <button class="convert-btn" @click="convertFont" :disabled="!fontFile">{{ t.convert }}</button>
      </div>

      <div class="output-section">
        <h2>{{ t.output }}</h2>
        <div v-if="conversionInProgress" class="loading">{{ t.converting }}</div>
        <div v-else-if="outputFiles.length > 0" class="output-files">
          <h3>{{ t.generatedFiles }}</h3>
          <ul>
            <li v-for="file in outputFiles" :key="file.name">
              <a :href="file.url" :download="file.name">{{ file.name }}</a>
            </li>
          </ul>
        </div>
        <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
        <div v-else class="empty-output">{{ t.noFilesGenerated }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import yaml from 'js-yaml';
import lvFontConv from 'lv_font_conv/lib/convert';
import Logger from './utils/logger';

export default {
  name: 'App',
  data() {
    return {
      // 中英文切换
      language: 'zh', // zh for Chinese, en for English
      
      fontFile: null,
      fontFileName: '',
      fontName: '',
      fontSizes: '16,24,32',
      bpp: '4',
      fallback: '',
      enableCompression: true,
      enableSubpixelRendering: false,
      useColorInfo: false,
      range: '',
      symbols: '',
      conversionInProgress: false,
      outputFiles: [],
      errorMessage: '',
      logger: new Logger('FontConverter'),
      
      // UI text translations
      translations: {
        zh: {
          title: 'LVGL字体转换工具',
          inputSettings: '输入设置',
          fontFile: '字体文件',
          chooseFile: '选择文件',
          selectedFile: '已选择文件',
          fontName: '字体名称',
          fontSizes: '字体大小 (px, 逗号分隔)',
          bpp: '每像素位数 (bpp)',
          fallback: '后备字体',
          fallbackPlaceholder: '默认并推荐为NULL',
          enableCompression: '启用字体压缩（减小文件大小但会降低渲染速度）',
          enableSubpixelRendering: '水平子像素渲染（可能提高字体质量但会增大文件大小）',
          useColorInfo: '尝试使用字体中的字形颜色信息创建灰度图标。由于灰度通过透明度模拟，仅在对比度背景上效果良好。',
          configImport: '从YAML导入Range/Symbols',
          unicodeRange: 'Unicode范围 (例如 0x20-0x7F,0x410-0x44F)',
          symbols: '符号 (要包含的特定字符)',
          convert: '转换',
          output: '输出',
          converting: '转换中...',
          generatedFiles: '生成的文件:',
          noFilesGenerated: '尚未生成文件',
          selectFontFileFirst: '请先选择字体文件',
          enterFontName: '请输入字体名称',
          enterFontSizes: '请至少输入一个字体大小',
          enterValidFontSizes: '请输入有效的字体大小',
          conversionFailed: '转换失败:',
          startingProcess: '开始字体转换过程',
          processAborted: '字体转换已中止:',
          processingFontSize: '正在处理字体大小: %size%px',
          successfullyRead: '成功读取字体文件，大小: %size% bytes',
          successfullyConverted: '成功转换字体大小 %size%px，生成 %count% 个文件',
          processCompleted: '字体转换过程已成功完成'
        },
        en: {
          title: 'LVGL Font Converter',
          inputSettings: 'Input Settings',
          fontFile: 'Font File',
          chooseFile: 'Choose File',
          selectedFile: 'Selected File',
          fontName: 'Font Name',
          fontSizes: 'Font Sizes (px, comma-separated)',
          bpp: 'Bits per Pixel (bpp)',
          fallback: 'Fallback Font',
          fallbackPlaceholder: 'Default and recommended is NULL',
          enableCompression: 'Enable Font compression (reduces size but results in slower rendering)',
          enableSubpixelRendering: 'Horizontal subpixel rendering (may improve font quality but results in larger fonts)',
          useColorInfo: 'Try to use glyph color info from font to create grayscale icons. Since gray tones are emulated via transparency, result will be good on contrast background only.',
          configImport: 'Import Range/Symbols from YAML',
          unicodeRange: 'Unicode Range (e.g. 0x20-0x7F,0x410-0x44F)',
          symbols: 'Symbols (specific characters to include)',
          convert: 'Convert',
          output: 'Output',
          converting: 'Converting...',
          generatedFiles: 'Generated Files:',
          noFilesGenerated: 'No files generated yet',
          selectFontFileFirst: 'Please select a font file first',
          enterFontName: 'Please enter a font name',
          enterFontSizes: 'Please enter at least one font size',
          enterValidFontSizes: 'Please enter valid font sizes',
          conversionFailed: 'Conversion failed:',
          startingProcess: 'Starting font conversion process',
          processAborted: 'Font conversion aborted:',
          processingFontSize: 'Processing font size: %size%px',
          successfullyRead: 'Successfully read font file, size: %size% bytes',
          successfullyConverted: 'Successfully converted font size %size%px, generated %count% files',
          processCompleted: 'Font conversion process completed successfully'
        }
      }
    };
  },
  computed: {
    t() {
      return this.translations[this.language];
    }
  },
  methods: {
    // Toggle language between Chinese and English
    toggleLanguage() {
      this.language = this.language === 'zh' ? 'en' : 'zh';
    },
    
    handleFontFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.fontFile = file;
        this.fontFileName = file.name;
        // Set default font name based on file name
        this.fontName = file.name.replace(/\.[^/.]+$/, '');
      }
    },
    
    handleConfigImport(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target.result;
            let data;
            
            // Parse as YAML (only support YAML now)
            data = yaml.load(content);
            
            if (data.range) this.range = data.range;
            if (data.symbols) this.symbols = data.symbols;
          } catch (error) {
            this.errorMessage = `Invalid file: ${error.message}`;
          }
        };
        reader.readAsText(file);
      }
    },
    
    async convertFont() {
      this.logger.debug('Starting font conversion process');
      
      if (!this.fontFile) {
        this.errorMessage = 'Please select a font file first';
        this.logger.warn('Font conversion aborted: No font file selected');
        return;
      }
      
      if (!this.fontName) {
        this.errorMessage = 'Please enter a font name';
        this.logger.warn('Font conversion aborted: No font name provided');
        return;
      }
      
      if (!this.fontSizes) {
        this.errorMessage = 'Please enter at least one font size';
        this.logger.warn('Font conversion aborted: No font sizes provided');
        return;
      }
      
      const sizes = this.fontSizes.split(',').map(size => parseInt(size.trim())).filter(size => !isNaN(size));
      if (sizes.length === 0) {
        this.errorMessage = 'Please enter valid font sizes';
        this.logger.warn('Font conversion aborted: No valid font sizes provided');
        return;
      }
      
      this.conversionInProgress = true;
      this.errorMessage = '';
      this.outputFiles = [];
      
      try {
        this.logger.info(`Starting to process font file: ${this.fontFileName}`, {
          fontName: this.fontName,
          fontSizes: sizes,
          bpp: this.bpp,
          range: this.range,
          symbols: this.symbols
        });
        
        // Read font file as ArrayBuffer
        this.logger.debug('Reading font file as ArrayBuffer');
        const fontArrayBuffer = await this.readFileAsArrayBuffer(this.fontFile);
        this.logger.info(`Successfully read font file, size: ${fontArrayBuffer.byteLength} bytes`);
        
        // Generate font for each size
        for (const size of sizes) {
          this.logger.info(`Processing font size: ${size}px`);
          
          // Generate options for lv_font_conv
          const outputFileName = `out.c`;
          const options = {
            font: [
              {
                source_path: this.fontFileName,
                source_bin: fontArrayBuffer
              }
            ],
            bpp: parseInt(this.bpp),
            format: 'lvgl',
            size: size,
            compress: this.enableCompression,
            lcd: this.enableSubpixelRendering,
            use_color_info: this.useColorInfo,
            lv_fallback: this.fallback || undefined,
            range: [],
            symbols: '',
            output: outputFileName
          };
          
          // Add range and symbols if provided
          if (this.range) {
            // Format ranges correctly for lv_font_conv
            options.font[0].ranges = this.range.split(',').map(r => ({
              range: this.parseRange(r.trim())
            }));
            this.logger.debug(`Added range configuration: ${JSON.stringify(options.font[0].ranges)}`);
          } else {
            options.font[0].ranges = [];
          }
          
          if (this.symbols) {
            options.font[0].ranges.push({
              symbols: this.symbols
            });
            this.logger.debug(`Added symbols configuration: ${this.symbols}`);
          }
          
          // Convert font
          this.logger.debug('Calling lv_font_conv with options', options);
          const result = await lvFontConv(options);
          this.logger.info(`Successfully converted font size ${size}px, generated ${Object.keys(result).length} files`);
          
          // Create download link for each generated file
          const fileContents = Object.values(result);
          for (const fileContent of fileContents) {
            // Use the correct file name format: fontname_size.c
            const customFileName = `${this.fontName}_${size}.c`;
            
            // Create blob and download link
            const blob = new Blob([fileContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            this.outputFiles.push({
              name: customFileName,
              url: url
            });
            
            this.logger.debug(`Generated file: ${customFileName}, size: ${fileContent.length} bytes`);
          }
        }
        
        this.logger.info('Font conversion process completed successfully', {
          outputFilesCount: this.outputFiles.length
        });
      } catch (error) {
        this.logger.error(error, 'Font conversion failed', {
          fontFile: this.fontFileName,
          fontName: this.fontName,
          fontSizes: sizes,
          bpp: this.bpp
        });
        
        // Special handling for FreeType errors
        if (error.message.includes('FT_') || error.message.includes('FreeType')) {
          this.logger.freetypeError(error, this.fontFileName, {
            fontName: this.fontName,
            bpp: this.bpp
          });
        }
        
        this.errorMessage = 'Conversion failed: ' + error.message;
      } finally {
        this.conversionInProgress = false;
        this.logger.debug('Font conversion process finished');
      }
    },
    
    readFileAsArrayBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e.target.error);
        reader.readAsArrayBuffer(file);
      });
    },
    
    parseRange(rangeStr) {
      // Parse range string like "0x20-0x7F" or single value "0x410"
      const parts = rangeStr.split('-');
      const start = parseInt(parts[0], 16);
      const end = parts.length > 1 ? parseInt(parts[1], 16) : start;
      
      // Return range in the format expected by lv_font_conv
      return [start, end, 0];
    }
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.container {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.input-section, .output-section {
  flex: 1;
  min-width: 300px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  margin-top: 0;
  color: #3498db;
  font-size: 1.5em;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="file"],
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
}

.language-toggle {
  text-align: right;
  margin-bottom: 20px;
}

.language-toggle button {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.language-toggle button:hover {
  background: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.language-toggle button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* File upload styling */
.file-upload-wrapper {
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.file-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
  position: relative;
  z-index: 1;
}

.file-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.4);
}

.file-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.3);
}

.file-name {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
  flex: 1;
  min-width: 200px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.convert-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.convert-btn:hover:not(:disabled) {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.convert-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.convert-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  opacity: 0.7;
}

.convert-btn:disabled:hover {
  background-color: #bdc3c7;
}

.output-files {
  margin-top: 20px;
}

.output-files ul {
  list-style-type: none;
  padding: 0;
}

.output-files li {
  margin-bottom: 10px;
}

.output-files a {
  color: #3498db;
  text-decoration: none;
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  display: block;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.output-files a:hover {
  background-color: #f0f8ff;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #3498db;
  font-weight: bold;
}

.error {
  color: #e74c3c;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
  margin-top: 20px;
}

.empty-output {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
}
</style>
