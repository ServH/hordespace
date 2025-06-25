/**
 * Space Horde Survivor - Clase ScoutShip
 * Nave aliada especializada en exploración: rápida, ágil pero frágil
 * Hereda de AllyShip y sobrescribe propiedades y renderizado
 */

class ScoutShip extends AllyShip {
    /**
     * Constructor del Scout Ship
     * @param {number} x - Posición inicial X
     * @param {number} y - Posición inicial Y 
     * @param {Game} gameInstance - Referencia al objeto Game principal
     */
    constructor(x, y, gameInstance) {
        // Llamar al constructor padre con valores específicos de Scout
        super(x, y, gameInstance);
        
        // Sobrescribir propiedades con valores específicos de CONFIG
        this.radius = CONFIG.ALLY_SCOUT_RADIUS;
        this.maxHp = CONFIG.ALLY_SCOUT_HP;
        this.hp = CONFIG.ALLY_SCOUT_HP;
        this.maxSpeed = CONFIG.ALLY_SCOUT_SPEED;
        this.acceleration = CONFIG.ALLY_SCOUT_ACCELERATION;
        this.friction = CONFIG.ALLY_SCOUT_FRICTION;
        this.rotationSpeed = CONFIG.ALLY_SCOUT_ROTATION_SPEED;
        this.damage = CONFIG.ALLY_SCOUT_DAMAGE;
        this.fireRate = CONFIG.ALLY_SCOUT_FIRE_RATE;
        this.aiTargetingRange = CONFIG.ALLY_SCOUT_AI_TARGETING_RANGE;
        
        // Propiedades específicas de Scout
        this.type = 'scout';
        this.color = CONFIG.ALLY_SCOUT_COLOR;
        
        console.log(`🔍 ScoutShip creado en (${x.toFixed(1)}, ${y.toFixed(1)}) - HP: ${this.hp}, Velocidad: ${this.maxSpeed}`);
    }
    
    /**
     * Renderiza el Scout Ship con forma triangular distintiva (más pequeña y puntiaguda)
     * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
     */
    render(ctx) {
        if (!this.isAlive) return;
        
        ctx.save();
        
        // Trasladar al centro de la nave
        ctx.translate(this.position.x, this.position.y);
        
        // Rotar según el ángulo de la nave
        ctx.rotate(this.angle);
        
        // === DIBUJAR SCOUT SHIP: TRIÁNGULO DELGADO Y PUNTIAGUDO ===
        
        // Configurar estilo
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        
        // Dibujar triángulo scout (más delgado y puntiagudo que el default)
        ctx.beginPath();
        
        // Punta delantera (más puntiaguda)
        ctx.moveTo(0, -this.radius * 1.4);
        
        // Esquina trasera izquierda (más estrecha)
        ctx.lineTo(-this.radius * 0.6, this.radius * 0.8);
        
        // Base trasera (más pequeña)
        ctx.lineTo(-this.radius * 0.3, this.radius * 0.5);
        ctx.lineTo(this.radius * 0.3, this.radius * 0.5);
        
        // Esquina trasera derecha (más estrecha)
        ctx.lineTo(this.radius * 0.6, this.radius * 0.8);
        
        // Cerrar en la punta
        ctx.closePath();
        
        // Rellenar y contornear
        ctx.fill();
        ctx.stroke();
        
        // === DETALLES ESPECÍFICOS DE SCOUT ===
        
        // Línea central (sensor de exploración)
        ctx.strokeStyle = '#AAFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius * 1.2);
        ctx.lineTo(0, this.radius * 0.3);
        ctx.stroke();
        
        // Pequeños sensores laterales
        ctx.fillStyle = '#AAFFFF';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.4, -this.radius * 0.3, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.radius * 0.4, -this.radius * 0.3, 1, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
        
        // Renderizar barra de vida si está dañado
        this.renderHealthBar(ctx);
    }
}

console.log("✅ ScoutShip.js cargado correctamente"); 