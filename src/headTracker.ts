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
        this.frameCallback = null;
    }

    // 初始化 MediaPipe Head Pose
    public async init(): Promise<void> {
        try {
            console.log('Starting head tracker initialization...');
            
            // 动态加载 MediaPipe 模块
            console.log('Loading MediaPipe tasks-vision module...');
            const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
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
            
            // 获取摄像头权限并启动视频流
            console.log('Starting camera...');
            await this.startCamera();
            console.log('Camera started successfully');
            
            // 开始处理视频帧
            console.log('Starting video processing...');
            this.startProcessing();
            console.log('Video processing started successfully');
            
            console.log('Head tracker initialized successfully');
        } catch (error) {
            console.error('Error initializing head tracker:', error);
            console.error('Error stack:', (error as Error).stack);
            throw error;
        }
    }

    // 启动摄像头
    private async startCamera(): Promise<void> {
        try {
            console.log('Checking navigator.mediaDevices...');
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }
            
            console.log('Requesting camera permissions...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
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
            throw error;
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
            return;
        }
        
        const landmarks = results.landmarks[0];
        
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

    // 识别头部方向
    private recognizeDirection(pose: HeadPose): Direction {
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
        
        // 绘制关键点
        this.ctx.fillStyle = '#ff0000';
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        landmarks.forEach(landmark => {
            const x = landmark.x * this.canvasElement.width;
            const y = landmark.y * this.canvasElement.height;
            
            if (this.ctx) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, Math.PI * 2);
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
            
            // 根据俯仰角和偏航角绘制方向线
            const directionX = centerX + (pose.yaw * 5);
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
