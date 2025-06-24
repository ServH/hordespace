/**
 * Space Horde Survivor - Clase Projectile
 * Proyectiles gestionados por Object Pooling
 */

class Projectile extends Ship {
    constructor() {
        // Constructor sin parámetros para Object Pooling
        // Los valores reales se establecen en activate()
        super(0, 0, CONFIG.PROJECTILE_RADIUS, 1, CONFIG.PROJECTILE_SPEED, 0, 1, 0);
        
        // Propiedades específicas del proyectil
        this.active = false;
        this.damage = 0;
        this.owner = '';
        this.lifeTime = 0;
        this.maxLifeTime = 5; // 5 segundos máximo de vida
        
        // Propiedades visuales
        this.color = '#FFFFFF';
        this.trailLength = 8;
        this.trailPositions = [];
        
        // Desactivar física innecesaria para proyectiles
        this.friction = 1; // Sin fricción
        
        console.log("🚀 Proyectil creado para pool");
    }
    
    /**
     * Activa el proyectil con parámetros específicos
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {number} angle - Ángulo de disparo en radianes
     * @param {number} damage - Daño del proyectil
     * @param {number} speed - Velocidad del proyectil
     * @param {string} owner - Propietario ('player', 'enemy')
     */
    activate(x, y, angle, damage, speed, owner) {
        // Establecer posición inicial
        this.position.x = x;
        this.position.y = y;
        
        // Establecer propiedades
        this.angle = angle;
        this.damage = damage;
        this.maxSpeed = speed;
        this.owner = owner;
        this.active = true;
        this.isAlive = true;
        this.lifeTime = 0;
        
        // Calcular velocidad basada en ángulo
        this.velocity.x = Math.sin(angle) * speed;
        this.velocity.y = -Math.cos(angle) * speed;
        
        // Resetear aceleración
        this.acceleration.x = 0;
        this.acceleration.y = 0;
        
        // Configurar color según propietario
        this.color = owner === 'player' ? '#00FFFF' : '#FF4444';
        
        // Limpiar trail
        this.trailPositions = [];
        
        console.log(`🚀 Proyectil activado: ${owner} en (${x.toFixed(1)}, ${y.toFixed(1)})`);
    }
    
    /**
     * Desactiva el proyectil y lo prepara para reutilización
     */
    deactivate() {
        this.active = false;
        this.isAlive = false;
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
        
        // Actualizar física básica (sin fricción ni aceleración adicional)
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
            this.position.x > CONFIG.CANVAS_WIDTH + margin ||
            this.position.y < -margin || 
            this.position.y > CONFIG.CANVAS_HEIGHT + margin) {
            this.deactivate();
        }
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
        
        // Renderizar proyectil principal
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
        
        ctx.beginPath();
        
        for (let i = 1; i < this.trailPositions.length; i++) {
            const pos = this.trailPositions[i];
            const prevPos = this.trailPositions[i - 1];
            
            // Alpha basado en la antigüedad del punto del trail
            const age = this.lifeTime - pos.time;
            const alpha = Math.max(0, 1 - (age / 0.2)); // 0.2 segundos de trail
            
            ctx.globalAlpha = alpha * 0.3;
            
            ctx.moveTo(prevPos.x, prevPos.y);
            ctx.lineTo(pos.x, pos.y);
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza el proyectil principal
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderProjectile(ctx) {
        // Trasladar al centro del proyectil
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según dirección de movimiento
        ctx.rotate(this.angle);
        
        // Dibujar proyectil según el propietario
        if (this.owner === 'player') {
            this.renderPlayerProjectile(ctx);
        } else {
            this.renderEnemyProjectile(ctx);
        }
    }
    
    /**
     * Renderiza proyectil del jugador
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderPlayerProjectile(ctx) {
        const size = this.radius;
        
        // Línea principal (láser)
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(0, -size * 2);
        ctx.lineTo(0, size * 2);
        ctx.stroke();
        
        // Núcleo brillante
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Halo exterior
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    /**
     * Renderiza proyectil enemigo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderEnemyProjectile(ctx) {
        const size = this.radius;
        
        // Proyectil más simple para enemigos
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Contorno
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * Verifica colisión con otra entidad
     * @param {Ship} other - Otra entidad
     * @returns {boolean} - true si hay colisión
     */
    isColliding(other) {
        if (!this.active || !other.isAlive) return false;
        
        // No colisionar con entidades del mismo propietario
        if (this.owner === 'player' && other instanceof PlayerShip) return false;
        if (this.owner === 'enemy' && other instanceof EnemyShip) return false;
        
        // Usar colisión circular de la clase padre
        return super.isColliding(other);
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
            angle: (this.angle * 180 / Math.PI).toFixed(1) + '°'
        };
    }
}

console.log("✅ Projectile.js cargado correctamente"); 