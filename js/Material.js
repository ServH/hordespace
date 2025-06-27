/**
 * Material - Cristales de recursos que dropean los enemigos
 * Optimizada para Object Pooling y recolección automática
 */

export default class Material {
    constructor(config) {
        this.config = config;
        
        // Estado del Object Pool
        this.active = false;
        
        // Propiedades físicas
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.radius = 8;  // Radio visual y de colisión
        this.value = 1;   // Cantidad de materiales que otorga
        
        // Efectos visuales
        this.spinAngle = 0;
        this.spinSpeed = 3; // radianes por segundo
        this.color = '#FFD700'; // Dorado
        this.glowIntensity = 0;
        this.glowDirection = 1; // 1 o -1 para efecto pulsante
        
        // Física simple
        this.friction = 0.95;
        this.lifetime = 0;
        this.maxLifetime = 30; // Segundos antes de desaparecer automáticamente
    }
    
    /**
     * Activa el material cuando es droppeado por un enemigo
     */
    activate(x, y, value = 1, initialVelocity = { x: 0, y: 0 }) {
        this.active = true;
        this.position.x = x;
        this.position.y = y;
        this.value = value;
        
        // Pequeño impulso inicial simulando la expulsión del enemigo
        this.velocity.x = initialVelocity.x || (Math.random() - 0.5) * 100;
        this.velocity.y = initialVelocity.y || (Math.random() - 0.5) * 100;
        
        // Reiniciar efectos visuales
        this.spinAngle = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
        this.lifetime = 0;
    }
    
    /**
     * Desactiva el material para reutilización en el pool
     */
    deactivate() {
        this.active = false;
        this.position.x = -1000;
        this.position.y = -1000;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
    
    /**
     * Limpieza para el Object Pool
     */
    cleanup() {
        this.deactivate();
    }
    
    /**
     * Actualiza la física y efectos visuales del material
     */
    update(deltaTime) {
        if (!this.active) return;
        
        // Actualizar lifetime
        this.lifetime += deltaTime;
        if (this.lifetime > this.maxLifetime) {
            this.deactivate();
            return;
        }
        
        // Física simple - aplicar velocidad y fricción
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        // Efectos visuales
        this.spinAngle += this.spinSpeed * deltaTime;
        if (this.spinAngle > Math.PI * 2) {
            this.spinAngle -= Math.PI * 2;
        }
        
        // Efecto de brillo pulsante
        this.glowIntensity += this.glowDirection * deltaTime * 2;
        if (this.glowIntensity > 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity < 0) {
            this.glowIntensity = 0;
            this.glowDirection = 1;
        }
    }
    
    /**
     * Renderiza el material con efectos visuales
     */
    render(ctx) {
        if (!this.active) return;
        
        ctx.save();
        
        // Trasladar al centro del material
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar para el efecto de giro
        ctx.rotate(this.spinAngle);
        
        // Efecto de brillo exterior
        const glowRadius = this.radius + (this.glowIntensity * 5);
        const gradient = ctx.createRadialGradient(0, 0, this.radius, 0, 0, glowRadius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color + '80'); // Semi-transparente
        gradient.addColorStop(1, this.color + '00');   // Totalmente transparente
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Cristal principal (forma de diamante)
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);      // Arriba
        ctx.lineTo(this.radius, 0);       // Derecha
        ctx.lineTo(0, this.radius);       // Abajo
        ctx.lineTo(-this.radius, 0);      // Izquierda
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        // Brillos internos
        ctx.fillStyle = '#FFFF80';
        ctx.beginPath();
        ctx.moveTo(0, -this.radius * 0.5);
        ctx.lineTo(this.radius * 0.3, -this.radius * 0.2);
        ctx.lineTo(0, this.radius * 0.2);
        ctx.lineTo(-this.radius * 0.3, -this.radius * 0.2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Verifica si está dentro del radio de recolección del jugador
     */
    isInCollectionRange(playerPosition, collectionRadius) {
        if (!this.active) return false;
        
        const dx = this.position.x - playerPosition.x;
        const dy = this.position.y - playerPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= collectionRadius;
    }
} 