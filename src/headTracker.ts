import { Direction } from './game';

// 定义头部姿态类型
export interface HeadPose {
    pitch: number; // 俯仰角：抬头为负，低头为正
    yaw: number;   // 偏航角：向左转头为负，向右转头为正
    roll: number;  // 翻滚角：头部左右倾斜
}

// 头部追踪类
export class HeadTracker {
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private onDirectionChange: (direction: Direction) => void;
    private onPoseUpdate: (pose: HeadPose) => void;
    private onMonitoringData: (data: {
        pose: HeadPose;
        rawDirection: Direction;
        stabilizedDirection: Direction;
        thresholds: { pitch: number; yaw: number };
    }) => void;
    private isRunning: boolean;
    private sensitivity: number;
    private directionHistory: Direction[];
    private historySize: number;
    private lastDirection: Direction;
    private lastLandmarks: any[] | null;
    private detector: any;
    private frameCallback: number | null;

    constructor(
        videoElement: HTMLVideoElement,
        canvasElement: HTMLCanvasElement,
        onDirectionChange: (direction: Direction) => void,
        onPoseUpdate: (pose: HeadPose) => void,
        sensitivity: number = 5,
        onMonitoringData: (data: {
            pose: HeadPose;
            rawDirection: Direction;
            stabilizedDirection: Direction;
            thresholds: { pitch: number; yaw: number };
        }) => void = () => {}
    ) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.onDirectionChange = onDirectionChange;
        this.onPoseUpdate = onPoseUpdate;
        this.onMonitoringData = onMonitoringData;
        this.isRunning = false;
        this.sensitivity = sensitivity;
        this.directionHistory = [];
        this.historySize = 5;
        this.lastDirection = 'none';
        this.lastLandmarks = null;
        this.frameCallback = null;
    }

    // 初始化 MediaPipe Head Pose
    public async init(): Promise<void> {
        try {
            console.log('Starting head tracker initialization...');
            
            // 第一步：先启动摄像头，确保摄像头流能够正常获取
            console.log('Starting camera...');
            await this.startCamera();
            console.log('Camera started successfully');
            
            // 第二步：尝试加载 MediaPipe 模块和初始化，即使失败也不影响摄像头显示
            try {
                // 动态加载 MediaPipe 模块
                console.log('Loading MediaPipe tasks-vision module...');
                const module = await import('@mediapipe/tasks-vision');
                const { FilesetResolver, PoseLandmarker } = module;
                console.log('MediaPipe module loaded successfully');
                
                // 配置模型路径
                console.log('Creating FilesetResolver...');
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
                );
                console.log('FilesetResolver created successfully');
                
                // 创建姿势检测器
                console.log('Creating PoseLandmarker...');
                this.detector = await PoseLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numPoses: 1
                });
                console.log('PoseLandmarker created successfully');
                
                // 开始处理视频帧
                console.log('Starting video processing...');
                this.startProcessing();
                console.log('Video processing started successfully');
                
                console.log('Head tracker initialized successfully');
            } catch (mediapipeError) {
                console.error('MediaPipe initialization failed, camera will still work:', mediapipeError);
                // 即使 MediaPipe 初始化失败，摄像头仍然可以工作
                console.log('Camera initialized successfully, but MediaPipe features are unavailable');
            }
        } catch (cameraError) {
            console.error('Error initializing camera:', cameraError);
            console.error('Error stack:', (cameraError as Error).stack);
            throw cameraError;
        }
    }

    // 启动摄像头
    private async startCamera(): Promise<void> {
        try {
            console.log('Checking browser compatibility...');
            
            // 更可靠的getUserMedia支持检测，使用TypeScript安全的方式
            let getUserMediaSupported = false;
            
            // 使用typeof检查，避免TypeScript编译错误
            if (typeof navigator !== 'undefined') {
                // 检查不同浏览器的getUserMedia支持方式
                if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
                    getUserMediaSupported = true;
                    console.log('getUserMedia supported via navigator.mediaDevices');
                } else if (typeof (navigator as any).webkitGetUserMedia === 'function') {
                    getUserMediaSupported = true;
                    console.log('getUserMedia supported via webkitGetUserMedia');
                } else if (typeof (navigator as any).mozGetUserMedia === 'function') {
                    getUserMediaSupported = true;
                    console.log('getUserMedia supported via mozGetUserMedia');
                } else if (typeof (navigator as any).msGetUserMedia === 'function') {
                    getUserMediaSupported = true;
                    console.log('getUserMedia supported via msGetUserMedia');
                }
            }
            
            if (!getUserMediaSupported) {
                // 检查是否是CSP导致的问题
                const cspHeaders = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
                if (cspHeaders.length > 0) {
                    console.warn('Content Security Policy detected:', Array.from(cspHeaders).map(meta => meta.getAttribute('content')));
                    throw new Error('Camera access blocked by Content Security Policy. Please check your CSP settings.');
                }
                throw new Error('getUserMedia is not supported in this browser');
            }
            
            // 检查是否在安全上下文（HTTPS或本地地址）中运行
            // 允许的本地地址：localhost、127.0.0.1以及本地网络IP（192.168.x.x、10.x.x.x等）
            const isLocalIP = /^(192\.168|10|172\.(1[6-9]|2\d|3[01]))\./.test(window.location.hostname);
            
            if (window.location.protocol !== 'https:' && 
                window.location.hostname !== 'localhost' && 
                window.location.hostname !== '127.0.0.1' && 
                !isLocalIP) {
                throw new Error('Camera access requires HTTPS connection. Please use HTTPS protocol for camera access.');
            }
            
            console.log('Requesting camera permissions...');
            
            let stream: MediaStream;
            // 使用不同的方式获取媒体流，提高兼容性
            try {
                // 现代浏览器方式
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user'
                    }
                });
            } catch (modernError) {
                console.warn('Modern getUserMedia failed, trying legacy methods:', modernError);
                // 尝试使用更简单的constraints
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
            
            console.log('Camera permissions granted successfully');
            
            console.log('Setting video element srcObject...');
            this.videoElement.srcObject = stream;
            
            console.log('Waiting for video to load...');
            await new Promise<void>((resolve) => {
                if (this.videoElement.readyState >= 2) {
                    resolve(); // Video already loaded
                } else {
                    this.videoElement.onloadedmetadata = () => resolve();
                }
            });
            console.log('Video metadata loaded');
            
            // Try to play video, handle autoplay restrictions
            console.log('Attempting to play video...');
            try {
                await this.videoElement.play();
                console.log('Video playing successfully');
            } catch (playError) {
                console.warn('Autoplay failed, adding user interaction fallback:', playError);
                // Add a click event listener to play video on user interaction
                const playOnInteraction = () => {
                    this.videoElement.play().then(() => {
                        console.log('Video played on user interaction');
                        // Remove event listeners after successful play
                        document.removeEventListener('click', playOnInteraction);
                        document.removeEventListener('touchstart', playOnInteraction);
                    }).catch(error => {
                        console.error('Failed to play video on interaction:', error);
                    });
                };
                document.addEventListener('click', playOnInteraction);
                document.addEventListener('touchstart', playOnInteraction);
            }
            
            console.log('Setting canvas size:', this.videoElement.videoWidth, 'x', this.videoElement.videoHeight);
            // 设置画布大小与视频一致
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            
            this.isRunning = true;
            console.log('Camera started successfully');
        } catch (error) {
            console.error('Error accessing camera:', error);
            console.error('Error stack:', (error as Error).stack);
            
            // 记录调试信息
            console.log('Navigator object available:', !!navigator);
            console.log('navigator.mediaDevices available:', !!navigator.mediaDevices);
            if (navigator.mediaDevices) {
                console.log('navigator.mediaDevices.getUserMedia available:', typeof navigator.mediaDevices.getUserMedia);
            }
            
            // 增强错误信息，提供更详细的指导
            let errorMessage = (error as Error).message;
            
            if (errorMessage.includes('HTTPS')) {
                errorMessage += ' Please ensure your server is using HTTPS protocol.';
            } else if (errorMessage.includes('Permission denied')) {
                errorMessage += ' Please grant camera permissions in your browser settings.';
            } else if (errorMessage.includes('NotReadableError')) {
                errorMessage += ' Please close other applications using the camera and try again.';
            } else if (errorMessage.includes('NotFoundError')) {
                errorMessage += ' Please connect a camera device and try again.';
            } else if (errorMessage.includes('Content Security Policy')) {
                errorMessage += ' Your site\'s Content Security Policy may be blocking camera access. Please check your CSP headers.';
            } else if (errorMessage.includes('getUserMedia is not supported')) {
                errorMessage += ' Please use a modern browser like Chrome, Firefox, or Safari.';
            }
            
            throw new Error(errorMessage);
        }
    }

    // 开始处理视频帧
    private startProcessing(): void {
        console.log('startProcessing called...');
        
        if (!this.detector) {
            console.error('Cannot start processing: detector is null');
            return;
        }
        
        if (!this.videoElement.srcObject) {
            console.error('Cannot start processing: videoElement.srcObject is null');
            return;
        }
        
        console.log('Starting video processing loop...');
        
        const processFrame = async () => {
            if (!this.isRunning) {
                console.log('Stopping processing: isRunning is false');
                return;
            }
            
            try {
                console.log('Processing frame...');
                const results = await this.detector.detectForVideo(this.videoElement, performance.now());
                console.log('Frame processed, results:', results);
                this.processResults(results);
            } catch (error) {
                console.error('Error processing frame:', error);
                console.error('Error stack:', (error as Error).stack);
            }
            
            this.frameCallback = requestAnimationFrame(processFrame);
        };
        
        processFrame();
    }

    // 处理检测结果
    private processResults(results: any): void {
        // 计算阈值
        const pitchThreshold = 15 - (this.sensitivity - 1) * 1.5;
        const yawThreshold = 12 - (this.sensitivity - 1) * 1.2;
        
        if (!results.landmarks || results.landmarks.length === 0) {
            // 如果没有检测到地标，发送默认数据
            const defaultPose: HeadPose = { pitch: 0, yaw: 0, roll: 0 };
            this.onMonitoringData({
                pose: defaultPose,
                rawDirection: 'none',
                stabilizedDirection: 'none',
                thresholds: { pitch: pitchThreshold, yaw: yawThreshold }
            });
            this.lastLandmarks = null;
            return;
        }
        
        const landmarks = results.landmarks[0];
        
        // 更新最后检测到的地标点，用于姿态识别
        this.lastLandmarks = landmarks;
        
        // 计算头部姿态（简化版本，使用关键特征点）
        const pose = this.calculateHeadPose(landmarks);
        
        // 绘制检测结果
        this.drawResults(landmarks, pose);
        
        // 识别头部方向
        const direction = this.recognizeDirection(pose);
        
        // 应用方向历史和防抖
        this.updateDirectionHistory(direction);
        const stabilizedDirection = this.getStabilizedDirection();
        
        // 发送监控数据
        this.onMonitoringData({
            pose,
            rawDirection: direction,
            stabilizedDirection,
            thresholds: { pitch: pitchThreshold, yaw: yawThreshold }
        });
        
        // 通知方向变化
        if (stabilizedDirection !== this.lastDirection) {
            this.lastDirection = stabilizedDirection;
            this.onDirectionChange(stabilizedDirection);
        }
        
        // 通知姿态更新
        this.onPoseUpdate(pose);
    }

    // 计算头部姿态
    private calculateHeadPose(landmarks: any[]): HeadPose {
        // 获取关键特征点：鼻子、左眼、右眼、左耳、右耳
        const nose = landmarks[0];
        const leftEye = landmarks[2];
        const rightEye = landmarks[5];
        const leftEar = landmarks[7];
        const rightEar = landmarks[8];
        
        // 计算头部中心点
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;
        
        // 计算俯仰角（pitch）：基于鼻子与眼睛中心的垂直距离
        const pitch = (nose.y - centerY) * 100;
        
        // 计算偏航角（yaw）：基于鼻子与头部中心的水平距离
        const yaw = (nose.x - centerX) * 100;
        
        // 计算翻滚角（roll）：基于左右耳朵的垂直位置差异
        const roll = (leftEar.y - rightEar.y) * 100;
        
        return {
            pitch,
            yaw,
            roll
        };
    }

    // 识别头部方向 - 注释掉旧实现
    /*private recognizeDirection(pose: HeadPose): Direction {
        const { pitch, yaw } = pose;
        
        // 根据灵敏度计算阈值
        const pitchThreshold = 15 - (this.sensitivity - 1) * 1.5;
        const yawThreshold = 12 - (this.sensitivity - 1) * 1.2;
        
        // 检测方向
        if (pitch < -pitchThreshold) {
            return 'up'; // 抬头
        } else if (pitch > pitchThreshold) {
            return 'down'; // 低头
        } else if (yaw < -yawThreshold) {
            return 'left'; // 向左转头
        } else if (yaw > yawThreshold) {
            return 'right'; // 向右转头
        } else {
            return 'none'; // 正视
        }
    }*/
    
    // 识别头部方向 - 新实现
    private recognizeDirection(_pose: HeadPose): Direction {
        // 获取关键特征点
        // 注意：landmarks数组索引对应关系来自MediaPipe Pose Landmarker
        // 0: 鼻子, 2: 左眼, 5: 右眼, 7: 左耳, 8: 右耳
        
        // 检查是否有足够的地标点
        if (!this.lastLandmarks || this.lastLandmarks.length < 9) {
            return 'none';
        }
        
        const nose = this.lastLandmarks[0];
        const leftEye = this.lastLandmarks[2];
        const rightEye = this.lastLandmarks[5];
        const leftEar = this.lastLandmarks[7];
        const rightEar = this.lastLandmarks[8];
        
        // 计算耳朵的平均Y坐标（用于比较高度）
        const earsAvgY = (leftEar.y + rightEar.y) / 2;
        // 计算耳朵的X坐标范围（用于比较水平位置）
        const earsMinX = Math.min(leftEar.x, rightEar.x);
        const earsMaxX = Math.max(leftEar.x, rightEar.x);
        const earsCenterX = (earsMinX + earsMaxX) / 2;
        // 定义横向中间区域（耳朵间距的60%）
        const centerRange = (earsMaxX - earsMinX) * 0.6;
        
        // 1. 抬头判定：鼻子关键点位置处于左右耳关键点位置的上方
        if (nose.y < earsAvgY) {
            return 'up';
        }
        
        // 2. 低头判定：左右眼关键点位置处于左右耳关键点位置的下方
        if (leftEye.y > earsAvgY && rightEye.y > earsAvgY) {
            return 'down';
        }
        
        // 3. 左转判定：鼻子关键点位置处于耳朵关键点位置的左侧
        if (nose.x < earsCenterX - centerRange / 2) {
            return 'right';
        }
        
        // 4. 右转判定：鼻子关键点位置处于耳朵关键点位置的右侧
        if (nose.x > earsCenterX + centerRange / 2) {
            return 'left';
        }
        
        // 5. 正视判定：
        //    - 眼睛关键点位置处于耳朵关键点位置的上方
        //    - 鼻子关键点位置处于耳朵关键点位置的下方
        //    - 眼睛和鼻子关键点均处于耳朵关键点的横向中间区域
        const eyesAboveEars = leftEye.y < earsAvgY && rightEye.y < earsAvgY;
        const noseBelowEars = nose.y > earsAvgY;
        const eyesInCenter = leftEye.x > earsCenterX - centerRange / 2 && 
                            leftEye.x < earsCenterX + centerRange / 2 && 
                            rightEye.x > earsCenterX - centerRange / 2 && 
                            rightEye.x < earsCenterX + centerRange / 2;
        const noseInCenter = nose.x > earsCenterX - centerRange / 2 && 
                            nose.x < earsCenterX + centerRange / 2;
        
        if (eyesAboveEars && noseBelowEars && eyesInCenter && noseInCenter) {
            return 'none';
        }
        
        // 默认返回正视
        return 'none';
    }

    // 更新方向历史
    private updateDirectionHistory(direction: Direction): void {
        this.directionHistory.push(direction);
        if (this.directionHistory.length > this.historySize) {
            this.directionHistory.shift();
        }
    }

    // 获取稳定的方向（基于历史记录）
    private getStabilizedDirection(): Direction {
        // 统计历史记录中出现次数最多的方向
        const directionCount: Record<Direction, number> = {
            up: 0,
            down: 0,
            left: 0,
            right: 0,
            none: 0
        };
        
        this.directionHistory.forEach(dir => {
            directionCount[dir]++;
        });
        
        // 找到出现次数最多的方向
        let maxCount = 0;
        let stabilizedDirection: Direction = 'none';
        
        Object.entries(directionCount).forEach(([dir, count]) => {
            if (count > maxCount) {
                maxCount = count;
                stabilizedDirection = dir as Direction;
            }
        });
        
        return stabilizedDirection;
    }

    // 绘制检测结果
    private drawResults(landmarks: any[], pose: HeadPose): void {
        if (!this.ctx) return;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        // 绘制关键点，根据不同部位使用不同颜色，并进行镜像翻转
        landmarks.forEach((landmark, index) => {
            // 进行左右方向镜像翻转
            const x = this.canvasElement.width - (landmark.x * this.canvasElement.width);
            const y = landmark.y * this.canvasElement.height;
            
            if (this.ctx) {
                // 设置不同关键点的颜色
                if (index === 0) {
                    // 鼻子 - 绿色
                    this.ctx.fillStyle = '#00ff00';
                } else if (index === 7 || index === 8) {
                    // 左右耳 - 橙色
                    this.ctx.fillStyle = '#ffa500';
                } else {
                    // 其他关键点 - 红色
                    this.ctx.fillStyle = '#ff0000';
                }
                
                this.ctx.beginPath();
                // 增大关键点大小，使其更清晰可见
                this.ctx.arc(x, y, 4, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // 绘制头部中心和方向线
        const centerX = this.canvasElement.width / 2;
        const centerY = this.canvasElement.height / 2;
        
        // 绘制头部方向指示器
        if (this.ctx) {
            this.ctx.strokeStyle = '#00ffff';
            this.ctx.lineWidth = 3;
            
            // 根据俯仰角和偏航角绘制方向线，注意yaw方向需要反转以匹配镜像翻转
            const directionX = centerX - (pose.yaw * 5);
            const directionY = centerY + (pose.pitch * 5);
            
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(directionX, directionY);
            this.ctx.stroke();
            
            // 绘制方向箭头
            this.ctx.beginPath();
            this.ctx.arc(directionX, directionY, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // 设置灵敏度
    public setSensitivity(sensitivity: number): void {
        this.sensitivity = Math.max(1, Math.min(10, sensitivity));
    }

    // 开始追踪
    public start(): void {
        if (!this.isRunning && this.detector) {
            this.isRunning = true;
            this.startProcessing();
        }
    }

    // 停止追踪
    public stop(): void {
        this.isRunning = false;
        if (this.frameCallback !== null) {
            cancelAnimationFrame(this.frameCallback);
            this.frameCallback = null;
        }
    }

    // 销毁资源
    public destroy(): void {
        this.stop();
        
        // 停止视频流
        if (this.videoElement.srcObject) {
            const stream = this.videoElement.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
        
        // 释放检测器资源
        if (this.detector) {
            this.detector.close();
            this.detector = null;
        }
    }

    // 获取当前运行状态
    public getIsRunning(): boolean {
        return this.isRunning;
    }
}
