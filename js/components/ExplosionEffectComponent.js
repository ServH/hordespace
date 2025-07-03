import Component from './Component.js';

export default class ExplosionEffectComponent extends Component {
    constructor(config = {}) {
        super();
        
        // Propiedades básicas de la explosión
        this.timer = 0;
        this.duration = config.duration || CONFIG.EXPLOSION_EFFECTS.DURATION;
        this.baseSize = config.size || 20;
        this.currentSize = 0;
        
        // Colores de la explosión
        this.primaryColor = config.primaryColor || CONFIG.EXPLOSION_EFFECTS.COLORS[0];
        this.secondaryColor = config.secondaryColor || CONFIG.EXPLOSION_EFFECTS.COLORS[1];
        
        // Estados de animación
        this.phase = 'expanding'; // 'expanding', 'peak', 'fading'
        this.expandDuration = 0.2;
        this.peakDuration = 0.1;
        this.fadeDuration = 0.5;
        
        // Partículas
        this.particles = [];
        this.maxParticles = CONFIG.EXPLOSION_EFFECTS.PARTICLES.MAX_COUNT;
        
        // Generar partículas iniciales
        this.generateParticles();
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
                x: 0, // Se actualizará con la posición de la entidad
                y: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size,
                maxSize: size,
                life: life,
                maxLife: life,
                color: Math.random() > 0.5 ? this.primaryColor : this.secondaryColor,
                alpha: 1
            });
        }
    }
    
    /**
     * Actualiza el tamaño de la explosión según la fase
     */
    updateSize() {
        const progress = this.timer / this.duration;
        
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
     * Obtiene el progreso de la animación (0-1)
     * @returns {number} - Progreso normalizado
     */
    getProgress() {
        return Math.min(1, this.timer / this.duration);
    }
    
    /**
     * Verifica si la explosión ha terminado
     * @returns {boolean} - True si la explosión ha terminado
     */
    isFinished() {
        return this.timer >= this.duration;
    }
} 