/**
 * Space Horde Survivor - Clase PlayerShip (Comandante)
 * Nave principal controlada por el jugador
 */

class PlayerShip extends Ship {
    constructor(x, y) {
        // Llamar al constructor padre con valores de CONFIG
        super(
            x, y,
            CONFIG.PLAYER.RADIUS,
            CONFIG.PLAYER.HP,
            CONFIG.PLAYER.SPEED,
            CONFIG.PLAYER.ACCELERATION,
            CONFIG.PLAYER.FRICTION,
            CONFIG.PLAYER.ROTATION_SPEED
        );
        
        // Estado de entrada del teclado
        this.inputState = {
            up: false,      // W o Flecha Arriba
            down: false,    // S o Flecha Abajo
            left: false,    // A o Flecha Izquierda
            right: false    // D o Flecha Derecha
        };
        
        // Propiedades específicas del comandante
        this.color = '#00FF00';           // Verde para el comandante
        this.thrustColor = '#00FFFF';     // Cyan para efectos de propulsión
        this.thrustIntensity = 0;         // Intensidad actual de propulsión (0-1)
        
        // Límites de pantalla (se actualizarán desde Game)
        this.screenBounds = {
            minX: 0,
            maxX: CONFIG.CANVAS.WIDTH,
            minY: 0,
            maxY: CONFIG.CANVAS.HEIGHT
        };
        
        // Propiedades de disparo
        this.fireCooldown = 0;
        this.autoFire = true; // Disparo automático habilitado
        this.fireRate = CONFIG.PLAYER.FIRE_RATE;
        
        // Referencia al pool de proyectiles (se establecerá desde Game)
        this.projectilePool = null;
        
        console.log("👑 Comandante creado en posición:", this.position);
    }
    
    /**
     * Actualiza el comandante (movimiento, física, límites)
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        // Procesar entrada del teclado
        this.processInput(deltaTime);
        
        // Actualizar cooldown de disparo
        this.updateFireCooldown(deltaTime);
        
        // Disparo automático si está habilitado
        if (this.autoFire && this.canFire()) {
            this.fire();
        }
        
        // Regeneración de salud si está habilitada
        if (this.healthRegen && this.healthRegen > 0 && this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + this.healthRegen * deltaTime);
        }
        
        // Llamar al update padre para física básica
        super.update(deltaTime);
        
        // Mantener dentro de los límites de pantalla
        this.keepInBounds(
            this.screenBounds.minX,
            this.screenBounds.maxX,
            this.screenBounds.minY,
            this.screenBounds.maxY
        );
        
        // Actualizar intensidad de propulsión para efectos visuales
        this.updateThrustIntensity();
    }
    
    /**
     * Procesa la entrada del teclado y aplica fuerzas
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    processInput(deltaTime) {
        let thrustApplied = false;
        
        // Movimiento hacia adelante/atrás
        if (this.inputState.up) {
                            this.applyThrustForce(CONFIG.PLAYER.ACCELERATION);
            thrustApplied = true;
        }
        if (this.inputState.down) {
                            this.applyThrustForce(-CONFIG.PLAYER.ACCELERATION * 0.5); // Retroceso más lento
            thrustApplied = true;
        }
        
        // Rotación
        if (this.inputState.left) {
            this.rotate(-this.rotationSpeed * deltaTime);
        }
        if (this.inputState.right) {
            this.rotate(this.rotationSpeed * deltaTime);
        }
        
        // Actualizar estado de propulsión
        this.thrustIntensity = thrustApplied ? 1.0 : Math.max(0, this.thrustIntensity - deltaTime * 3);
    }
    
    /**
     * Actualiza la intensidad de propulsión para efectos visuales
     */
    updateThrustIntensity() {
        // La intensidad se basa en si hay entrada y la velocidad actual
        const speedRatio = this.getCurrentSpeed() / this.maxSpeed;
        this.thrustIntensity = Math.max(this.thrustIntensity, speedRatio * 0.5);
    }
    
    /**
     * Renderiza el comandante como un triángulo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Trasladar al centro de la nave
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según el ángulo de la nave
        ctx.rotate(this.angle);
        
        // Dibujar efectos de propulsión primero (detrás de la nave)
        if (this.thrustIntensity > 0.1) {
            this.renderThrustEffects(ctx);
        }
        
        // Dibujar el cuerpo de la nave (triángulo)
        this.renderShipBody(ctx);
        
        // Dibujar indicadores adicionales si es necesario
        this.renderHealthBar(ctx);
        
        ctx.restore();
    }
    
    /**
     * Renderiza el cuerpo principal de la nave (triángulo)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderShipBody(ctx) {
        const size = this.radius;
        
        // Dibujar triángulo principal
        ctx.beginPath();
        ctx.moveTo(0, -size);                    // Punta superior
        ctx.lineTo(-size * 0.6, size * 0.8);     // Esquina inferior izquierda
        ctx.lineTo(size * 0.6, size * 0.8);      // Esquina inferior derecha
        ctx.closePath();
        
        // Relleno
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Contorno
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Detalles adicionales del comandante
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(0, size * 0.3);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    /**
     * Renderiza los efectos de propulsión
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderThrustEffects(ctx) {
        const intensity = this.thrustIntensity;
        const size = this.radius;
        
        // Llama principal de propulsión
        ctx.beginPath();
        ctx.moveTo(-size * 0.3, size * 0.8);
        ctx.lineTo(0, size * 0.8 + size * intensity * 1.5);
        ctx.lineTo(size * 0.3, size * 0.8);
        
        // Gradiente de color para la llama
        const gradient = ctx.createLinearGradient(0, size * 0.8, 0, size * 0.8 + size * intensity * 1.5);
        gradient.addColorStop(0, `rgba(0, 255, 255, ${intensity})`);      // Cyan brillante
        gradient.addColorStop(0.5, `rgba(0, 150, 255, ${intensity * 0.8})`); // Azul
        gradient.addColorStop(1, `rgba(0, 100, 255, ${intensity * 0.3})`);    // Azul oscuro
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Partículas adicionales de propulsión
        this.renderThrustParticles(ctx, intensity, size);
    }
    
    /**
     * Renderiza partículas adicionales de propulsión
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     * @param {number} intensity - Intensidad de la propulsión
     * @param {number} size - Tamaño base de la nave
     */
    renderThrustParticles(ctx, intensity, size) {
        const particleCount = Math.floor(intensity * 5);
        
        for (let i = 0; i < particleCount; i++) {
            const offsetX = (Math.random() - 0.5) * size * 0.6;
            const offsetY = size * 0.8 + Math.random() * size * intensity;
            const particleSize = Math.random() * 3 + 1;
            const alpha = intensity * (0.5 + Math.random() * 0.5);
            
            ctx.beginPath();
            ctx.arc(offsetX, offsetY, particleSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.fill();
        }
    }
    
    /**
     * Renderiza la barra de vida del comandante
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        if (this.hp >= this.maxHp) return; // Solo mostrar si está dañado
        
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = -this.radius - 15;
        
        // Fondo de la barra
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        
        // Barra de vida actual
        const healthRatio = this.hp / this.maxHp;
        const healthColor = healthRatio > 0.6 ? '#00FF00' : healthRatio > 0.3 ? '#FFFF00' : '#FF0000';
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(-barWidth / 2, barY, barWidth * healthRatio, barHeight);
        
        // Contorno
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
    }
    
    /**
     * Maneja la entrada del teclado
     * @param {Object} keyboardState - Estado actual del teclado
     */
    handleInput(keyboardState) {
        // Mapear teclas a acciones
        this.inputState.up = keyboardState['KeyW'] || keyboardState['ArrowUp'] || false;
        this.inputState.down = keyboardState['KeyS'] || keyboardState['ArrowDown'] || false;
        this.inputState.left = keyboardState['KeyA'] || keyboardState['ArrowLeft'] || false;
        this.inputState.right = keyboardState['KeyD'] || keyboardState['ArrowRight'] || false;
    }
    
    /**
     * Actualiza los límites de pantalla
     * @param {number} width - Ancho de la pantalla
     * @param {number} height - Alto de la pantalla
     */
    updateScreenBounds(width, height) {
        this.screenBounds = {
            minX: 0,
            maxX: width,
            minY: 0,
            maxY: height
        };
    }
    
    /**
     * Método específico del comandante cuando es destruido
     */
    onDestroy() {
        super.onDestroy();
        console.log("💀 ¡El Comandante ha sido destruido! Game Over");
        
        // Aquí podríamos activar efectos especiales de explosión
        // o cambiar el estado del juego a GAME_OVER
    }
    
    /**
     * Actualiza el cooldown de disparo
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateFireCooldown(deltaTime) {
        if (this.fireCooldown > 0) {
            this.fireCooldown -= deltaTime;
        }
    }
    
    /**
     * Verifica si puede disparar
     * @returns {boolean} - true si puede disparar
     */
    canFire() {
        return this.fireCooldown <= 0 && this.projectilePool !== null;
    }
    
    /**
     * Dispara un proyectil
     */
    fire() {
        if (!this.canFire()) return;
        
        // Obtener proyectil del pool
        const projectile = this.projectilePool.get();
        if (!projectile) {
            console.warn("⚠️ No se pudo obtener proyectil del pool");
            return;
        }
        
        // Calcular posición de disparo (frente de la nave)
        const fireOffsetDistance = this.radius + 5;
        const fireX = this.position.x + Math.sin(this.angle) * fireOffsetDistance;
        const fireY = this.position.y - Math.cos(this.angle) * fireOffsetDistance;
        
        // Activar proyectil
        projectile.activate(
            fireX, fireY,
            this.angle,
            CONFIG.PLAYER.PROJECTILE_DAMAGE,
            CONFIG.PLAYER.PROJECTILE_SPEED,
            'player'
        );
        
        // Establecer cooldown
        this.fireCooldown = this.fireRate;
        
        console.log(`🔫 Comandante disparó proyectil con daño ${CONFIG.PLAYER.PROJECTILE_DAMAGE} en ángulo ${(this.angle * 180 / Math.PI).toFixed(1)}°`);
    }
    
    /**
     * Establece la referencia al pool de proyectiles
     * @param {ObjectPool} pool - Pool de proyectiles
     */
    setProjectilePool(pool) {
        this.projectilePool = pool;
        console.log("🔫 Pool de proyectiles asignado al Comandante");
    }
    
    /**
     * Obtiene información de estado para debugging
     * @returns {Object} - Información de estado
     */
    getDebugInfo() {
        return {
            position: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            velocity: `(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
            speed: this.getCurrentSpeed().toFixed(1),
            angle: (this.angle * 180 / Math.PI).toFixed(1) + '°',
            hp: `${this.hp}/${this.maxHp}`,
            thrust: (this.thrustIntensity * 100).toFixed(0) + '%',
            fireCooldown: this.fireCooldown.toFixed(2),
            canFire: this.canFire()
        };
    }
}

console.log("✅ PlayerShip.js cargado correctamente"); 