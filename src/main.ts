import { Game2048, Direction, GameState } from './game';
import { HeadTracker, HeadPose } from './headTracker';
import { PostprocessingEffects } from './postprocessing';
import './styles.css';

// 主应用类
class App {
    private game: Game2048;
    private headTracker: HeadTracker;
    private gameContainer: HTMLElement;
    private scoreElement: HTMLElement;
    private statusText: HTMLElement;
    private statusIndicator: HTMLElement;
    private directionIndicators: Record<Direction, HTMLElement>;
    private currentDirectionElement: HTMLElement;
    private sensitivitySlider: HTMLInputElement;
    private pauseButton: HTMLElement;
    private restartButton: HTMLElement;
    private gameOverModal: HTMLElement;
    private gameOverTitle: HTMLElement;
    private gameOverMessage: HTMLElement;
    private finalScoreElement: HTMLElement;
    private playAgainButton: HTMLElement;
    private lastDirection: Direction;
    private directionCooldown: boolean;
    private cooldownDuration: number;
    private postprocessing: PostprocessingEffects;
    
    // 监控元素
    private posePitchElement: HTMLElement;
    private poseYawElement: HTMLElement;
    private poseRollElement: HTMLElement;
    private directionRawElement: HTMLElement;
    private directionStabilizedElement: HTMLElement;
    private directionThresholdElement: HTMLElement;
    private statusLogElement: HTMLElement;
    
    // 悔棋相关元素
    private undoButton: HTMLButtonElement;
    private undoInfoElement: HTMLElement;

    constructor() {
        // 初始化DOM元素
        this.gameContainer = document.getElementById('game-container')!;
        this.scoreElement = document.getElementById('score')!;
        this.statusText = document.getElementById('status-text')!;
        this.statusIndicator = document.getElementById('status-indicator')!;
        this.directionIndicators = {
            up: document.getElementById('direction-up')!,
            down: document.getElementById('direction-down')!,
            left: document.getElementById('direction-left')!,
            right: document.getElementById('direction-right')!,
            none: document.createElement('div') // 虚拟元素，不显示
        };
        this.currentDirectionElement = document.getElementById('current-direction')!;
        this.sensitivitySlider = document.getElementById('sensitivity-slider')! as HTMLInputElement;
        this.pauseButton = document.getElementById('pause-btn')!;
        this.restartButton = document.getElementById('restart-btn')!;
        this.gameOverModal = document.getElementById('game-over-modal')!;
        this.gameOverTitle = document.getElementById('game-over-title')!;
        this.gameOverMessage = document.getElementById('game-over-message')!;
        this.finalScoreElement = document.getElementById('final-score')!;
        this.playAgainButton = document.getElementById('play-again-btn')!;
        
        // 初始化监控元素
        this.posePitchElement = document.getElementById('pose-pitch')!;
        this.poseYawElement = document.getElementById('pose-yaw')!;
        this.poseRollElement = document.getElementById('pose-roll')!;
        this.directionRawElement = document.getElementById('direction-raw')!;
        this.directionStabilizedElement = document.getElementById('direction-stabilized')!;
        this.directionThresholdElement = document.getElementById('direction-threshold')!;
        this.statusLogElement = document.getElementById('status-log')!;
        
        // 初始化悔棋相关元素
        this.undoButton = document.getElementById('undo-btn')! as HTMLButtonElement;
        this.undoInfoElement = document.getElementById('undo-info')!;
        
        // 初始化状态
        this.lastDirection = 'none';
        this.directionCooldown = false;
        this.cooldownDuration = 300; // 300ms冷却时间
        
        // 创建游戏实例
        this.game = new Game2048(
            4,
            this.onScoreChange.bind(this),
            this.onStateChange.bind(this),
            this.onBoardChange.bind(this)
        );
        
        // 创建头部追踪器实例
        const videoElement = document.getElementById('camera-feed')! as HTMLVideoElement;
        const canvasElement = document.getElementById('face-canvas')! as HTMLCanvasElement;
        
        // 检查sensitivitySlider是否存在，使用默认值5
        const sensitivityValue = this.sensitivitySlider ? parseInt(this.sensitivitySlider.value) : 5;
        
        this.headTracker = new HeadTracker(
            videoElement,
            canvasElement,
            this.onDirectionChange.bind(this),
            this.onPoseUpdate.bind(this),
            sensitivityValue,
            this.onMonitoringData.bind(this)
        );
        
        // 创建后处理效果实例
        const postprocessingCanvas = document.getElementById('postprocessing-canvas')! as HTMLCanvasElement;
        this.postprocessing = new PostprocessingEffects(postprocessingCanvas);
        
        // 初始化应用
        this.init();
        
        // 更新按钮文本
        this.updateRestartButtonText();
    }

    // 初始化应用
    private async init(): Promise<void> {
        console.log('Main application initialization started...');
        
        // 添加初始化日志
        this.addToStatusLog('Initializing application...');
        
        // 初始状态下不自动开始游戏，等待用户点击Start按钮
        console.log('Game initialized in standby state, waiting for user to click Start');
        
        // 初始化空白游戏板
        console.log('Initializing empty game board...');
        this.updateGameBoard(this.game.getBoard());
        console.log('Empty game board initialized successfully');
        
        // 设置初始游戏状态为paused
        this.game.pause();
        console.log('Game state set to paused, waiting for user to start');
        this.addToStatusLog('Game ready, click Start to begin');
        
        // 绑定事件监听器
        console.log('Binding event listeners...');
        this.bindEventListeners();
        console.log('Event listeners bound successfully');
        
        // 启动后处理效果
        console.log('Starting postprocessing effects...');
        this.postprocessing.start();
        console.log('Postprocessing effects started successfully');
        
        try {
            // 初始化头部追踪器
            this.addToStatusLog('Initializing head tracker...');
            console.log('Initializing head tracker...');
            await this.headTracker.init();
            console.log('Head tracker initialized successfully');
            
            this.statusText.textContent = 'Active';
            this.statusIndicator.classList.remove('status-inactive');
            this.statusIndicator.classList.add('status-active');
            this.addToStatusLog('Head tracker initialized successfully');
        } catch (error) {
            console.error('Failed to initialize head tracker:', error);
            console.error('Error stack:', (error as Error).stack);
            this.statusText.textContent = 'Camera Error';
            this.statusIndicator.classList.remove('status-active');
            this.statusIndicator.classList.add('status-inactive');
            
            // 显示友好的错误提示
            this.showCameraError(error as Error);
            this.addToStatusLog(`Head tracker initialization failed: ${(error as Error).message}`);
        }
        
        console.log('Main application initialization completed');
    }
    
    // 显示摄像头错误提示
    private showCameraError(error: Error): void {
        let errorMessage = 'Failed to access camera. Please make sure you have granted camera permissions and your camera is working properly.';
        let errorType = 'general';
        
        // 详细的错误类型检测
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
            errorType = 'permission';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found. Please connect a camera device and try again.';
            errorType = 'device';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is in use by another application. Please close other applications using the camera and try again.';
            errorType = 'busy';
        } else if (error.name === 'SecurityError' || error.message.includes('HTTPS')) {
            // 处理安全上下文错误
            errorMessage = 'Camera access requires HTTPS connection. Please use HTTPS protocol for camera access.';
            errorType = 'security';
        } else if (error.message.includes('getUserMedia is not supported')) {
            // 处理浏览器不支持错误
            errorMessage = 'Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.';
            errorType = 'unsupported';
        } else if (error.message.includes('Failed to load MediaPipe')) {
            // 处理MediaPipe加载错误
            errorMessage = 'Failed to load MediaPipe vision module. Please check your network connection or try again later.';
            errorType = 'network';
        } else if (error.message.includes('Failed to initialize MediaPipe')) {
            // 处理MediaPipe初始化错误
            errorMessage = 'Failed to initialize MediaPipe components. Please check your network connection or try again later.';
            errorType = 'network';
        } else if (error.message.includes('Permission denied')) {
            // 处理通用权限错误
            errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
            errorType = 'permission';
        } else if (error.message.includes('NotSupportedError')) {
            // 处理特定浏览器不支持的功能
            errorMessage = 'Camera access feature not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.';
            errorType = 'unsupported';
        }
        
        // 创建错误提示元素
        const errorElement = document.createElement('div');
        errorElement.className = `fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md z-50 max-w-md text-center ${errorType}-error`;
        errorElement.innerHTML = `${errorMessage}<br><small class="opacity-80">Error: ${error.name}</small>`;
        
        // 添加关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'ml-2 text-white font-bold';
        closeButton.textContent = '×';
        closeButton.onclick = () => {
            errorElement.remove();
        };
        errorElement.appendChild(closeButton);
        
        // 添加到页面
        document.body.appendChild(errorElement);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, 8000);
        
        // 添加到状态日志
        this.addToStatusLog(`Camera ${errorType.charAt(0).toUpperCase() + errorType.slice(1)} Error: ${error.message}`);
    }
    
    // 处理监控数据更新
    private onMonitoringData(data: {
        pose: HeadPose;
        rawDirection: Direction;
        stabilizedDirection: Direction;
        thresholds: { pitch: number; yaw: number };
    }): void {
        // 更新头部姿态数据
        this.posePitchElement.textContent = `${data.pose.pitch.toFixed(2)}°`;
        this.poseYawElement.textContent = `${data.pose.yaw.toFixed(2)}°`;
        this.poseRollElement.textContent = `${data.pose.roll.toFixed(2)}°`;
        
        // 更新方向识别数据
        this.directionRawElement.textContent = data.rawDirection;
        this.directionStabilizedElement.textContent = data.stabilizedDirection;
        this.directionThresholdElement.textContent = `p:${data.thresholds.pitch.toFixed(1)}, y:${data.thresholds.yaw.toFixed(1)}`;
    }
    
    // 添加状态日志
    private addToStatusLog(message: string): void {
        const logEntry = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        // 添加到日志顶部
        this.statusLogElement.prepend(logEntry);
        
        // 限制日志行数
        if (this.statusLogElement.children.length > 10) {
            this.statusLogElement.removeChild(this.statusLogElement.lastChild!);
        }
    }

    // 绑定事件监听器
    private bindEventListeners(): void {
        console.log('Binding all event listeners...');
        
        // 灵敏度滑块事件 - 仅当元素存在时绑定
        if (this.sensitivitySlider) {
            this.sensitivitySlider.addEventListener('input', (e) => {
                const sensitivity = parseInt((e.target as HTMLInputElement).value);
                console.log('Sensitivity changed to:', sensitivity);
                this.headTracker.setSensitivity(sensitivity);
            });
        }
        
        // 暂停/继续按钮事件
        this.pauseButton.addEventListener('click', () => {
            console.log('Pause button clicked');
            this.togglePause();
        });
        
        // 重新开始按钮事件
        this.restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            this.restartGame();
        });
        
        // 再玩一次按钮事件
        this.playAgainButton.addEventListener('click', () => {
            console.log('Play again button clicked');
            this.hideGameOverModal();
            this.restartGame();
        });
        
        // 悔棋按钮事件
        this.undoButton.addEventListener('click', () => {
            console.log('Undo button clicked');
            this.handleUndo();
        });
        
        // 键盘控制事件
        console.log('Adding keydown event listener to document');
        document.addEventListener('keydown', (e) => {
            console.log('Keydown event received:', e.key, 'Key code:', e.keyCode);
            this.handleKeyboardInput(e);
        });
        
        console.log('All event listeners bound successfully');
    }

    // 处理键盘输入
    private handleKeyboardInput(e: KeyboardEvent): void {
        // 记录键盘事件
        this.addToStatusLog(`Keyboard input: ${e.key}`);
        
        let direction: Direction = 'none';
        
        switch (e.key) {
            // 常规方向键
            case 'ArrowUp':
            // WASD
            case 'w':
            case 'W':
            // 数字键盘方向键
            case 'Numpad8':
                direction = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
            case 'Numpad2':
                direction = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
            case 'Numpad4':
                direction = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
            case 'Numpad6':
                direction = 'right';
                break;
            case 'p':
            case 'P':
                this.togglePause();
                return;
            case 'r':
            case 'R':
                this.restartGame();
                return;
            default:
                return;
        }
        
        // 记录游戏当前状态
        this.addToStatusLog(`Game state: ${this.game.getState()}`);
        
        e.preventDefault();
        this.game.move(direction);
        this.updateDirectionIndicators(direction);
    }

    // 处理方向变化
    private onDirectionChange(direction: Direction): void {
        // 总是更新方向指示器，确保UI实时反映当前方向
        this.updateDirectionIndicators(direction);
        
        // 应用正视回复机制：必须先恢复到正视状态，才能触发新的方向变化
        if (!this.directionCooldown) {
            // 如果从非移动状态变为移动状态，触发游戏移动
            if (this.lastDirection === 'none' && direction !== 'none') {
                this.game.move(direction);
                this.startDirectionCooldown();
                this.lastDirection = direction;
            } 
            // 如果当前是正视状态，更新lastDirection为none，允许下次触发
            else if (direction === 'none') {
                this.lastDirection = 'none';
            }
        }
    }

    // 开始方向冷却
    private startDirectionCooldown(): void {
        this.directionCooldown = true;
        setTimeout(() => {
            this.directionCooldown = false;
        }, this.cooldownDuration);
    }

    // 更新方向指示器
    private updateDirectionIndicators(direction: Direction): void {
        // 重置所有指示器
        Object.values(this.directionIndicators).forEach(indicator => {
            indicator.classList.remove('direction-active');
            indicator.classList.add('direction-inactive');
        });
        
        // 更新当前方向指示器
        if (direction !== 'none') {
            this.directionIndicators[direction].classList.remove('direction-inactive');
            this.directionIndicators[direction].classList.add('direction-active');
        }
        
        // 更新当前方向文本
        this.currentDirectionElement.textContent = direction.charAt(0).toUpperCase() + direction.slice(1);
    }

    // 处理头部姿态更新
    private onPoseUpdate(_pose: HeadPose): void {
        // 可以在这里添加额外的姿态处理逻辑
    }

    // 处理分数变化
    private onScoreChange(score: number): void {
        this.scoreElement.textContent = score.toString();
        
        // 更新重启按钮文本
        this.updateRestartButtonText();
    }

    // 处理游戏状态变化
    private onStateChange(state: GameState): void {
        switch (state) {
            case 'playing':
                this.pauseButton.textContent = 'Pause';
                break;
            case 'paused':
                this.pauseButton.textContent = 'Resume';
                break;
            case 'gameOver':
                this.showGameOverModal('Game Over', 'You reached', this.game.getScore());
                break;
            case 'won':
                this.showGameOverModal('Congratulations!', 'You won with', this.game.getScore());
                break;
        }
        
        // 更新重启按钮文本
        this.updateRestartButtonText();
    }
    
    // 更新重启按钮文本
    private updateRestartButtonText(): void {
        // 初始状态下显示"Start"，游戏开始后显示"Restart"
        const gameStarted = this.game.getScore() > 0 || this.game.getState() === 'playing';
        this.restartButton.textContent = gameStarted ? 'Restart' : 'Start';
    }

    // 处理游戏板变化
    private onBoardChange(board: (number | null)[][]): void {
        this.updateGameBoard(board);
        this.updateUndoState();
    }

    // 更新游戏板UI
    private updateGameBoard(board: (number | null)[][]): void {
        // 清空游戏容器
        this.gameContainer.innerHTML = '';
        
        // 遍历游戏板，创建格子
        board.forEach((row) => {
            row.forEach((cell) => {
                const cellElement = document.createElement('div');
                cellElement.classList.add('game-cell');
                cellElement.classList.add('bg-dark-surface');
                
                if (cell !== null) {
                    cellElement.classList.add(`game-cell-${cell}`);
                    cellElement.textContent = cell.toString();
                }
                
                this.gameContainer.appendChild(cellElement);
            });
        });
    }

    // 切换暂停状态
    private togglePause(): void {
        const currentState = this.game.getState();
        if (currentState === 'playing') {
            this.game.pause();
        } else if (currentState === 'paused') {
            this.game.resume();
        }
    }

    // 重新开始游戏
    private restartGame(): void {
        // 根据当前游戏状态决定是开始新游戏还是重新开始
        if (this.game.getState() === 'paused' && this.game.getScore() === 0) {
            // 游戏未开始，初始化游戏
            console.log('Starting new game...');
            this.game.init();
            this.game.resume();
            this.addToStatusLog('Game started');
        } else {
            // 游戏已开始，重新开始
            console.log('Restarting game...');
            this.game.restart();
            this.addToStatusLog('Game restarted');
        }
        
        this.lastDirection = 'none';
        this.updateDirectionIndicators('none');
        this.updateUndoState();
    }
    
    // 处理悔棋
    private handleUndo(): void {
        const success = this.game.undo();
        if (success) {
            this.addToStatusLog('Undo performed');
        } else {
            this.addToStatusLog('No more history to undo');
        }
        this.updateUndoState();
    }
    
    // 更新悔棋状态
    private updateUndoState(): void {
        const canUndo = this.game.canUndo();
        const historySize = this.game.getHistorySize();
        const maxHistorySize = this.game.getMaxHistorySize();
        
        // 更新按钮状态
        this.undoButton.disabled = !canUndo;
        if (canUndo) {
            this.undoButton.classList.remove('opacity-50', 'cursor-not-allowed');
            this.undoButton.classList.add('hover:bg-opacity-80');
        } else {
            this.undoButton.classList.add('opacity-50', 'cursor-not-allowed');
            this.undoButton.classList.remove('hover:bg-opacity-80');
        }
        
        // 更新状态信息
        this.undoInfoElement.textContent = `Undo: ${historySize}/${maxHistorySize}`;
    }

    // 显示游戏结束模态框
    private showGameOverModal(title: string, message: string, score: number): void {
        this.gameOverTitle.textContent = title;
        this.finalScoreElement.textContent = score.toString();
        this.gameOverMessage.innerHTML = `${message} <span id="final-score" class="font-bold text-dark-primary">${score}</span> points!`;
        this.gameOverModal.classList.remove('hidden');
    }

    // 隐藏游戏结束模态框
    private hideGameOverModal(): void {
        this.gameOverModal.classList.add('hidden');
    }
    
    // 清理资源
    public cleanup(): void {
        // 停止后处理效果
        this.postprocessing.destroy();
        
        // 停止头部追踪
        this.headTracker.destroy();
    }
}

// 初始化应用
let app: App | null = null;
window.addEventListener('DOMContentLoaded', () => {
    app = new App();
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (app) {
        app['cleanup']();
    }
});
