/**
 * Space Horde Survivor - Clase Projectile
 * Proyectiles gestionados por Object Pooling
 * ¡CRÍTICO! Ya no hereda de Ship
 */

class Projectile {
    constructor(gameInstance) {
        // ¡CRÍTICO! Constructor simplificado - solo espera gameInstance
        this.game = gameInstance;
        
        // Propiedades básicas de posición y movimiento
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.angle = 0;
        
        // Propiedades específicas del proyectil
        this.active = false;
        this.damage = 0;
        this.owner = '';
        this.lifeTime = 0;
        this.maxLifeTime = 5; // 5 segundos máximo de vida por defecto
        this.radius = 3;
        
        // Propiedades visuales (se establecerán desde projectileDef)
        this.color = '#FFFFFF';
        this.trailLength = 8;
        this.trailPositions = [];
        this.visualType = 'bullet';
        this.trailEffect = 'basic';
        this.lineWidth = 2;
        this.glowRadiusMultiplier = 1.0;
        this.innerCoreRadiusMultiplier = 0.5;
        this.maxSpeed = 400;
        
        console.log("🚀 Proyectil creado para pool");
    }
    
    /**
     * Activa el proyectil con parámetros específicos usando projectileDef
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {number} angle - Ángulo de disparo en radianes
     * @param {string} owner - Propietario ('player', 'ally', 'enemy')
     * @param {Object} projectileDef - Definición del proyectil desde CONFIG.PROJECTILE.PROJECTILE_TYPES
     */
    activate(x, y, angle, owner, projectileDef) {
        // Establecer posición inicial
        this.position.x = x;
        this.position.y = y;
        
        // Establecer propiedades básicas
        this.angle = angle;
        this.owner = owner;
        this.active = true;
        this.lifeTime = 0;
        
        // ¡CRÍTICO! Asegurar que TODAS las propiedades se asignan desde projectileDef ANTES del cálculo de velocity
        this.damage = projectileDef.DAMAGE;
        this.maxSpeed = projectileDef.SPEED;
        this.radius = projectileDef.RADIUS;
        this.color = projectileDef.COLOR;
        this.maxLifeTime = projectileDef.LIFETIME;
        this.visualType = projectileDef.VISUAL_TYPE;
        this.trailEffect = projectileDef.TRAIL_EFFECT;
        this.trailLength = projectileDef.TRAIL_LENGTH;
        this.lineWidth = projectileDef.LINE_WIDTH;
        this.glowRadiusMultiplier = projectileDef.GLOW_RADIUS_MULTIPLIER;
        this.innerCoreRadiusMultiplier = projectileDef.INNER_CORE_RADIUS_MULTIPLIER;
        
        // ¡CRÍTICO! Reiniciar trail positions
        this.trailPositions = [];
        
        // Calcular velocidad basada en ángulo (DESPUÉS de asignar maxSpeed)
        this.velocity.x = Math.sin(angle) * this.maxSpeed;
        this.velocity.y = -Math.cos(angle) * this.maxSpeed;
        
        console.log(`🚀 Proyectil ${this.visualType} activado: ${owner} en (${x.toFixed(1)}, ${y.toFixed(1)}) - Daño: ${this.damage}, Velocidad: ${this.maxSpeed}`);
    }
    
    /**
     * Desactiva el proyectil y lo prepara para reutilización
     */
    deactivate() {
        this.active = false;
        this.damage = 0;
        this.owner = '';
        this.lifeTime = 0;
        
        // Mover fuera de pantalla
        this.position.x = -1000;
        this.position.y = -1000;
        this.velocity.x = 0;
        this.velocity.y = 0;
        
        // Limpiar trail
        this.trailPositions = [];
    }
    
    /**
     * Método de limpieza para Object Pool
     */
    cleanup() {
        this.deactivate();
    }
    
    /**
     * Actualiza el proyectil
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Actualizar tiempo de vida
        this.lifeTime += deltaTime;
        
        // Desactivar si excede tiempo máximo de vida
        if (this.lifeTime > this.maxLifeTime) {
            this.deactivate();
            return;
        }
        
        // Actualizar trail positions
        this.updateTrail();
        
        // ¡CRÍTICO! Solo movimiento básico - sin fricción ni aceleración
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Verificar límites de pantalla
        this.checkBounds();
    }
    
    /**
     * Actualiza las posiciones del trail
     */
    updateTrail() {
        // Añadir posición actual al trail
        this.trailPositions.push({
            x: this.position.x,
            y: this.position.y,
            time: this.lifeTime
        });
        
        // Mantener solo las últimas posiciones
        if (this.trailPositions.length > this.trailLength) {
            this.trailPositions.shift();
        }
    }
    
    /**
     * Verifica si el proyectil está fuera de los límites y lo desactiva
     */
    checkBounds() {
        const margin = 50; // Margen fuera de pantalla
        
        if (this.position.x < -margin || 
            this.position.x > CONFIG.CANVAS.WIDTH + margin ||
            this.position.y < -margin || 
            this.position.y > CONFIG.CANVAS.HEIGHT + margin) {
            this.deactivate();
        }
    }
    
    /**
     * ¡CRÍTICO! Reimplementar colisión circular directamente (sin super.isColliding())
     * @param {Object} other - Otra entidad
     * @returns {boolean} - true si hay colisión
     */
    isColliding(other) {
        if (!this.active || !other.isAlive) return false;
        
        // No colisionar con entidades del mismo propietario
        if (this.owner === 'player' && other instanceof PlayerShip) return false;
        if (this.owner === 'ally' && other instanceof AllyShip) return false;
        if (this.owner === 'enemy' && other instanceof EnemyShip) return false;
        
        // Colisión circular directa
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = this.radius + other.radius;
        
        return distance < minDistance;
    }
    
    /**
     * Renderiza el proyectil
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Renderizar trail primero
        this.renderTrail(ctx);
        
        // Renderizar proyectil principal según visualType
        this.renderProjectile(ctx);
        
        ctx.restore();
    }
    
    /**
     * Renderiza el trail del proyectil
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderTrail(ctx) {
        if (this.trailPositions.length < 2) return;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        // Adaptar para usar this.trailLength y this.trailEffect
        const effectMultiplier = this.trailEffect === 'heavy' ? 1.5 : 
                                this.trailEffect === 'short' ? 0.7 : 1.0;
        
        ctx.beginPath();
        
        for (let i = 1; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const prevPos = this.trailPositions[i - 1];
            
            // Alpha basado en la antigüedad del punto del trail
            const age = this.lifeTime - pos.time;
            const alpha = Math.max(0, 1 - (age / (0.2 * effectMultiplier)));
            
            ctx.globalAlpha = alpha * 0.3;
            
            ctx.moveTo(prevPos.x, prevPos.y);
            ctx.lineTo(pos.x, pos.y);
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza el proyectil principal según visualType
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderProjectile(ctx) {
        // Trasladar al centro del proyectil
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según dirección de movimiento
        ctx.rotate(this.angle);
        
        // ¡CRÍTICO! Implementar switch (this.visualType)
        switch (this.visualType) {
            case 'laser':
                this.renderLaser(ctx);
                break;
            case 'orb':
                this.renderOrb(ctx);
                break;
            case 'bullet':
            default:
                this.renderBullet(ctx);
                break;
        }
    }
    
    /**
     * Renderiza proyectil tipo láser
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderLaser(ctx) {
        const size = this.radius;
        
        // Línea principal (láser)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, -size * 2);
        ctx.lineTo(0, size * 2);
        ctx.stroke();
        
        // Núcleo brillante
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size * this.innerCoreRadiusMultiplier, 0, Math.PI * 2);
        ctx.fill();
        
        // Halo exterior
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, size * this.glowRadiusMultiplier, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza proyectil tipo orbe
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderOrb(ctx) {
        const size = this.radius;
        
        // Orbe principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo interno más brillante
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(0, 0, size * this.innerCoreRadiusMultiplier, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Halo exterior brillante
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, size * this.glowRadiusMultiplier, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza proyectil tipo bala
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderBullet(ctx) {
        const size = this.radius;
        
        // Bala principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Contorno
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
    }
    
    /**
     * Obtiene información de debug del proyectil
     * @returns {Object} - Información de debug
     */
    getDebugInfo() {
        return {
            active: this.active,
            owner: this.owner,
            position: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            velocity: `(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
            damage: this.damage,
            lifeTime: this.lifeTime.toFixed(2),
            angle: (this.angle * 180 / Math.PI).toFixed(1) + '°',
            visualType: this.visualType
        };
    }
}

console.log("✅ Projectile.js cargado correctamente"); 