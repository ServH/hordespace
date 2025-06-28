import Component from './Component.js';

export default class ThrusterComponent extends Component {
    constructor({
        // Cuántas partículas emitir por segundo
        emitRate = 30, 
        // Tiempo que vive cada partícula
        particleLifetime = 0.8, 
        // Color inicial de la partícula
        particleColor = '#00FFFF', 
        // Posición del propulsor relativa al centro de la nave
        offset = { x: 0, y: 15 } // Por defecto, sale de la "cola" de la nave
    } = {}) {
        super();
        this.emitRate = emitRate;
        this.particleLifetime = particleLifetime;
        this.particleColor = particleColor;
        this.offset = offset;
        
        // Control interno para la frecuencia de emisión
        this.emitCooldown = 0;
    }
} 