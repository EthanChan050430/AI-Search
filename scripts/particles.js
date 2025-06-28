// =====================================
// 粒子效果脚本
// =====================================

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            particleCount: options.particleCount || 30,
            minSize: options.minSize || 2,
            maxSize: options.maxSize || 8,
            speed: options.speed || 1,
            opacity: options.opacity || 0.1,
            color: options.color || 'rgba(255, 255, 255, 0.1)',
            ...options
        };
        
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }

    createParticles() {
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const particle = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
            speedX: (Math.random() - 0.5) * this.options.speed,
            speedY: (Math.random() - 0.5) * this.options.speed,
            opacity: Math.random() * this.options.opacity,
            element: null
        };

        // 创建DOM元素
        particle.element = document.createElement('div');
        particle.element.className = 'particle-dot';
        particle.element.style.cssText = `
            position: absolute;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: ${this.options.color};
            border-radius: 50%;
            pointer-events: none;
            opacity: ${particle.opacity};
            transform: translate(${particle.x}px, ${particle.y}px);
        `;

        this.container.appendChild(particle.element);
        return particle;
    }

    animate() {
        this.particles.forEach(particle => {
            // 更新位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // 边界检查和重置
            if (particle.x < -particle.size) {
                particle.x = window.innerWidth + particle.size;
            } else if (particle.x > window.innerWidth + particle.size) {
                particle.x = -particle.size;
            }

            if (particle.y < -particle.size) {
                particle.y = window.innerHeight + particle.size;
            } else if (particle.y > window.innerHeight + particle.size) {
                particle.y = -particle.size;
            }

            // 更新DOM元素位置
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        // 鼠标交互效果
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const attractionRadius = 100;
        const attractionStrength = 0.02;

        this.particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < attractionRadius) {
                const force = (attractionRadius - distance) / attractionRadius;
                particle.speedX += dx * force * attractionStrength;
                particle.speedY += dy * force * attractionStrength;
                
                // 增加透明度
                particle.element.style.opacity = Math.min(particle.opacity * 3, 0.8);
            } else {
                // 恢复原始透明度
                particle.element.style.opacity = particle.opacity;
                
                // 逐渐恢复原始速度
                particle.speedX *= 0.98;
                particle.speedY *= 0.98;
            }
        });
    }

    handleResize() {
        // 重新调整粒子位置以适应新的窗口大小
        this.particles.forEach(particle => {
            if (particle.x > window.innerWidth) {
                particle.x = window.innerWidth;
            }
            if (particle.y > window.innerHeight) {
                particle.y = window.innerHeight;
            }
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        this.particles = [];
    }

    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        this.destroy();
        this.init();
    }
}

// 高级粒子系统 - 支持连线效果
class AdvancedParticleSystem extends ParticleSystem {
    constructor(container, options = {}) {
        super(container, {
            connectionDistance: 120,
            showConnections: true,
            connectionOpacity: 0.1,
            connectionColor: 'rgba(0, 159, 253, 0.2)',
            ...options
        });
        
        this.canvas = null;
        this.ctx = null;
        this.initCanvas();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新粒子
        super.animate();
        
        // 绘制连线
        if (this.options.showConnections) {
            this.drawConnections();
        }
    }

    drawConnections() {
        const { connectionDistance, connectionColor, connectionOpacity } = this.options;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particleA = this.particles[i];
                const particleB = this.particles[j];
                
                const dx = particleA.x - particleB.x;
                const dy = particleA.y - particleB.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * connectionOpacity;
                    
                    this.ctx.strokeStyle = connectionColor.replace(/[\d\.]+\)$/g, `${opacity})`);
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particleA.x, particleA.y);
                    this.ctx.lineTo(particleB.x, particleB.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    handleResize() {
        super.handleResize();
        this.resizeCanvas();
    }

    destroy() {
        super.destroy();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 星空粒子系统
class StarfieldParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            starCount: options.starCount || 100,
            speed: options.speed || 0.5,
            maxSpeed: options.maxSpeed || 2,
            starColor: options.starColor || '#ffffff',
            twinkle: options.twinkle !== false,
            ...options
        };
        
        this.stars = [];
        this.animationId = null;
        this.canvas = null;
        this.ctx = null;
        
        this.init();
    }

    init() {
        this.initCanvas();
        this.createStars();
        this.animate();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        for (let i = 0; i < this.options.starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * this.options.maxSpeed + 0.1,
                opacity: Math.random() * 0.8 + 0.2,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.stars.forEach(star => {
            // 更新位置
            star.y += star.speed * this.options.speed;
            
            // 重置星星位置
            if (star.y > this.canvas.height) {
                star.y = -star.size;
                star.x = Math.random() * this.canvas.width;
            }
            
            // 闪烁效果
            let opacity = star.opacity;
            if (this.options.twinkle) {
                star.twinklePhase += star.twinkleSpeed;
                opacity = star.opacity * (0.7 + 0.3 * Math.sin(star.twinklePhase));
            }
            
            // 绘制星星
            this.ctx.fillStyle = this.options.starColor;
            this.ctx.globalAlpha = opacity;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 自动初始化粒子系统
document.addEventListener('DOMContentLoaded', () => {
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        // 根据设备性能选择粒子系统
        const isMobile = window.innerWidth < 768;
        const isLowEnd = navigator.hardwareConcurrency < 4;
        
        let particleSystem;
        
        if (isMobile || isLowEnd) {
            // 移动端或低端设备使用简单粒子系统
            particleSystem = new ParticleSystem(particlesContainer, {
                particleCount: 15,
                speed: 0.3,
                opacity: 0.08
            });
        } else {
            // 桌面端使用高级粒子系统
            particleSystem = new AdvancedParticleSystem(particlesContainer, {
                particleCount: 25,
                speed: 0.5,
                showConnections: true,
                connectionDistance: 100
            });
        }
        
        // 添加性能监控
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime > 5000) { // 每5秒检查一次
                const fps = frameCount / 5;
                
                if (fps < 30) { // FPS低于30时降低粒子数量
                    particleSystem.updateOptions({
                        particleCount: Math.max(10, particleSystem.options.particleCount - 5),
                        showConnections: false
                    });
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(checkPerformance);
        };
        
        checkPerformance();
        
        // 存储到全局以便其他脚本访问
        window.particleSystem = particleSystem;
    }
});

// 导出类
window.ParticleSystem = ParticleSystem;
window.AdvancedParticleSystem = AdvancedParticleSystem;
window.StarfieldParticleSystem = StarfieldParticleSystem;
