/**
 * Space Horde Survivor - Clase ScoutShip
 * Nave de exploración rápida, ágil pero frágil
 */

import AllyShip from './AllyShip.js';

export default class ScoutShip extends AllyShip {
    /**
     * Constructor del Scout Ship
     * @param {number} x - Posición inicial X
     * @param {number} y - Posición inicial Y 
     * @param {Game} gameInstance - Referencia al objeto Game principal
     */
    constructor(x, y, gameInstance) {
        // Pasa la config específica a AllyShip
        super(x, y, gameInstance, CONFIG.ALLY.SCOUT);
        
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
        ctx.moveTo(0, -this.radius * 1.2);
        
        // Esquina trasera izquierda (más estrecha)
        ctx.lineTo(-this.radius * 0.5, this.radius * 0.8);
        
        // Base trasera (más pequeña)
        ctx.lineTo(this.radius * 0.5, this.radius * 0.8);
        
        // Cerrar en la punta
        ctx.closePath();
        
        // Rellenar y contornear
        ctx.fill();
        ctx.stroke();
        
        // === DETALLES ESPECÍFICOS DE SCOUT ===
        
        // Línea central (sensor de exploración)
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(0, this.radius * 0.5);
        ctx.stroke();
        
        // Pequeños sensores laterales
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, 0, 1, 0, Math.PI * 2);
        ctx.arc(this.radius * 0.3, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Renderizar barra de vida si está dañado
        this.renderHealthBar(ctx);
    }
}

console.log("✅ ScoutShip.js cargado correctamente"); 