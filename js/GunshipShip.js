/**
 * Space Horde Survivor - Clase GunshipShip
 * Nave aliada especializada en combate: resistente, letal pero lenta
 * Hereda de AllyShip y sobrescribe propiedades y renderizado
 */

class GunshipShip extends AllyShip {
    /**
     * Constructor del Gunship
     * @param {number} x - Posición inicial X
     * @param {number} y - Posición inicial Y 
     * @param {Game} gameInstance - Referencia al objeto Game principal
     */
    constructor(x, y, gameInstance) {
        // Llamar al constructor padre con valores específicos de Gunship
        super(x, y, gameInstance);
        
        // Sobrescribir propiedades con valores específicos de CONFIG
        this.radius = CONFIG.ALLY_GUNSHIP_RADIUS;
        this.maxHp = CONFIG.ALLY_GUNSHIP_HP;
        this.hp = CONFIG.ALLY_GUNSHIP_HP;
        this.maxSpeed = CONFIG.ALLY_GUNSHIP_SPEED;
        this.thrustPower = CONFIG.ALLY_GUNSHIP_ACCELERATION; // Capacidad de aceleración, no sobrescribir this.acceleration
        this.friction = CONFIG.ALLY_GUNSHIP_FRICTION;
        this.rotationSpeed = CONFIG.ALLY_GUNSHIP_ROTATION_SPEED;
        this.damage = CONFIG.ALLY_GUNSHIP_DAMAGE;
        this.fireRate = CONFIG.ALLY_GUNSHIP_FIRE_RATE;
        this.aiTargetingRange = CONFIG.ALLY_GUNSHIP_AI_TARGETING_RANGE;
        
        // Propiedades específicas de Gunship
        this.type = 'gunship';
        this.color = CONFIG.ALLY_GUNSHIP_COLOR;
        
        console.log(`🔫 GunshipShip creado en (${x.toFixed(1)}, ${y.toFixed(1)}) - HP: ${this.hp}, Daño: ${this.damage}`);
    }
    
    /**
     * Renderiza el Gunship con forma triangular distintiva (más ancha y robusta)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Trasladar al centro de la nave
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según el ángulo de la nave
        ctx.rotate(this.angle);
        
        // === DIBUJAR GUNSHIP: TRIÁNGULO ANCHO Y ROBUSTO ===
        
        // Configurar estilo
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2; // Línea más gruesa para aspecto robusto
        
        // Dibujar triángulo gunship (más ancho y robusto que el default)
        ctx.beginPath();
        
        // Punta delantera (menos puntiaguda, más robusta)
        ctx.moveTo(0, -this.radius * 1.2);
        
        // Esquinas traseras más anchas
        ctx.lineTo(-this.radius * 0.9, this.radius * 0.7);
        
        // Base trasera más ancha y plana
        ctx.lineTo(-this.radius * 0.5, this.radius * 0.9);
        ctx.lineTo(this.radius * 0.5, this.radius * 0.9);
        
        // Esquina trasera derecha
        ctx.lineTo(this.radius * 0.9, this.radius * 0.7);
        
        // Cerrar en la punta
        ctx.closePath();
        
        // Rellenar y contornear
        ctx.fill();
        ctx.stroke();
        
        // === DETALLES ESPECÍFICOS DE GUNSHIP ===
        
        // Cañones laterales
        ctx.fillStyle = '#FFAA00';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        // Cañón izquierdo
        ctx.beginPath();
        ctx.rect(-this.radius * 0.7, -this.radius * 0.5, this.radius * 0.2, this.radius * 0.8);
        ctx.fill();
        ctx.stroke();
        
        // Cañón derecho
        ctx.beginPath();
        ctx.rect(this.radius * 0.5, -this.radius * 0.5, this.radius * 0.2, this.radius * 0.8);
        ctx.fill();
        ctx.stroke();
        
        // Línea central reforzada (blindaje)
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius * 1.0);
        ctx.lineTo(0, this.radius * 0.5);
        ctx.stroke();
        
        // Puntos de armamento (detalles)
        ctx.fillStyle = '#FFCC00';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.6, -this.radius * 0.1, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius * 0.6, -this.radius * 0.1, 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Reactor trasero (más potente)
        ctx.fillStyle = '#FF4400';
        ctx.beginPath();
        ctx.arc(0, this.radius * 0.8, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // Renderizar barra de vida si está dañado
        this.renderHealthBar(ctx);
    }
}

console.log("✅ GunshipShip.js cargado correctamente"); 