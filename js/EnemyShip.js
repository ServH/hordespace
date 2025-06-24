/**
 * Space Horde Survivor - Clase EnemyShip
 * Enemigos básicos con IA de persecución
 */

class EnemyShip extends Ship {
    constructor(x, y, target) {
        // Inicializar con valores de configuración para enemigos básicos
        super(
            x, y, 
            CONFIG.ENEMY_BASE_RADIUS,
            CONFIG.ENEMY_BASE_HP,
            CONFIG.ENEMY_BASE_SPEED,
            CONFIG.ENEMY_BASE_ACCELERATION,
            CONFIG.ENEMY_BASE_FRICTION,
            CONFIG.ENEMY_BASE_ROTATION_SPEED
        );
        
        // Propiedades específicas del enemigo
        this.target = target; // Referencia al PlayerShip
        this.type = 'basic';
        this.baseSpeed = CONFIG.ENEMY_BASE_SPEED;
        this.aggroRange = 500; // Rango de detección del jugador (aumentado)
        this.attackRange = 30; // Rango de ataque cuerpo a cuerpo
        this.lastDamageTime = 0;
        this.damageFlashDuration = 0.1; // Duración del flash al recibir daño
        
        // Propiedades de comportamiento IA
        this.aiState = 'seeking'; // 'seeking', 'attacking', 'fleeing'
        this.aiTimer = 0;
        this.stateChangeInterval = 2; // Cambiar estado cada 2 segundos
        
        // Propiedades visuales
        this.color = '#FF4444';
        this.originalColor = '#FF4444';
        this.damageColor = '#FFFFFF';
        this.size = this.radius;
        
        // Estadísticas
        this.damageDealt = 0;
        this.distanceTraveled = 0;
        this.timeAlive = 0;
        
        console.log(`👾 EnemyShip creado en (${x.toFixed(1)}, ${y.toFixed(1)})`);
    }
    
    /**
     * Actualiza el enemigo
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        if (!this.isAlive) return;
        
        // Actualizar estadísticas
        this.timeAlive += deltaTime;
        this.aiTimer += deltaTime;
        
        // Actualizar comportamiento IA (esto modifica velocity)
        this.updateAI(deltaTime);
        
        // Actualizar posición basada en velocity (física simple)
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Actualizar efectos visuales
        this.updateVisualEffects(deltaTime);
        
        // Verificar límites (opcional: hacer que reboten o se destruyan)
        this.checkBounds();
    }
    
    /**
     * Actualiza la inteligencia artificial del enemigo
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    updateAI(deltaTime) {
        if (!this.target || !this.target.isAlive) return;
        
        // Calcular distancia al objetivo
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // Determinar estado IA basado en distancia
        if (distanceToTarget <= this.attackRange) {
            this.aiState = 'attacking';
        } else if (distanceToTarget <= this.aggroRange) {
            this.aiState = 'seeking';
        } else {
            this.aiState = 'idle';
        }
        
        // Debug temporal para verificar IA
        if (Math.random() < 0.01) { // 1% de probabilidad para no spam
            console.log(`👾 Enemigo: distancia=${distanceToTarget.toFixed(1)}, estado=${this.aiState}, vel=(${this.velocity.x.toFixed(1)}, ${this.velocity.y.toFixed(1)})`);
        }
        
        // Ejecutar comportamiento según estado
        switch (this.aiState) {
            case 'seeking':
                this.seekTarget(dx, dy, distanceToTarget, deltaTime);
                break;
            case 'attacking':
                this.attackTarget(dx, dy, distanceToTarget, deltaTime);
                break;
            case 'idle':
                this.idleBehavior(deltaTime);
                break;
        }
    }
    
    /**
     * Comportamiento de búsqueda del objetivo
     * @param {number} dx - Diferencia en X
     * @param {number} dy - Diferencia en Y
     * @param {number} distance - Distancia al objetivo
     * @param {number} deltaTime - Tiempo transcurrido
     */
    seekTarget(dx, dy, distance, deltaTime) {
        // Normalizar vector de dirección
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Aplicar velocidad directa hacia el objetivo (más simple y efectivo)
        const seekSpeed = this.maxSpeed * 0.8; // 80% de velocidad máxima
        this.velocity.x = dirX * seekSpeed;
        this.velocity.y = dirY * seekSpeed;
        
        // Actualizar ángulo para apuntar al objetivo
        this.angle = Math.atan2(dx, -dy);
        
        // Registrar distancia viajada
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        this.distanceTraveled += currentSpeed * deltaTime;
    }
    
    /**
     * Comportamiento de ataque al objetivo
     * @param {number} dx - Diferencia en X
     * @param {number} dy - Diferencia en Y
     * @param {number} distance - Distancia al objetivo
     * @param {number} deltaTime - Tiempo transcurrido
     */
    attackTarget(dx, dy, distance, deltaTime) {
        // Comportamiento agresivo: moverse directamente hacia el objetivo
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Aplicar velocidad máxima hacia el objetivo
        const attackSpeed = this.maxSpeed; // Velocidad máxima en ataque
        this.velocity.x = dirX * attackSpeed;
        this.velocity.y = dirY * attackSpeed;
        
        // Actualizar ángulo
        this.angle = Math.atan2(dx, -dy);
        
        // Verificar colisión con el objetivo para causar daño
        if (this.isColliding(this.target)) {
            this.dealDamageToTarget(deltaTime);
        }
    }
    
    /**
     * Comportamiento inactivo
     * @param {number} deltaTime - Tiempo transcurrido
     */
    idleBehavior(deltaTime) {
        // Reducir velocidad gradualmente
        this.velocity.x *= 0.95;
        this.velocity.y *= 0.95;
        
        // Rotación lenta aleatoria
        if (Math.random() < 0.01) { // 1% de probabilidad cada frame
            this.angle += (Math.random() - 0.5) * 0.1;
        }
    }
    
    /**
     * Causa daño al objetivo si hay colisión
     * @param {number} deltaTime - Tiempo transcurrido
     */
    dealDamageToTarget(deltaTime) {
        const damageInterval = 1; // 1 segundo entre ataques
        
        if (this.timeAlive - this.lastDamageTime >= damageInterval) {
            const damage = CONFIG.ENEMY_BASE_DAMAGE;
            this.target.takeDamage(damage);
            this.lastDamageTime = this.timeAlive;
            this.damageDealt += damage;
            
            console.log(`👾 Enemigo causó ${damage} de daño al jugador`);
        }
    }
    
    /**
     * Actualiza efectos visuales
     * @param {number} deltaTime - Tiempo transcurrido
     */
    updateVisualEffects(deltaTime) {
        // Flash de daño
        const timeSinceDamage = performance.now() / 1000 - this.lastDamageTime;
        if (timeSinceDamage < this.damageFlashDuration) {
            const flashProgress = timeSinceDamage / this.damageFlashDuration;
            this.color = this.interpolateColor(this.damageColor, this.originalColor, flashProgress);
        } else {
            this.color = this.originalColor;
        }
        
        // Pulsación basada en estado IA
        if (this.aiState === 'attacking') {
            const pulse = 0.8 + 0.2 * Math.sin(this.timeAlive * 10);
            this.size = this.radius * pulse;
        } else {
            this.size = this.radius;
        }
    }
    
    /**
     * Interpola entre dos colores
     * @param {string} color1 - Color inicial
     * @param {string} color2 - Color final
     * @param {number} factor - Factor de interpolación (0-1)
     * @returns {string} - Color interpolado
     */
    interpolateColor(color1, color2, factor) {
        // Implementación simple para colores hex
        if (factor >= 1) return color2;
        if (factor <= 0) return color1;
        
        // Para simplicidad, alternar entre colores
        return factor > 0.5 ? color2 : color1;
    }
    
    /**
     * Verifica límites de pantalla
     */
    checkBounds() {
        const margin = 100; // Margen antes de considerar fuera de límites
        
        // Si está muy lejos, teletransportar al lado opuesto (comportamiento wrap-around)
        if (this.position.x < -margin) {
            this.position.x = CONFIG.CANVAS_WIDTH + margin;
        } else if (this.position.x > CONFIG.CANVAS_WIDTH + margin) {
            this.position.x = -margin;
        }
        
        if (this.position.y < -margin) {
            this.position.y = CONFIG.CANVAS_HEIGHT + margin;
        } else if (this.position.y > CONFIG.CANVAS_HEIGHT + margin) {
            this.position.y = -margin;
        }
    }
    
    /**
     * Maneja el daño recibido
     * @param {number} amount - Cantidad de daño
     * @returns {boolean} - true si la nave fue destruida
     */
    takeDamage(amount) {
        const wasDestroyed = super.takeDamage(amount);
        
        if (wasDestroyed) {
            console.log(`👾 EnemyShip destruido después de ${this.timeAlive.toFixed(1)}s`);
            console.log(`   Daño causado: ${this.damageDealt}, Distancia: ${this.distanceTraveled.toFixed(1)}`);
        } else {
            // Registrar tiempo del último daño para efectos visuales
            this.lastDamageTime = performance.now() / 1000;
            console.log(`👾 EnemyShip recibió ${amount} daño, HP restante: ${this.hp}`);
        }
        
        return wasDestroyed;
    }
    
    /**
     * Renderiza el enemigo
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Trasladar al centro de la nave
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según ángulo
        ctx.rotate(this.angle);
        
        // Renderizar nave enemiga
        this.renderShip(ctx);
        
        // Renderizar efectos adicionales
        this.renderEffects(ctx);
        
        ctx.restore();
        
        // Renderizar barra de vida si está dañado
        if (this.hp < this.maxHP) {
            this.renderHealthBar(ctx);
        }
    }
    
    /**
     * Renderiza la nave enemiga
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderShip(ctx) {
        // Cuerpo principal (cuadrado rotado = rombo)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        const size = this.size;
        
        ctx.beginPath();
        ctx.moveTo(0, -size);      // Arriba
        ctx.lineTo(size, 0);       // Derecha
        ctx.lineTo(0, size);       // Abajo
        ctx.lineTo(-size, 0);      // Izquierda
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Núcleo central
        ctx.fillStyle = '#FF8888';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Detalles direccionales
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.5);
        ctx.lineTo(0, -size * 0.8);
        ctx.stroke();
    }
    
    /**
     * Renderiza efectos adicionales
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderEffects(ctx) {
        // Aura de estado IA
        if (this.aiState === 'attacking') {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        } else if (this.aiState === 'seeking') {
            ctx.strokeStyle = '#FFAA00';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Renderiza la barra de vida
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = this.position.y - this.radius - 10;
        
        // Fondo de la barra
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.position.x - barWidth/2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthPercent = this.hp / this.maxHP;
        const healthWidth = barWidth * healthPercent;
        
        // Color basado en porcentaje de vida
        if (healthPercent > 0.6) {
            ctx.fillStyle = '#00FF00';
        } else if (healthPercent > 0.3) {
            ctx.fillStyle = '#FFFF00';
        } else {
            ctx.fillStyle = '#FF0000';
        }
        
        ctx.fillRect(this.position.x - barWidth/2, barY, healthWidth, barHeight);
        
        // Contorno
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.position.x - barWidth/2, barY, barWidth, barHeight);
    }
    
    /**
     * Obtiene información de debug del enemigo
     * @returns {Object} - Información de debug
     */
    getDebugInfo() {
        return {
            type: this.type,
            position: `(${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`,
            hp: `${this.hp}/${this.maxHP}`,
            aiState: this.aiState,
            timeAlive: this.timeAlive.toFixed(1) + 's',
            damageDealt: this.damageDealt,
            distanceTraveled: this.distanceTraveled.toFixed(1),
            targetDistance: this.target ? 
                Math.sqrt(
                    Math.pow(this.target.position.x - this.position.x, 2) + 
                    Math.pow(this.target.position.y - this.position.y, 2)
                ).toFixed(1) : 'N/A'
        };
    }
}

console.log("✅ EnemyShip.js cargado correctamente"); 