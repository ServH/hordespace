/**
 * Space Horde Survivor - Clase Base Ship
 * Clase abstracta base para todas las entidades de combate (Comandante, Aliados, Enemigos)
 */

export default class Ship {
    constructor(x, y, radius, hp, maxSpeed, acceleration, friction, rotationSpeed) {
        // Posición y movimiento
        this.position = { x: x, y: y };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        
        // Propiedades físicas
        this.maxSpeed = maxSpeed;
        this.friction = friction;
        this.radius = radius;
        
        // Propiedades de combate
        this.hp = hp;
        this.maxHp = hp;
        this.isAlive = true;
        
        // Orientación
        this.angle = 0; // radianes, 0 = apuntando hacia arriba
        this.rotationSpeed = rotationSpeed;
        
        // Propiedades de renderizado
        this.color = '#FFFFFF';
        this.thrustColor = '#00FFFF';
        
        console.log(`🚢 Ship creada en (${x}, ${y}) con HP: ${hp}`);
    }
    
    /**
     * Actualiza la lógica de la nave (movimiento, física)
     * @param {number} deltaTime - Tiempo transcurrido en segundos
     */
    update(deltaTime) {
        // Aplicar aceleración a velocidad
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Aplicar fricción
        this.velocity.x *= Math.pow(this.friction, deltaTime);
        this.velocity.y *= Math.pow(this.friction, deltaTime);
        
        // Limitar velocidad máxima
        const currentSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (currentSpeed > this.maxSpeed) {
            const ratio = this.maxSpeed / currentSpeed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
        
        // Actualizar posición
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        // Resetear aceleración para el próximo frame
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    }
    
    /**
     * Renderiza la nave (método base, debe ser sobrescrito)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Trasladar al centro de la nave
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según el ángulo de la nave
        ctx.rotate(this.angle);
        
        // Dibujar forma básica (círculo) - las subclases deben sobrescribir esto
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Aplica una fuerza a la nave
     * @param {number} forceX - Fuerza en X
     * @param {number} forceY - Fuerza en Y
     */
    applyForce(forceX, forceY) {
        this.acceleration.x += forceX;
        this.acceleration.y += forceY;
    }
    
    /**
     * Aplica una fuerza en la dirección que apunta la nave
     * @param {number} force - Magnitud de la fuerza
     */
    applyThrustForce(force) {
        // Calcular componentes de la fuerza basado en el ángulo
        // angle = 0 apunta hacia arriba, por eso usamos -cos para Y
        const forceX = Math.sin(this.angle) * force;
        const forceY = -Math.cos(this.angle) * force;
        
        this.applyForce(forceX, forceY);
    }
    
    /**
     * Rota la nave
     * @param {number} rotationAmount - Cantidad de rotación en radianes
     */
    rotate(rotationAmount) {
        this.angle += rotationAmount;
        
        // Normalizar ángulo entre 0 y 2π
        while (this.angle < 0) this.angle += Math.PI * 2;
        while (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
    }
    
    /**
     * Recibe daño
     * @param {number} amount - Cantidad de daño
     * @returns {boolean} - true si la nave fue destruida
     */
    takeDamage(amount) {
        if (!this.isAlive) return false;
        
        this.hp -= amount;
        
        if (this.hp <= 0) {
            this.hp = 0;
            this.isAlive = false;
            this.onDestroy();
            return true; // ¡Nave destruida!
        }
        
        return false; // Nave dañada pero no destruida
    }
    
    /**
     * Método llamado cuando la nave es destruida
     */
    onDestroy() {
        console.log(`💥 Ship destruida en (${this.position.x.toFixed(1)}, ${this.position.y.toFixed(1)})`);
    }
    
    /**
     * Verifica colisión circular con otra nave
     * @param {Ship} otherShip - Otra nave para verificar colisión
     * @returns {boolean} - true si hay colisión
     */
    isColliding(otherShip) {
        if (!this.isAlive || !otherShip.isAlive) return false;
        
        const dx = this.position.x - otherShip.position.x;
        const dy = this.position.y - otherShip.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (this.radius + otherShip.radius);
    }
    
    /**
     * Obtiene los límites de colisión de la nave
     * @returns {Object} - Objeto con x, y, radius
     */
    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            radius: this.radius
        };
    }
    
    /**
     * Mantiene la nave dentro de los límites especificados
     * @param {number} minX - Límite izquierdo
     * @param {number} maxX - Límite derecho
     * @param {number} minY - Límite superior
     * @param {number} maxY - Límite inferior
     */
    keepInBounds(minX, maxX, minY, maxY) {
        // Mantener dentro de los límites con el radio en cuenta
        if (this.position.x - this.radius < minX) {
            this.position.x = minX + this.radius;
            this.velocity.x = Math.abs(this.velocity.x) * 0.5; // Rebote suave
        }
        if (this.position.x + this.radius > maxX) {
            this.position.x = maxX - this.radius;
            this.velocity.x = -Math.abs(this.velocity.x) * 0.5; // Rebote suave
        }
        if (this.position.y - this.radius < minY) {
            this.position.y = minY + this.radius;
            this.velocity.y = Math.abs(this.velocity.y) * 0.5; // Rebote suave
        }
        if (this.position.y + this.radius > maxY) {
            this.position.y = maxY - this.radius;
            this.velocity.y = -Math.abs(this.velocity.y) * 0.5; // Rebote suave
        }
    }
    
    /**
     * Obtiene la velocidad actual como escalar
     * @returns {number} - Velocidad actual
     */
    getCurrentSpeed() {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }
    
    /**
     * Verifica si la nave se está moviendo
     * @param {number} threshold - Umbral mínimo de velocidad
     * @returns {boolean} - true si se está moviendo
     */
    isMoving(threshold = 10) {
        return this.getCurrentSpeed() > threshold;
    }
    
    /**
     * Renderiza la barra de vida si la nave está dañada
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    renderHealthBar(ctx) {
        // Solo mostrar si está dañado
        if (!this.isAlive || this.hp >= this.maxHp) return;
        
        ctx.save();
        
        // Posición de la barra de vida (encima de la nave)
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = this.position.y - this.radius - 10;
        
        // Fondo de la barra (rojo)
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.position.x - barWidth/2, barY, barWidth, barHeight);
        
        // Barra de vida actual (verde)
        const healthPercentage = this.hp / this.maxHp;
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.position.x - barWidth/2, barY, barWidth * healthPercentage, barHeight);
        
        // Contorno de la barra
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.position.x - barWidth/2, barY, barWidth, barHeight);
        
        ctx.restore();
    }
}

console.log("✅ Ship.js cargado correctamente"); 