/**
 * Space Horde Survivor - Clase Explosion
 * Efectos de explosión gestionados por Object Pooling
 */

class Explosion {
    constructor() {
        // Propiedades básicas
        this.active = false;
        this.position = { x: 0, y: 0 };
        this.timer = 0;
        this.maxDuration = 0.8; // Duración total en segundos
        
        // Propiedades visuales
        this.particles = [];
        this.maxParticles = CONFIG.EXPLOSION_EFFECTS.PARTICLES.MAX_COUNT;
        this.baseSize = 20;
        this.currentSize = 0;
        this.color = '#FF6600';
        this.secondaryColor = '#FFAA00';
        
        // Estados de animación
        this.phase = 'expanding'; // 'expanding', 'peak', 'fading'
        this.expandDuration = 0.2;
        this.peakDuration = 0.1;
        this.fadeDuration = 0.5;
        
        console.log("💥 Explosión creada para pool");
    }
    
    /**
     * Activa la explosión en una posición específica
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} size - Tamaño base de la explosión (opcional)
     */
    activate(x, y, size = 20) {
        this.position.x = x;
        this.position.y = y;
        this.active = true;
        this.timer = 0;
        this.baseSize = size;
        this.currentSize = 0;
        this.phase = 'expanding';
        
        // Generar partículas
        this.generateParticles();
        
        console.log(`💥 Explosión activada en (${x.toFixed(1)}, ${y.toFixed(1)})`);
    }
    
    /**
     * Desactiva la explosión
     */
    deactivate() {
        this.active = false;
        this.timer = 0;
        this.currentSize = 0;
        this.particles = [];
        
        // Mover fuera de pantalla
        this.position.x = -1000;
        this.position.y = -1000;
    }
    
    /**
     * Método de limpieza para Object Pool
     */
    cleanup() {
        this.deactivate();
    }
    
    /**
     * Genera las partículas de la explosión
     */
    generateParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.maxParticles; i++) {
            const angle = (Math.PI * 2 * i) / this.maxParticles + (Math.random() - 0.5) * 0.5;
            const speed = CONFIG.EXPLOSION_EFFECTS.PARTICLES.MIN_SPEED + Math.random() * CONFIG.EXPLOSION_EFFECTS.PARTICLES.SPEED_RANGE;
            const size = CONFIG.EXPLOSION_EFFECTS.PARTICLES.MIN_SIZE + Math.random() * CONFIG.EXPLOSION_EFFECTS.PARTICLES.SIZE_RANGE;
            const life = CONFIG.EXPLOSION_EFFECTS.PARTICLES.MIN_LIFETIME + Math.random() * CONFIG.EXPLOSION_EFFECTS.PARTICLES.LIFETIME_RANGE;
            
            this.particles.push({
                x: this.position.x,
                y: this.position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                life: life,
                maxLife: life,
                color: Math.random() > 0.5 ? this.color : this.secondaryColor,
                alpha: 1
            });
        }
    }
    
    /**
     * Actualiza la explosión
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        if (!this.active) return;
        
        this.timer += deltaTime;
        
        // Determinar fase actual
        if (this.timer < this.expandDuration) {
            this.phase = 'expanding';
        } else if (this.timer < this.expandDuration + this.peakDuration) {
            this.phase = 'peak';
        } else {
            this.phase = 'fading';
        }
        
        // Actualizar tamaño según fase
        this.updateSize();
        
        // Actualizar partículas
        this.updateParticles(deltaTime);
        
        // Desactivar si se acabó el tiempo
        if (this.timer >= this.maxDuration) {
            this.deactivate();
        }
    }
    
    /**
     * Actualiza el tamaño de la explosión según la fase
     */
    updateSize() {
        const progress = this.timer / this.maxDuration;
        
        switch (this.phase) {
            case 'expanding':
                const expandProgress = this.timer / this.expandDuration;
                this.currentSize = this.baseSize * this.easeOut(expandProgress);
                break;
                
            case 'peak':
                this.currentSize = this.baseSize;
                break;
                
            case 'fading':
                const fadeStart = this.expandDuration + this.peakDuration;
                const fadeProgress = (this.timer - fadeStart) / this.fadeDuration;
                this.currentSize = this.baseSize * (1 - this.easeIn(fadeProgress));
                break;
        }
    }
    
    /**
     * Actualiza las partículas de la explosión
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateParticles(deltaTime) {
        for (const particle of this.particles) {
            // Actualizar posición
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            
            // Aplicar fricción
            particle.vx *= CONFIG.EXPLOSION_EFFECTS.PARTICLES.FRICTION;
            particle.vy *= CONFIG.EXPLOSION_EFFECTS.PARTICLES.FRICTION;
            
            // Actualizar vida
            particle.life -= deltaTime;
            
            // Actualizar alpha y tamaño basado en vida restante
            const lifeRatio = particle.life / particle.maxLife;
            particle.alpha = Math.max(0, lifeRatio);
            particle.size = particle.maxSize * lifeRatio;
        }
        
        // Filtrar partículas muertas
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    /**
     * Función de easing para suavizar animaciones
     * @param {number} t - Tiempo normalizado (0-1)
     * @returns {number} - Valor con easing aplicado
     */
    easeOut(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Función de easing para suavizar animaciones
     * @param {number} t - Tiempo normalizado (0-1)
     * @returns {number} - Valor con easing aplicado
     */
    easeIn(t) {
        return t * t * t;
    }
    
    /**
     * Renderiza la explosión
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Renderizar partículas primero
        this.renderParticles(ctx);
        
        // Renderizar núcleo de explosión
        this.renderCore(ctx);
        
        // Renderizar onda de choque
        this.renderShockwave(ctx);
        
        ctx.restore();
    }
    
    /**
     * Renderiza las partículas de la explosión
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderParticles(ctx) {
        for (const particle of this.particles) {
            if (particle.alpha <= 0) continue;
            
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Halo brillante
            ctx.globalAlpha = particle.alpha * 0.3;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    /**
     * Renderiza el núcleo central de la explosión
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderCore(ctx) {
        if (this.currentSize <= 0) return;
        
        const progress = this.timer / this.maxDuration;
        const alpha = this.phase === 'fading' ? (1 - progress) : 1;
        
        // Núcleo brillante
        ctx.globalAlpha = alpha;
        
        // Gradiente radial
        const gradient = ctx.createRadialGradient(
            this.position.x, this.position.y, 0,
            this.position.x, this.position.y, this.currentSize
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 170, 0, ${alpha * 0.8})`);
        gradient.addColorStop(0.7, `rgba(255, 102, 0, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Renderiza la onda de choque
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderShockwave(ctx) {
        if (this.phase !== 'expanding' && this.phase !== 'peak') return;
        
        const progress = Math.min(this.timer / (this.expandDuration + this.peakDuration), 1);
        const shockwaveRadius = this.currentSize * 1.5 * progress;
        const alpha = 1 - progress;
        
        ctx.globalAlpha = alpha * 0.6;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, shockwaveRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Onda interior
        ctx.globalAlpha = alpha * 0.3;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, shockwaveRadius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Verifica si la explosión está activa
     * @returns {boolean} - true si está activa
     */
    isActive() {
        return this.active;
    }
    
    /**
     * Obtiene el progreso de la explosión (0-1)
     * @returns {number} - Progreso normalizado
     */
    getProgress() {
        return this.timer / this.maxDuration;
    }
    
    /**
     * Obtiene información de debug de la explosión
     * @returns {Object} - Información de debug
     */
    getDebugInfo() {
        return {
            active: this.active,
            position: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            timer: this.timer.toFixed(2),
            phase: this.phase,
            size: this.currentSize.toFixed(1),
            particles: this.particles.length,
            progress: (this.getProgress() * 100).toFixed(1) + '%'
        };
    }
}

console.log("✅ Explosion.js cargado correctamente"); 