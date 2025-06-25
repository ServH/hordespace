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
        this.followStrength = CONFIG.FORMATION_FOLLOW_STRENGTH || 0;
        this.maxCorrectionForce = CONFIG.FORMATION_MAX_CORRECTION_FORCE || 0;
        this.correctionThreshold = CONFIG.FORMATION_CORRECTION_THRESHOLD || 0;
        
        // Variables para debug de formación
        this.lastDistanceToTarget = 0;
        this.lastAppliedForce = 0;
        this.lastTargetX = 0;
        this.lastTargetY = 0;
        
        // Timer para controlar frecuencia de logs de debug
        this.debugTimer = 0;
        
        // Propiedades de IA de combate (configuradas en Fase 5.3)
        this.aiTargetingRange = CONFIG.ALLY_DEFAULT_AI_TARGETING_RANGE;
        this.fireRate = CONFIG.ALLY_DEFAULT_FIRE_RATE;
        this.fireCooldown = 0;
        this.damage = CONFIG.ALLY_DEFAULT_DAMAGE;
        this.targetEnemy = null;
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
        // === LÓGICA DE MOVIMIENTO DE FORMACIÓN ORGÁNICO ===
        if (this.game.player && this.game.player.isAlive && this.followStrength > 0) {
            // 1. Calcular posición objetivo con rotación del comandante
            const commanderAngle = this.game.player.angle;
            const rotatedOffsetX = this.formationOffset.x * Math.cos(commanderAngle) - this.formationOffset.y * Math.sin(commanderAngle);
            const rotatedOffsetY = this.formationOffset.x * Math.sin(commanderAngle) + this.formationOffset.y * Math.cos(commanderAngle);
            
            const targetX = this.game.player.position.x + rotatedOffsetX;
            const targetY = this.game.player.position.y + rotatedOffsetY;
            
            // 2. Calcular vector de dirección y distancia
            const dirX = targetX - this.position.x;
            const dirY = targetY - this.position.y;
            const distanceToTarget = Math.sqrt(dirX * dirX + dirY * dirY);
            
            // 3. Movimiento suave con interpolación
            if (distanceToTarget > 1) {
                // Factor de suavizado basado en distancia (más suave cuando está cerca)
                const smoothingFactor = CONFIG.FORMATION_SMOOTHING_FACTOR || 0.15;
                const distanceFactor = Math.min(distanceToTarget / 50, 1.0); // Normalizar a 50px
                const adjustedSmoothing = smoothingFactor * distanceFactor;
                
                // Interpolación suave hacia la posición objetivo
                this.velocity.x += (dirX * adjustedSmoothing - this.velocity.x * 0.1) * deltaTime * 60;
                this.velocity.y += (dirY * adjustedSmoothing - this.velocity.y * 0.1) * deltaTime * 60;
                
                // Aplicar amortiguación para estabilidad
                const dampingFactor = CONFIG.FORMATION_DAMPING || 0.92;
                this.velocity.x *= dampingFactor;
                this.velocity.y *= dampingFactor;
            }
            
            // 4. Corrección de emergencia más suave
            if (distanceToTarget > this.correctionThreshold) {
                // Corrección gradual en lugar de teletransporte
                const correctionStrength = 0.3;
                this.velocity.x += dirX * correctionStrength * deltaTime;
                this.velocity.y += dirY * correctionStrength * deltaTime;
                
                console.warn(`⚠️ AllyShip ${this.type} muy lejos (${distanceToTarget.toFixed(1)}), aplicando corrección suave`);
            }
            
            // 5. Rotación sincronizada con comandante (opcional)
            if (CONFIG.FORMATION_ROTATION_SYNC) {
                // Sincronizar con la rotación del comandante
                this.angle = commanderAngle;
            } else {
                // Rotación basada en dirección de movimiento (más orgánica)
                const velocityMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (velocityMagnitude > 5) { // Solo rotar si se está moviendo significativamente
                    const targetAngle = Math.atan2(this.velocity.x, -this.velocity.y);
                    // Interpolación suave de rotación
                    let angleDiff = targetAngle - this.angle;
                    
                    // Normalizar diferencia de ángulo (-π a π)
                    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                    
                    this.angle += angleDiff * 0.1; // Rotación suave
                }
            }
            
            // Almacenar valores para debug
            this.lastDistanceToTarget = distanceToTarget;
            this.lastAppliedForce = 0; // Ya no usamos fuerza directa
            this.lastTargetX = targetX;
            this.lastTargetY = targetY;
        }
        
        // === LÓGICA DE IA DE COMBATE (FASE 5.3) ===
        
        // 1. Búsqueda de objetivo
        this.targetEnemy = this.findTargetEnemy();
        
        // 2. Lógica de combate y disparo
        if (this.targetEnemy && this.targetEnemy.isAlive) {
            // Rotar la nave para mirar al objetivo
            const targetAngle = Math.atan2(this.targetEnemy.position.x - this.position.x, -(this.targetEnemy.position.y - this.position.y));
            
            // Interpolación de rotación suave solo si no está sincronizada con el comandante
            if (!CONFIG.FORMATION_ROTATION_SYNC) {
                let angleDiff = targetAngle - this.angle;
                // Normalizar diferencia de ángulo (-π a π)
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                this.angle += angleDiff * CONFIG.ALLY_DEFAULT_ROTATION_SPEED_COMBAT * deltaTime * 60;
            } else {
                // Si está sincronizada, rotar directamente hacia el objetivo cuando hay enemigo
                let angleDiff = targetAngle - this.angle;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                this.angle += angleDiff * CONFIG.ALLY_DEFAULT_ROTATION_SPEED_COMBAT * deltaTime * 60;
            }
            
            // Disparar si el cooldown lo permite
            if (this.fireCooldown <= 0) {
                this.fire();
                this.fireCooldown = this.fireRate;
            }
        } else {
            // Sin objetivo: mantener comportamiento de rotación de formación original
            if (CONFIG.FORMATION_ROTATION_SYNC) {
                // Sincronizar con la rotación del comandante
                if (this.game.player) {
                    this.angle = this.game.player.angle;
                }
            }
        }
        
        // 3. Gestión de fireCooldown
        if (this.fireCooldown > 0) {
            this.fireCooldown -= deltaTime;
        }
        
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
     * Busca el enemigo más cercano dentro del rango de targeting
     * @returns {EnemyShip|null} El enemigo más cercano o null si no hay ninguno
     */
    findTargetEnemy() {
        if (!this.game || !this.game.enemies || this.game.enemies.length === 0) {
            return null;
        }
        
        let closestEnemy = null;
        let minDistance = this.aiTargetingRange + 1;
        
        // Iterar sobre todos los enemigos activos
        for (const enemy of this.game.enemies) {
            if (enemy && enemy.isAlive) {
                // Calcular distancia entre esta nave y el enemigo
                const dx = enemy.position.x - this.position.x;
                const dy = enemy.position.y - this.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Si está dentro del rango y es más cercano que el anterior
                if (distance < minDistance && distance <= this.aiTargetingRange) {
                    closestEnemy = enemy;
                    minDistance = distance;
                }
            }
        }
        
        return closestEnemy;
    }
    
    /**
     * Dispara un proyectil hacia el objetivo actual
     */
    fire() {
        // Verificar que tenemos acceso al pool de proyectiles
        if (!this.projectilePool) {
            console.warn("⚠️ AllyShip no tiene acceso al pool de proyectiles.");
            return;
        }
        
        // ¡CORRECCIÓN CRÍTICA DEL BUG! - Usar 'get()' en lugar de 'getObject()'
        const projectile = this.projectilePool.get();
        if (!projectile) {
            console.warn("⚠️ AllyShip no pudo obtener proyectil del pool.");
            return;
        }
        
        // Calcular posición del disparo (desde la punta de la nave)
        const fireX = this.position.x + Math.sin(this.angle) * this.radius;
        const fireY = this.position.y - Math.cos(this.angle) * this.radius;
        
        // Activar el proyectil
        projectile.activate(
            fireX,
            fireY,
            this.angle,
            this.damage,
            CONFIG.PROJECTILE_SPEED,
            'player' // Los proyectiles de aliados son del tipo 'player'
        );
        
        // Resetear cooldown
        this.fireCooldown = this.fireRate;
    }
    
    /**
     * Obtiene información de debug de la nave aliada
     * @returns {Object} Información de debug
     */
    getDebugInfo() {
        const speed = this.getCurrentSpeed();
        const angleDegrees = (this.angle * 180 / Math.PI).toFixed(1);
        const commanderAngleDegrees = this.game.player ? (this.game.player.angle * 180 / Math.PI).toFixed(1) : 'N/A';
        
        return {
            type: this.type,
            pos: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            target: `(${this.lastTargetX.toFixed(1)}, ${this.lastTargetY.toFixed(1)})`,
            vel: `(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
            speed: speed.toFixed(1),
            angle: `${angleDegrees}°`,
            commanderAngle: `${commanderAngleDegrees}°`,
            hp: `${this.hp}/${this.maxHp}`,
            formationOffset: `(${this.formationOffset.x.toFixed(1)}, ${this.formationOffset.y.toFixed(1)})`,
            distanceToTarget: this.lastDistanceToTarget ? this.lastDistanceToTarget.toFixed(1) : 'N/A',
            rotationSync: CONFIG.FORMATION_ROTATION_SYNC ? 'ON' : 'OFF',
            targetEnemy: this.targetEnemy ? 
                `${this.targetEnemy.type || 'Enemy'} HP:${this.targetEnemy.hp}/${this.targetEnemy.maxHp} Dist:${Math.sqrt(Math.pow(this.targetEnemy.position.x - this.position.x, 2) + Math.pow(this.targetEnemy.position.y - this.position.y, 2)).toFixed(1)}` : 
                'NONE',
            fireCooldown: this.fireCooldown.toFixed(2),
            canFire: this.fireCooldown <= 0 && this.targetEnemy !== null
        };
    }
} 