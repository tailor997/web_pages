import * as THREE from 'three';
import { EffectComposer } from 'postprocessing';
import { RenderPass } from 'postprocessing';
import { EffectPass } from 'postprocessing';
import { ScanlineEffect } from 'postprocessing';
import { GlitchEffect } from 'postprocessing';
import { BloomEffect, BloomEffectOptions } from 'postprocessing';

// 后处理效果类
export class PostprocessingEffects {
    private canvas: HTMLCanvasElement;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private composer: EffectComposer;
    private isRunning: boolean;
    private animationId: number | null;

    constructor(canvasElement: HTMLCanvasElement) {
        this.canvas = canvasElement;
        this.isRunning = false;
        this.animationId = null;
        
        // 初始化 Three.js 场景
        this.scene = new THREE.Scene();
        // 不设置背景颜色，使用透明背景
        this.scene.background = null;
        
        // 初始化相机（正交相机，用于全屏效果）
        this.camera = new THREE.OrthographicCamera(
            -1, 1, 1, -1, 0, 1
        );
        
        // 初始化渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // 初始化后处理合成器
        this.composer = new EffectComposer(this.renderer);
        
        // 添加渲染通道
        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // 创建效果通道
        const effects = [];
        
        // 添加扫描线效果
        effects.push(new ScanlineEffect({
            density: 1.2
        }));
        
        // 添加辉光效果
        const bloomOptions: BloomEffectOptions = {
            intensity: 0.3,
            radius: 0.5,
            luminanceThreshold: 0.8,
            luminanceSmoothing: 0.2
        };
        effects.push(new BloomEffect(bloomOptions));
        
        // 添加轻微的故障效果
        effects.push(new GlitchEffect({
            // 使用默认值，简化配置
        }));
        
        // 创建并添加效果通道
        const effectPass = new EffectPass(this.camera, ...effects);
        this.composer.addPass(effectPass);
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    // 启动效果渲染
    public start(): void {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    // 停止效果渲染
    public stop(): void {
        if (this.isRunning) {
            this.isRunning = false;
            if (this.animationId !== null) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
    }

    // 动画循环
    private animate(): void {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(this.animate.bind(this));
        
        // 更新效果参数（可以根据游戏状态动态调整）
        this.updateEffects();
        
        // 渲染效果
        this.composer.render();
    }

    // 更新效果参数
    private updateEffects(): void {
        // 可以根据游戏状态或时间动态调整效果参数
        // 例如：游戏分数越高，辉光效果越强
    }

    // 窗口大小变化处理
    private onWindowResize(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    // 设置辉光强度（当前版本暂不支持动态调整）
    public setBloomIntensity(_intensity: number): void {
        // 动态调整效果参数需要获取 EffectPass 中的效果实例
        // 简化版本，暂不实现
    }

    // 设置扫描线密度（当前版本暂不支持动态调整）
    public setScanlineDensity(_density: number): void {
        // 动态调整效果参数需要获取 EffectPass 中的效果实例
        // 简化版本，暂不实现
    }

    // 销毁资源
    public destroy(): void {
        this.stop();
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        this.renderer.dispose();
        this.composer.dispose();
    }
}
