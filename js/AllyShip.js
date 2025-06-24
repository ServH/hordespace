/**
 * Space Horde Survivor - Clase Base AllyShip
 * Clase fundamental para todas las naves aliadas del juego
 * Hereda de Ship y proporciona funcionalidad básica de dibujo y debug
 */

class AllyShip extends Ship {
    /**
     * Constructor de la nave aliada base
     * @param {number} x - Posición inicial X
     * @param {number} y - Posición inicial Y 
     * @param {Game} gameInstance - Referencia al objeto Game principal
     */
    constructor(x, y, gameInstance) {
        // Llamar al constructor padre con valores de CONFIG
        super(
            x, y,
            CONFIG.ALLY_DEFAULT_RADIUS,
            CONFIG.ALLY_DEFAULT_HP,
            CONFIG.ALLY_DEFAULT_SPEED,
            CONFIG.ALLY_DEFAULT_ACCELERATION,
            CONFIG.ALLY_DEFAULT_FRICTION,
            CONFIG.ALLY_DEFAULT_ROTATION_SPEED
        );
        
        // === PROPIEDADES ESPECÍFICAS DE ALLY SHIP ===
        
        // Referencia al objeto Game para acceder a otros elementos
        this.game = gameInstance;
        
        // Tipo de nave (identificación para logs y subclases)
        this.type = 'defaultAlly';
        
        // Offset de formación relativo al comandante (usado en Fase 5.2)
        this.formationOffset = { x: 0, y: 0 };
        
        // Propiedades de formación (configuradas en Fase 5.2)
        this.followStrength = 0;
        this.maxCorrectionForce = 0;
        this.correctionThreshold = 0;
        
        // Timer para controlar frecuencia de logs de debug
        this.debugTimer = 0;
        
        // Propiedades de IA de combate (configuradas en Fase 5.3)
        this.aiTargetingRange = 0;
        this.fireRate = 0;
        this.fireCooldown = 0;
        this.damage = 0;
        this.projectilePool = null;
        
        // Color de la nave aliada
        this.color = CONFIG.ALLY_DEFAULT_COLOR;
        
        console.log(`🤖 AllyShip creada en (${x.toFixed(1)}, ${y.toFixed(1)}) - Tipo: ${this.type}`);
    }
    
    /**
     * Actualiza la nave aliada cada frame
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        // Llamar al update del padre para física básica
        super.update(deltaTime);
        
        // === LOG DE DEBUG CONDICIONAL ===
        this.debugTimer += deltaTime;
        
        // Solo mostrar debug si está habilitado y ha pasado el tiempo suficiente
        if (this.debugTimer >= 0.5 && CONFIG.DEBUG_FLEET_INFO) {
            const debugInfo = this.getDebugInfo();
            console.log(`🛸 ${this.type} Debug:`, debugInfo);
            this.debugTimer = 0; // Resetear timer
        }
    }
    
    /**
     * Renderiza la nave aliada en el canvas
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Trasladar al centro de la nave
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según el ángulo de la nave
        ctx.rotate(this.angle);
        
        // === DIBUJAR TRIÁNGULO BÁSICO ===
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);                    // Punta superior
        ctx.lineTo(-this.radius * 0.6, this.radius * 0.8);  // Base izquierda
        ctx.lineTo(this.radius * 0.6, this.radius * 0.8);   // Base derecha
        ctx.closePath();
        
        // Relleno de la nave
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Contorno de la nave
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
        
        // Renderizar barra de vida si está dañada
        if (this.hp < this.maxHp) {
            this.renderHealthBar(ctx);
        }
    }
    
    /**
     * Renderiza la barra de vida de la nave aliada
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 3;
        const barY = this.position.y - this.radius - 8;
        
        // Fondo de la barra
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.position.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthRatio = this.hp / this.maxHp;
        const healthColor = healthRatio > 0.6 ? '#00FF00' : healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(this.position.x - barWidth / 2, barY, barWidth * healthRatio, barHeight);
    }
    
    /**
     * Método llamado cuando la nave es destruida
     */
    onDestroy() {
        // Llamar al método del padre
        super.onDestroy();
        
        // Crear explosión en la posición de la nave
        if (this.game && this.game.explosionPool) {
            const explosion = this.game.explosionPool.get();
            if (explosion) {
                explosion.activate(this.position.x, this.position.y, this.radius * 1.5);
            }
        }
        
        console.log(`💥 AllyShip ${this.type} destruida en posición (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`);
    }
    
    /**
     * Establece el offset de formación (usado en Fase 5.2)
     * @param {Object} offset - Objeto con propiedades x e y
     */
    setFormationOffset(offset) {
        this.formationOffset = offset;
    }
    
    /**
     * Establece el pool de proyectiles (usado en Fase 5.3)
     * @param {ObjectPool} pool - Pool de proyectiles
     */
    setProjectilePool(pool) {
        this.projectilePool = pool;
    }
    
    /**
     * Obtiene información de debug de la nave aliada
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        const speed = this.getCurrentSpeed();
        const angleDegrees = (this.angle * 180 / Math.PI).toFixed(1);
        
        return {
            type: this.type,
            pos: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            vel: `(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
            speed: speed.toFixed(1),
            angle: `${angleDegrees}°`,
            hp: `${this.hp}/${this.maxHp}`,
            formationOffset: `(${this.formationOffset.x.toFixed(1)}, ${this.formationOffset.y.toFixed(1)})`,
            distanceToTarget: 'N/A', // Se calculará en Fase 5.2
            targetEnemy: 'N/A'       // Se implementará en Fase 5.3
        };
    }
} 