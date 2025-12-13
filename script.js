// 获取DOM元素
const candle = document.getElementById('candle');
const flame = document.getElementById('flame');
const flameGlows = document.querySelectorAll('.flame-glow');
const candleWick = document.querySelector('.candle-wick');
const candleBody = document.querySelector('.candle-body');
const flameContainer = document.querySelector('.flame-container');
const pageContainer = document.querySelector('.container');

const MAX_FLAME_SCALE = 1.1;
const MAX_GLOW_SCALE = 1.4;

function layoutFlame() {
    if (!flame || !flameContainer || !candleBody || !candleWick || !pageContainer) return;

    candleBody.style.overflow = 'visible';

    const wickTop = parseFloat(getComputedStyle(candleWick).top) || -15;
    const flameBaseHeight = flame.offsetHeight || 100;
    const glowWidths = Array.from(flameGlows).map(el => el.offsetWidth || 0);
    const glowHeights = Array.from(flameGlows).map(el => el.offsetHeight || 0);
    const maxGlowWidth = Math.max(flameBaseHeight, ...glowWidths);
    const maxGlowHeight = Math.max(flameBaseHeight, ...glowHeights);

    const containerWidth = Math.ceil(maxGlowWidth * MAX_GLOW_SCALE);
    const containerHeight = Math.ceil(Math.max(flameBaseHeight * MAX_FLAME_SCALE, maxGlowHeight * MAX_GLOW_SCALE));

    flameContainer.style.width = `${containerWidth}px`;
    flameContainer.style.height = `${containerHeight}px`;
    flameContainer.style.top = `${wickTop - containerHeight}px`;

    const safeTopPadding = containerHeight + 24;
    pageContainer.style.paddingTop = `${safeTopPadding}px`;

    const availableWidth = window.innerWidth;
    const requiredWidth = Math.max(containerWidth + 40, candleBody.offsetWidth + 40);
    if (requiredWidth > availableWidth) {
        const scale = Math.max(0.6, Math.min(1, (availableWidth - 40) / requiredWidth));
        candle.style.transform = `scale(${scale})`;
    } else {
        candle.style.transform = 'scale(1)';
    }
}

window.addEventListener('resize', layoutFlame);
document.addEventListener('DOMContentLoaded', layoutFlame);

// 状态变量
let isExtinguished = false;
let longPressTimer = null;
let lastTap = 0;
const DOUBLE_TAP_DELAY = 300;
const LONG_PRESS_DURATION = 500;

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 火焰吹动效果
function blowFlame() {
    if (isExtinguished) return;
    
    // 移除之前的动画类
    flame.classList.remove('blow');
    flameGlows.forEach(glow => glow.classList.remove('blow'));
    
    // 触发重排，使动画重新生效
    void flame.offsetWidth;
    
    // 添加吹动效果类
    flame.classList.add('blow');
    flameGlows.forEach(glow => glow.classList.add('blow'));
    
    // 1秒后恢复正常摇曳
    setTimeout(() => {
        flame.classList.remove('blow');
        flameGlows.forEach(glow => glow.classList.remove('blow'));
    }, 1000);
}

// 熄灭火焰
function extinguishFlame() {
    if (isExtinguished) return;
    
    isExtinguished = true;
    flame.classList.add('extinguished');
    flameGlows.forEach(glow => glow.classList.add('extinguished'));
    candleWick.classList.add('extinguished');
}

// 点燃火焰
function igniteFlame() {
    if (!isExtinguished) return;
    
    isExtinguished = false;
    flame.classList.remove('extinguished');
    flameGlows.forEach(glow => glow.classList.remove('extinguished'));
    candleWick.classList.remove('extinguished');
}

// 处理点击事件
const handleClick = debounce(() => {
    blowFlame();
}, 200);

// 处理双击事件
function handleDoubleClick() {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
        // 双击事件
        extinguishFlame();
    }
    
    lastTap = currentTime;
}

// 开始长按计时
function startLongPress() {
    longPressTimer = setTimeout(() => {
        igniteFlame();
    }, LONG_PRESS_DURATION);
}

// 取消长按计时
function cancelLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

// 添加鼠标事件监听器
candle.addEventListener('click', handleClick);
candle.addEventListener('click', handleDoubleClick);
candle.addEventListener('mousedown', startLongPress);
candle.addEventListener('mouseup', cancelLongPress);
candle.addEventListener('mouseleave', cancelLongPress);

// 添加触摸事件监听器
candle.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startLongPress();
    handleClick();
    handleDoubleClick();
});

candle.addEventListener('touchend', (e) => {
    e.preventDefault();
    cancelLongPress();
});

candle.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    cancelLongPress();
});

// 添加触摸缩放事件监听器（双指缩放熄灭火焰）
candle.addEventListener('gestureend', (e) => {
    e.preventDefault();
    if (e.scale < 1) {
        // 缩小手势，熄灭火焰
        extinguishFlame();
    }
});

// 初始化：确保火焰处于点燃状态
igniteFlame();
