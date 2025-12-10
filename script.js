// Emoji识别游戏主程序
class EmojiGame {
    constructor() {
        // 初始化游戏数据
        // 仅保留食物和动物类别的Emoji
        this.emojis = [
            // 动物类
            '�', '�', '�', '🐹', '�', '�', '�', '�', '�', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣',
            '�', '🦆', '🦅', '🦉', '🦇', '�', '�', '🐴', '�', '🐝',
            '🐛', '�', '🐌', '🐞', '🐜', '🕷️', '�', '�', '�', '🦎',
            '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟',
            '🐬', '🐳', '�', '🦈', '�', '�', '�', '�', '�', '🦧',
            // 食物类
            '🍎', '�', '🍊', '🍋', '🍌', '�', '🍇', '🍓', '�', '�',
            '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬',
            '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠',
            '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈', '🥞',
            '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕',
            '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫',
            '�', '�', '🍲', '�', '�', '�', '�', '🦪', '🍤', '🍙',
            '🍚', '🍘', '�', '�', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦'
        ];
        
        this.fireworkEmojis = ['🎆', '✨', '🎇', '💫', '⭐', '🌟'];
        this.poopEmojis = ['💩'];
        this.currentEmoji = '';
        this.historyEmojis = [];
        // 存储已显示过的Emoji，确保不重复显示
        this.usedEmojis = [];
        // 存储每个Emoji的猜谜状态，key为Emoji，value为boolean（true表示已猜对，false表示未猜对）
        this.guessedStatus = {};
        // 剩余可用的Emoji数组
        this.availableEmojis = [];
        // 动画相关变量
        this.animationInterval = null;
        this.isAnimating = false;
        
        // 初始化DOM元素
        this.canvas = document.getElementById('emojiCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.emojiInput = document.getElementById('emojiInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.rightBtn = document.getElementById('rightBtn');
        this.leftBtn = document.getElementById('leftBtn');
        this.historyPanel = document.getElementById('historyPanel');
        this.historyList = document.getElementById('historyList');
        this.closeHistory = document.getElementById('closeHistory');
        this.animationContainer = document.getElementById('animationContainer');
        
        // 手势检测变量
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        // 点击状态变量
        this.isClicking = false;
        
        // 初始化游戏
        this.init();
    }
    
    // 初始化游戏
    init() {
        // 设置Canvas尺寸
        this.resizeCanvas();
        
        // 绑定事件监听器
        this.bindEvents();
        
        // 检测设备Emoji样式
        this.detectEmojiStyle();
        // 过滤不支持的Emoji
        this.filterUnsupportedEmojis();
        // 初始化可用Emoji数组
        this.availableEmojis = [...this.emojis];
        
        // 开始游戏 - 必须在availableEmojis初始化之后调用
        this.nextEmoji();
    }
    
    // 调整Canvas尺寸以适应设备
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 200);
        this.canvas.width = size;
        this.canvas.height = size;
    }
    
    // 绑定事件监听器
    bindEvents() {
        // 窗口 resize 事件
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 提交按钮事件
        this.submitBtn.addEventListener('click', () => this.checkInput());
        
        // 输入框回车事件
        this.emojiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkInput();
            }
        });
        
        // 下一个按钮事件
        this.rightBtn.addEventListener('click', () => this.nextEmoji());
        
        // 历史列表按钮事件
        this.leftBtn.addEventListener('click', () => this.showHistory());
        
        // 关闭历史列表事件
        this.closeHistory.addEventListener('click', () => this.hideHistory());
        
        // 手势事件
        this.bindGestureEvents();
    }
    
    // 绑定手势事件
    bindGestureEvents() {
        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            // 开始点击
            this.isClicking = true;
            this.drawEmojiOutline(this.currentEmoji);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            this.endX = e.changedTouches[0].clientX;
            this.endY = e.changedTouches[0].clientY;
            this.handleSwipe();
            // 结束点击
            this.isClicking = false;
            this.drawEmojiOutline(this.currentEmoji);
        });
        
        // 鼠标事件（用于桌面端测试）
        this.canvas.addEventListener('mousedown', (e) => {
            this.startX = e.clientX;
            this.startY = e.clientY;
            // 开始点击
            this.isClicking = true;
            this.drawEmojiOutline(this.currentEmoji);
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.endX = e.clientX;
            this.endY = e.clientY;
            this.handleSwipe();
            // 结束点击
            this.isClicking = false;
            this.drawEmojiOutline(this.currentEmoji);
        });
        
        // 鼠标离开画布时结束点击
        this.canvas.addEventListener('mouseleave', () => {
            this.isClicking = false;
            this.drawEmojiOutline(this.currentEmoji);
        });
    }
    
    // 处理滑动手势
    handleSwipe() {
        const deltaX = this.endX - this.startX;
        const deltaY = this.endY - this.startY;
        
        // 检测滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                // 右滑 - 下一个Emoji
                this.nextEmoji();
            } else {
                // 左滑 - 显示历史列表
                this.showHistory();
            }
        }
    }
    
    // 检测设备Emoji样式
    detectEmojiStyle() {
        // 创建一个临时元素来检测Emoji样式
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-100px';
        tempDiv.style.fontSize = '48px';
        tempDiv.textContent = '😊';
        document.body.appendChild(tempDiv);
        
        // 测量Emoji的渲染尺寸
        const rect = tempDiv.getBoundingClientRect();
        this.emojiSize = rect.width;
        
        // 移除临时元素
        document.body.removeChild(tempDiv);
        
        console.log('设备Emoji尺寸:', this.emojiSize);
    }
    
    // 检测Emoji是否在当前平台上支持
    isEmojiSupported(emoji) {
        // 方法1: 检测是否显示为占位符
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.top = '-100px';
        tempDiv.style.fontSize = '48px';
        tempDiv.style.fontFamily = 'sans-serif';
        
        tempDiv.textContent = emoji;
        document.body.appendChild(tempDiv);
        
        // 获取渲染后的文本
        const renderedText = tempDiv.textContent;
        
        // 移除临时元素
        document.body.removeChild(tempDiv);
        
        // 检查是否显示为占位符（通常是�字符）
        if (renderedText === '�' || renderedText.length === 0) {
            return false;
        }
        
        // 方法2: 检测渲染宽度
        const testDiv = document.createElement('div');
        testDiv.style.position = 'absolute';
        testDiv.style.top = '-100px';
        testDiv.style.fontSize = '48px';
        testDiv.style.fontFamily = 'sans-serif';
        
        // 测试已知支持的Emoji
        testDiv.textContent = '😊';
        document.body.appendChild(testDiv);
        const supportedWidth = testDiv.getBoundingClientRect().width;
        
        // 测试目标Emoji
        testDiv.textContent = emoji;
        const testWidth = testDiv.getBoundingClientRect().width;
        
        // 移除临时元素
        document.body.removeChild(testDiv);
        
        // 不支持的Emoji通常渲染宽度会比较小
        return testWidth >= supportedWidth * 0.6;
    }
    
    // 过滤掉不支持的Emoji
    filterUnsupportedEmojis() {
        const originalCount = this.emojis.length;
        this.emojis = this.emojis.filter(emoji => this.isEmojiSupported(emoji));
        const filteredCount = this.emojis.length;
        
        console.log(`Emoji过滤完成: 原数量 ${originalCount}, 过滤后数量 ${filteredCount}`);
        
        // 如果所有Emoji都被过滤掉，使用默认的常用Emoji列表
        if (this.emojis.length === 0) {
            console.warn('所有Emoji都被过滤掉，使用默认常用Emoji列表');
            this.emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🍎', '🍌', '🍊', '🍋', '🍒'];
        }
    }
    
    // 绘制Emoji轮廓
    drawEmojiOutline(emoji, showOriginal = false) {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const centerX = canvas.width / 2;
        // 调整垂直位置，确保Emoji完全显示，不被顶部遮挡
        const centerY = canvas.height / 2 + 10;
        // 减小字体大小，确保完整显示
        const size = Math.min(canvas.width, canvas.height) * 0.75;
        
        // 1. 绘制当前背景色，与宝可梦"我是谁"风格保持一致
        const bgColor = this.currentBgColor || '#ffffff';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (showOriginal) {
            // 2. 直接绘制原Emoji图片
            ctx.fillStyle = '#000000';
            ctx.font = `${size}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, centerX, centerY);
        } else {
            // 2. 创建离屏Canvas，用于处理Emoji
            const offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = canvas.width;
            offscreenCanvas.height = canvas.height;
            const offscreenCtx = offscreenCanvas.getContext('2d');
            
            // 清除离屏Canvas（透明背景）
            offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            
            // 设置文本样式，绘制白色Emoji
            offscreenCtx.fillStyle = ctx.fillStyle;
            offscreenCtx.font = `${size}px sans-serif`;
            offscreenCtx.textAlign = 'center';
            offscreenCtx.textBaseline = 'middle';
            offscreenCtx.fillText(emoji, centerX, centerY);
            
            // 3. 获取像素数据
            const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const data = imageData.data;
            const width = offscreenCanvas.width;
            const height = offscreenCanvas.height;
            
            // 4. 遍历像素，确保非透明区域外的所有区域颜色与currentBgColor一致
            // 注意：canvas已经被填充为bgColor，所以透明区域会显示bgColor
            // 只需要绘制非透明区域为黑色即可
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    const alpha = data[index + 3];
                    
                    // 如果是非透明像素（alpha > 0），绘制黑色纯色
                    if (alpha > 0) {
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(x, y, 1, 1);
                    }
                    // 透明区域保持bgColor，无需额外处理
                }
            }
        }
    }
    
    // 检测是否为边缘像素
    isEdgePixel(x, y, data, width) {
        // 扩展边缘检测范围，确保只保留明显的边缘
        const offsets = [
            [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
            [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2],
            [0, -2],  [0, -1],          [0, 1],  [0, 2],
            [1, -2],  [1, -1],  [1, 0],  [1, 1],  [1, 2],
            [2, -2],  [2, -1],  [2, 0],  [2, 1],  [2, 2]
        ];
        
        let hasTransparent = false;
        let hasOpaque = false;
        
        for (const [dx, dy] of offsets) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < data.height) {
                const index = (ny * width + nx) * 4;
                if (data[index + 3] > 200) {
                    hasOpaque = true;
                } else {
                    hasTransparent = true;
                }
            } else {
                // 边界外视为透明
                hasTransparent = true;
            }
        }
        
        // 边缘像素是同时有透明和不透明邻居的像素
        return hasTransparent && hasOpaque;
    }
    
    // 随机选择一个未显示过的Emoji
    getRandomEmoji() {
        if (this.availableEmojis.length === 0) {
            // 所有Emoji都已显示完毕
            return null;
        }
        // 从可用Emoji中随机选择一个
        const randomIndex = Math.floor(Math.random() * this.availableEmojis.length);
        return this.availableEmojis[randomIndex];
    }
    
    // 显示下一个Emoji
    nextEmoji() {
        // 重置Canvas样式为宝可梦风格
        this.canvas.style.borderColor = '#ffffff';
        this.canvas.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.3)';
        
        // 停止当前动画
        this.stopAnimation();
        
        // 确保availableEmojis不为空
        if (this.availableEmojis.length === 0) {
            // 重新初始化可用Emoji（如果需要的话）
            this.availableEmojis = [...this.emojis];
            console.log('重置availableEmojis数组');
        }
        
        // 从可用Emoji中获取一个未显示过的Emoji
        this.currentEmoji = this.getRandomEmoji();
        
        if (this.currentEmoji === null) {
            // 所有Emoji都已显示完毕
            this.showAllEmojisCompleted();
            return;
        }
        
        // 宝可梦经典色系
        const pokemonColors = [
            '#ff6b6b', // 红色系
            '#4ecdc4', // 绿色系
            '#45b7d1', // 蓝色系
            '#ffe66d', // 黄色系
            '#f7b7a3', // 粉色系
            '#a8e6cf', // 青色系
            '#ffd3b6', // 橙色系
            '#c7ceea'  // 紫色系
        ];
        
        // 随机选择一种颜色
        const randomColor = pokemonColors[Math.floor(Math.random() * pokemonColors.length)];
        
        // 保存当前颜色到实例属性，供drawEmojiOutline使用
        this.currentBgColor = randomColor;
        
        // 更新Canvas相关区域颜色
        // 1. 更新pokemon-frame背景色
        const pokemonFrame = document.querySelector('.pokemon-frame');
        pokemonFrame.style.backgroundColor = randomColor;
        
        // 2. 更新emoji-container背景色
        const emojiContainer = document.querySelector('.emoji-container');
        emojiContainer.style.backgroundColor = randomColor;
        
        // 3. 更新emojiCanvas背景色
        const emojiCanvas = document.getElementById('emojiCanvas');
        emojiCanvas.style.backgroundColor = randomColor;
        
        // 添加切换动画
        this.canvas.classList.add('slide-out-left');
        
        setTimeout(() => {
            // 清除所有当前动画元素
            this.clearAnimations();
            
            // 绘制新的Emoji轮廓
            this.drawEmojiOutline(this.currentEmoji);
            this.emojiInput.value = '';
            this.emojiInput.focus();
            
            // 添加到已使用Emoji列表
            this.usedEmojis.push(this.currentEmoji);
            // 从可用Emoji列表中移除
            const index = this.availableEmojis.indexOf(this.currentEmoji);
            if (index > -1) {
                this.availableEmojis.splice(index, 1);
            }
            
            // 添加到历史记录
            if (!this.historyEmojis.includes(this.currentEmoji)) {
                this.historyEmojis.push(this.currentEmoji);
                // 初始化为未猜对状态
                this.guessedStatus[this.currentEmoji] = false;
            }
            
            // 切换到淡入动画
            this.canvas.classList.remove('slide-out-left');
            this.canvas.classList.add('fade-in');
            setTimeout(() => {
                this.canvas.classList.remove('fade-in');
            }, 300);
        }, 300);
    }
    
    // 清除所有当前动画元素
    clearAnimations() {
        const animations = this.animationContainer.querySelectorAll('.firework, .poop');
        animations.forEach(anim => {
            anim.remove();
        });
    }
    
    // 所有Emoji都已显示完毕时的处理
    showAllEmojisCompleted() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        
        // 清空Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置宝可梦风格文本样式
        ctx.font = 'bold 20px Arial Black';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffde00';
        ctx.strokeStyle = '#3b4cca';
        ctx.lineWidth = 3;
        
        // 显示提示信息
        ctx.strokeText('所有Emoji已收集完毕！', canvas.width / 2, canvas.height / 2);
        ctx.fillText('所有Emoji已收集完毕！', canvas.width / 2, canvas.height / 2);
        
        ctx.font = 'bold 16px Arial Black';
        ctx.strokeText('恭喜成为Emoji大师！', canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText('恭喜成为Emoji大师！', canvas.width / 2, canvas.height / 2 + 30);
        
        // 清空输入框并禁用
        this.emojiInput.value = '';
        this.emojiInput.disabled = true;
        this.submitBtn.disabled = true;
        this.rightBtn.disabled = true;
        
        // 显示烟花动画庆祝
        this.showFireworks();
    }
    
    // 检查用户输入
    checkInput() {
        const userInput = this.emojiInput.value.trim();
        
        if (userInput === this.currentEmoji) {
            // 匹配成功
            this.guessedStatus[this.currentEmoji] = true;
            this.showFireworks();
            // 添加成功状态的视觉反馈
            this.canvas.style.borderColor = '#28a745';
            this.canvas.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.5)';
            // 显示原Emoji图片
            this.drawEmojiOutline(this.currentEmoji, true);
        } else {
            // 匹配失败
            this.showPoop();
            // 添加失败状态的视觉反馈
            this.canvas.style.borderColor = '#dc3545';
            this.canvas.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.5)';
        }
    }
    
    // 显示烟花动画
    showFireworks() {
        // 清除之前的动画
        this.stopAnimation();
        
        // 设置动画状态
        this.isAnimating = true;
        
        // 循环播放烟花动画
        this.animationInterval = setInterval(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.textContent = this.fireworkEmojis[Math.floor(Math.random() * this.fireworkEmojis.length)];
            
            // 全屏随机位置
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            firework.style.left = `${x}px`;
            firework.style.top = `${y}px`;
            
            // 随机旋转角度和缩放
            const rotate = Math.random() * 360;
            const scale = 0.5 + Math.random() * 1.5;
            firework.style.transform = `rotate(${rotate}deg) scale(${scale})`;
            
            // 添加动画结束回调
            firework.addEventListener('animationend', () => {
                firework.remove();
            });
            
            this.animationContainer.appendChild(firework);
        }, 100);
    }
    
    // 停止动画
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.isAnimating = false;
        this.clearAnimations();
    }
    
    // 显示屎类Emoji坠落动画
    showPoop() {
        // 清除之前的动画
        this.stopAnimation();
        
        // 设置动画状态
        this.isAnimating = true;
        
        // 循环播放屎类Emoji坠落动画
        this.animationInterval = setInterval(() => {
            const poop = document.createElement('div');
            poop.className = 'poop';
            poop.textContent = this.poopEmojis[Math.floor(Math.random() * this.poopEmojis.length)];
            
            // 全屏顶部随机位置
            const x = Math.random() * window.innerWidth;
            poop.style.left = `${x}px`;
            
            // 随机旋转角度和缩放
            const rotate = Math.random() * 360;
            const scale = 0.8 + Math.random() * 0.8;
            poop.style.transform = `rotate(${rotate}deg) scale(${scale})`;
            
            // 添加动画结束回调
            poop.addEventListener('animationend', () => {
                poop.remove();
            });
            
            this.animationContainer.appendChild(poop);
        }, 200);
    }
    
    // 显示历史记录
    showHistory() {
        this.historyPanel.classList.add('active');
        this.renderHistory();
    }
    
    // 隐藏历史记录
    hideHistory() {
        this.historyPanel.classList.remove('active');
    }
    
    // 渲染历史记录
    renderHistory() {
        this.historyList.innerHTML = '';
        
        this.historyEmojis.forEach(emoji => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // 根据猜谜状态添加不同的类名
            if (this.guessedStatus[emoji]) {
                historyItem.classList.add('guessed');
            } else {
                historyItem.classList.add('not-guessed');
            }
            
            // 轮廓Canvas
            const miniCanvas = document.createElement('canvas');
            miniCanvas.width = 60;
            miniCanvas.height = 60;
            const miniCtx = miniCanvas.getContext('2d');
            
            // 1. 绘制当前背景色，与主Canvas保持一致
            const bgColor = this.currentBgColor || '#ffffff';
            miniCtx.fillStyle = bgColor;
            miniCtx.fillRect(0, 0, miniCanvas.width, miniCanvas.height);
            
            if (this.guessedStatus[emoji]) {
                // 已猜对的Emoji：显示完整图像
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'emoji';
                emojiSpan.textContent = emoji;
                historyItem.appendChild(emojiSpan);
                
                // 绘制完整Emoji到Canvas
                miniCtx.fillStyle = '#000000';
                miniCtx.font = '40px sans-serif';
                miniCtx.textAlign = 'center';
                miniCtx.textBaseline = 'middle';
                miniCtx.fillText(emoji, 30, 30);
            } else {
                // 未猜对的Emoji：绘制纯色轮廓，与主Canvas逻辑完全一致
                // 创建离屏Canvas，用于处理Emoji
                const offscreenCanvas = document.createElement('canvas');
                offscreenCanvas.width = 60;
                offscreenCanvas.height = 60;
                const offscreenCtx = offscreenCanvas.getContext('2d');
                
                // 清除离屏Canvas（透明背景）
                offscreenCtx.clearRect(0, 0, 60, 60);
                
                // 绘制Emoji到离屏Canvas
                offscreenCtx.fillStyle = '#ffffff';
                offscreenCtx.font = '40px sans-serif';
                offscreenCtx.textAlign = 'center';
                offscreenCtx.textBaseline = 'middle';
                offscreenCtx.fillText(emoji, 30, 30);
                
                // 获取像素数据
                const imageData = offscreenCtx.getImageData(0, 0, 60, 60);
                const data = imageData.data;
                
                // 遍历像素，非透明区域绘制黑色，透明区域保持bgColor
                for (let y = 0; y < 60; y++) {
                    for (let x = 0; x < 60; x++) {
                        const index = (y * 60 + x) * 4;
                        const alpha = data[index + 3];
                        
                        // 如果是非透明像素（alpha > 0），绘制黑色纯色
                        if (alpha > 0) {
                            miniCtx.fillStyle = '#000000';
                            miniCtx.fillRect(x, y, 1, 1);
                        }
                        // 透明区域保持bgColor，无需额外处理
                    }
                }
            }
            
            historyItem.appendChild(miniCanvas);
            
            // 添加点击事件，未猜对的项目可以继续猜谜
            historyItem.addEventListener('click', () => {
                if (!this.guessedStatus[emoji]) {
                    // 切换到该Emoji继续猜谜，使用当时的颜色
                    this.currentEmoji = emoji;
                    // 保存当时的颜色为当前颜色
                    this.currentBgColor = emojiItem.color;
                    
                    // 更新所有相关元素的背景色
                    const pokemonFrame = document.querySelector('.pokemon-frame');
                    if (pokemonFrame) {
                        pokemonFrame.style.backgroundColor = this.currentBgColor;
                    }
                    const emojiContainer = document.querySelector('.emoji-container');
                    if (emojiContainer) {
                        emojiContainer.style.backgroundColor = this.currentBgColor;
                    }
                    const emojiCanvas = document.getElementById('emojiCanvas');
                    if (emojiCanvas) {
                        emojiCanvas.style.backgroundColor = this.currentBgColor;
                    }
                    
                    // 绘制Emoji
                    this.drawEmojiOutline(emoji);
                    this.emojiInput.value = '';
                    this.emojiInput.focus();
                    // 关闭历史记录面板
                    this.hideHistory();
                }
            });
            
            this.historyList.appendChild(historyItem);
        });
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new EmojiGame();
});