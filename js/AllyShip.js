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
     * @param {Object} shipConfig - Configuración específica de la nave (CONFIG.ALLY.DEFAULT, SCOUT, etc.)
     */
    constructor(x, y, gameInstance, shipConfig = CONFIG.ALLY.DEFAULT) {
        // Llamar al constructor padre con valores del shipConfig
        super(
            x, y,
            shipConfig.RADIUS,
            shipConfig.HP,
            shipConfig.SPEED,
            shipConfig.ACCELERATION,
            shipConfig.FRICTION,
            shipConfig.ROTATION_SPEED
        );
        
        // === PROPIEDADES ESPECÍFICAS DE ALLY SHIP ===
        
        // Referencia al objeto Game para acceder a otros elementos
        this.game = gameInstance;
        
        // Tipo de nave (identificación para logs y subclases)
        this.type = shipConfig.TYPE || 'defaultAlly';
        
        // Color de la nave aliada
        this.color = shipConfig.COLOR;
        
        // Propiedades de combate desde shipConfig
        this.aiTargetingRange = shipConfig.AI_TARGETING_RANGE;
        this.fireRate = shipConfig.FIRE_RATE;
        this.damage = shipConfig.DAMAGE;
        this.rotationSpeedCombat = shipConfig.ROTATION_SPEED_COMBAT;
        this.fireConeAngle = shipConfig.FIRE_CONE_ANGLE;
        
        // Propiedades de formación desde CONFIG.FORMATION
        this.followStrength = CONFIG.FORMATION.FOLLOW_STRENGTH;
        this.maxCorrectionForce = CONFIG.FORMATION.MAX_CORRECTION_FORCE;
        this.correctionThreshold = CONFIG.FORMATION.CORRECTION_THRESHOLD;
        this.smoothingFactor = CONFIG.FORMATION.SMOOTHING_FACTOR;
        this.damping = CONFIG.FORMATION.DAMPING;
        this.rotationSync = CONFIG.FORMATION.ROTATION_SYNC;
        this.velocityThreshold = CONFIG.FORMATION.VELOCITY_THRESHOLD;
        this.speedAdaptationMaxFactor = CONFIG.FORMATION.SPEED_ADAPTATION_MAX_FACTOR;
        this.distanceFactorThreshold = CONFIG.FORMATION.DISTANCE_FACTOR_THRESHOLD;
        this.distanceFactorMax = CONFIG.FORMATION.DISTANCE_FACTOR_MAX;
        this.velocityDampingFactor = CONFIG.FORMATION.VELOCITY_DAMPING_FACTOR;
        this.correctionStrengthDistanceThreshold = CONFIG.FORMATION.CORRECTION_STRENGTH_DISTANCE_THRESHOLD;
        this.correctionStrengthMaxFactor = CONFIG.FORMATION.CORRECTION_STRENGTH_MAX_FACTOR;
        
        // Offset de formación relativo al comandante (usado en Fase 5.2)
        this.formationOffset = { x: 0, y: 0 };
        
        // Variables para debug de formación
        this.lastDistanceToTarget = 0;
        this.lastAppliedForce = 0;
        this.lastTargetX = 0;
        this.lastTargetY = 0;
        
        // Timer para controlar frecuencia de logs de debug
        this.debugTimer = 0;
        
        // Propiedades de IA de combate (FASE 5.5.3)
        this.fireCooldown = 0;
        this.targetEnemy = null;
        this.projectilePool = null;
        this.fireConeAngle = shipConfig.FIRE_CONE_ANGLE; // CRÍTICO: Faltaba esta propiedad
        
        // Verificar que el ángulo inicial es válido
        if (isNaN(this.angle)) {
            this.angle = 0;
        }
        
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
            
            // 3. Movimiento con fuerza proporcional (AFINADO EXTREMO)
            if (distanceToTarget > 1) {
                // Normalizar dirección
                const normalizedDirX = dirX / distanceToTarget;
                const normalizedDirY = dirY / distanceToTarget;
                
                // Calcular fuerza proporcional a la distancia
                let forceMagnitude = distanceToTarget * this.followStrength;
                forceMagnitude = Math.min(forceMagnitude, this.maxCorrectionForce);
                
                // Aplicar fuerza con smoothing factor
                const appliedForceX = normalizedDirX * forceMagnitude * this.smoothingFactor;
                const appliedForceY = normalizedDirY * forceMagnitude * this.smoothingFactor;
                
                this.velocity.x += appliedForceX * deltaTime;
                this.velocity.y += appliedForceY * deltaTime;
                
                // Aplicar amortiguación para estabilidad
                this.velocity.x *= this.damping;
                this.velocity.y *= this.damping;
                
                // Almacenar fuerza aplicada para debug
                this.lastAppliedForce = forceMagnitude;
            }
            
            // 4. Corrección de emergencia (CRÍTICO)
            if (distanceToTarget > this.correctionThreshold) {
                // Normalizar dirección
                const normalizedDirX = dirX / distanceToTarget;
                const normalizedDirY = dirY / distanceToTarget;
                
                // Aplicar fuerza máxima de corrección
                const emergencyForceX = normalizedDirX * this.maxCorrectionForce;
                const emergencyForceY = normalizedDirY * this.maxCorrectionForce;
                
                this.velocity.x += emergencyForceX * deltaTime;
                this.velocity.y += emergencyForceY * deltaTime;
                
                console.warn(`⚠️ AllyShip ${this.type} muy lejos (${distanceToTarget.toFixed(1)}px), aplicando corrección de emergencia con fuerza ${this.maxCorrectionForce}`);
            }
            
            // 5. Rotación sincronizada con comandante (opcional)
            if (this.rotationSync) {
                // Sincronizar con la rotación del comandante
                this.angle = commanderAngle;
            } else {
                // Rotación basada en dirección de movimiento (más orgánica)
                const velocityMagnitude = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (velocityMagnitude > this.velocityThreshold) { // Solo rotar si se está moviendo significativamente
                    const targetAngle = Math.atan2(this.velocity.x, -this.velocity.y);
                    
                    // Verificar que targetAngle es válido
                    if (!isNaN(targetAngle) && !isNaN(this.angle)) {
                        // Interpolación suave de rotación
                        let angleDiff = targetAngle - this.angle;
                        
                        // Normalizar diferencia de ángulo (-π a π)
                        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                        
                        this.angle += angleDiff * 0.1; // Rotación suave
                    }
                }
                
                // Verificar que el ángulo sigue siendo válido
                if (isNaN(this.angle)) {
                    this.angle = 0; // Reset a 0 si se corrompe
                }
            }
            
            // Almacenar valores para debug
            this.lastDistanceToTarget = distanceToTarget;
            // this.lastAppliedForce ya se almacena en el bloque de movimiento
            this.lastTargetX = targetX;
            this.lastTargetY = targetY;
        }
        
        // === LÓGICA DE IA DE COMBATE (FASE 5.3) ===
        
        // 1. Búsqueda de objetivo
        this.targetEnemy = this.findTargetEnemy();
        
        // 2. Lógica de combate y disparo
        if (this.targetEnemy && this.targetEnemy.isAlive) {
            // CORRECCIÓN CRÍTICA: Validar ángulo antes de cualquier cálculo
            if (isNaN(this.angle)) {
                this.angle = this.game.player ? this.game.player.angle : 0;
            }
            
            // Rotar la nave para mirar al objetivo
            const targetAngle = Math.atan2(this.targetEnemy.position.x - this.position.x, -(this.targetEnemy.position.y - this.position.y));
            
            // Verificar que los ángulos son válidos antes de interpolar
            if (!isNaN(targetAngle) && !isNaN(this.angle)) {
                // === FASE 5.5.3: ROTACIÓN DE COMBATE AGRESIVA Y PERCEPTIBLE ===
                let angleDiff = targetAngle - this.angle;
                
                // Normalizar diferencia de ángulo (-π a π)
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                
                // Calcular ángulo relativo para evitar giros de 180°
                const relativeAngle = Math.abs(angleDiff);
                
                // Solo rotar si el enemigo está en el cono frontal (no detrás)
                if (relativeAngle <= Math.PI / 2) {
                    // CORRECCIÓN: Usar rotación más agresiva cuando hay enemigo
                    const maxRotationThisFrame = this.rotationSpeedCombat * deltaTime;
                    const rotationAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxRotationThisFrame);
                    
                    // Aplicar rotación
                    this.angle += rotationAmount;
                    
                    // Validar que el ángulo resultante es válido
                    if (isNaN(this.angle)) {
                        this.angle = targetAngle; // Usar ángulo objetivo si hay corrupción
                    }
                }
            }
            
            // === FASE 5.5.3: DISPARO CONDICIONAL CON CONO DE FUEGO ===
            // Validar ángulo antes del cálculo de disparo
            if (isNaN(this.angle)) {
                this.angle = this.game.player ? this.game.player.angle : 0;
            }
            
            // Calcular si el enemigo está dentro del cono de disparo
            const enemyAngle = Math.atan2(this.targetEnemy.position.x - this.position.x, -(this.targetEnemy.position.y - this.position.y));
            
            if (!isNaN(enemyAngle) && !isNaN(this.angle)) {
                let angleDiffForFiring = enemyAngle - this.angle;
                while (angleDiffForFiring > Math.PI) angleDiffForFiring -= 2 * Math.PI;
                while (angleDiffForFiring < -Math.PI) angleDiffForFiring += 2 * Math.PI;
                
                const inFireCone = Math.abs(angleDiffForFiring) <= this.fireConeAngle;
                
                // DEBUG: Log detallado del cálculo de disparo
                if (CONFIG.DEBUG.FLEET_INFO && this.debugTimer >= 0.45) {
                    console.log(`🎯 DISPARO DEBUG: enemyAngle=${(enemyAngle*180/Math.PI).toFixed(1)}°, shipAngle=${(this.angle*180/Math.PI).toFixed(1)}°, diff=${(Math.abs(angleDiffForFiring)*180/Math.PI).toFixed(1)}°, coneLimit=${(this.fireConeAngle*180/Math.PI).toFixed(1)}°, canFire=${this.fireCooldown <= 0}, inCone=${inFireCone}`);
                }
                
                // Disparar solo si está en el cono de fuego y el cooldown lo permite
                if (this.fireCooldown <= 0 && inFireCone) {
                    this.fire();
                    this.fireCooldown = this.fireRate;
                    console.log(`🔥 ${this.type} disparando a ${this.targetEnemy.type || 'Enemy'} - Ángulo diff: ${(Math.abs(angleDiffForFiring) * 180 / Math.PI).toFixed(1)}°`);
                }
            }
        } else {
            // Sin objetivo: mantener comportamiento de rotación de formación original
            if (this.rotationSync) {
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
        if (this.debugTimer >= 0.5 && CONFIG.DEBUG.FLEET_INFO) {
            const debugInfo = this.getDebugInfo();
            console.log(`🛸 ${this.type} Debug:`);
            console.log(`  📍 Posición: ${debugInfo.pos}`);
            console.log(`  🎯 Objetivo: ${debugInfo.target}`);
            console.log(`  📏 Distancia: ${debugInfo.distanceToTarget}`);
            console.log(`  ⚡ Fuerza: ${debugInfo.appliedForce}`);
            console.log(`  🚀 Velocidad: ${debugInfo.speed}`);
            console.log(`  🔄 Rotación: ${debugInfo.angle} (Comandante: ${debugInfo.commanderAngle})`);
            console.log(`  👥 Formación: Offset: ${debugInfo.formationOffset}, Sync: ${debugInfo.rotationSync}`);
            console.log(`  🎯 Combate: ${debugInfo.targetEnemy}`);
            console.log(`  🔍 Apuntado: Ángulo: ${debugInfo.relativeAngleToEnemy}, EnCono: ${debugInfo.inFireCone}, Cooldown: ${debugInfo.fireCooldown}s`);
            console.log(`  ⚙️ Config: FollowStr: ${debugInfo.followStrength}, MaxForce: ${debugInfo.maxCorrectionForce}`);
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
        
        // CORRECCIÓN CRÍTICA: Validar ángulo antes de disparar
        if (isNaN(this.angle)) {
            console.warn("⚠️ AllyShip no puede disparar con ángulo NaN");
            this.angle = this.game.player ? this.game.player.angle : 0;
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
        
        // Validar posiciones de disparo
        if (isNaN(fireX) || isNaN(fireY)) {
            console.warn("⚠️ AllyShip calculó posición de disparo inválida, usando posición de nave");
            projectile.activate(
                this.position.x,
                this.position.y,
                this.angle,
                this.damage,
                CONFIG.PROJECTILE.SPEED,
                'player'
            );
        } else {
            // Activar el proyectil con posición calculada
            projectile.activate(
                fireX,
                fireY,
                this.angle,
                this.damage,
                CONFIG.PROJECTILE.SPEED,
                'player' // Los proyectiles de aliados son del tipo 'player'
            );
        }
        
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
            // === INFORMACIÓN BÁSICA ===
            type: this.type,
            pos: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            vel: `(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`,
            speed: speed.toFixed(1),
            hp: `${this.hp}/${this.maxHp}`,
            
            // === INFORMACIÓN DE FORMACIÓN (CRÍTICA PARA FASE 5.5.2) ===
            distanceToTarget: this.lastDistanceToTarget ? `${this.lastDistanceToTarget.toFixed(1)}px` : 'N/A',
            appliedForce: this.lastAppliedForce ? this.lastAppliedForce.toFixed(1) : '0',
            followStrength: this.followStrength,
            maxCorrectionForce: this.maxCorrectionForce,
            target: `(${this.lastTargetX ? this.lastTargetX.toFixed(1) : 'N/A'}, ${this.lastTargetY ? this.lastTargetY.toFixed(1) : 'N/A'})`,
            formationOffset: `(${this.formationOffset.x.toFixed(1)}, ${this.formationOffset.y.toFixed(1)})`,
            
            // === INFORMACIÓN DE ROTACIÓN ===
            angle: `${angleDegrees}°`,
            commanderAngle: `${commanderAngleDegrees}°`,
            rotationSync: this.rotationSync ? 'ON' : 'OFF',
            
            // === INFORMACIÓN DE COMBATE (FASE 5.5.3) ===
            targetEnemy: this.targetEnemy ? 
                `${this.targetEnemy.type || 'Enemy'} HP:${this.targetEnemy.hp}/${this.targetEnemy.maxHp} Dist:${Math.sqrt(Math.pow(this.targetEnemy.position.x - this.position.x, 2) + Math.pow(this.targetEnemy.position.y - this.position.y, 2)).toFixed(1)}` : 
                'NONE',
            relativeAngleToEnemy: this.targetEnemy && !isNaN(this.angle) ? 
                (() => {
                    const enemyAngle = Math.atan2(this.targetEnemy.position.x - this.position.x, -(this.targetEnemy.position.y - this.position.y));
                    if (isNaN(enemyAngle)) return 'N/A';
                    let angleDiff = enemyAngle - this.angle;
                    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                    return `${(Math.abs(angleDiff) * 180 / Math.PI).toFixed(1)}°`;
                })() : 
                'N/A',
            inFireCone: this.targetEnemy && !isNaN(this.angle) && this.fireConeAngle ? 
                (() => {
                    const enemyAngle = Math.atan2(this.targetEnemy.position.x - this.position.x, -(this.targetEnemy.position.y - this.position.y));
                    if (isNaN(enemyAngle)) return false;
                    let angleDiff = enemyAngle - this.angle;
                    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                    const isInCone = Math.abs(angleDiff) <= this.fireConeAngle;
                    // DEBUG: Log del cálculo para diagnosticar
                    if (CONFIG.DEBUG.FLEET_INFO) {
                        console.log(`🔍 DEBUG CONO: enemyAngle=${(enemyAngle*180/Math.PI).toFixed(1)}°, shipAngle=${(this.angle*180/Math.PI).toFixed(1)}°, diff=${(Math.abs(angleDiff)*180/Math.PI).toFixed(1)}°, coneLimit=${(this.fireConeAngle*180/Math.PI).toFixed(1)}°, inCone=${isInCone}`);
                    }
                    return isInCone;
                })() : 
                false,
            fireCooldown: this.fireCooldown.toFixed(2),
            canFire: this.fireCooldown <= 0 && this.targetEnemy !== null
        };
    }
} 