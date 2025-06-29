import Component from './Component.js';

export default class ThrusterComponent extends Component {
    constructor({
        // Cuántas partículas emitir por segundo
        emitRate = 60, 
        // Posición del propulsor relativa al centro de la nave
        offset = { x: 0, y: 15 },
        trailType = 'default' // NUEVO: Enlaza a una config en CONFIG.js
    } = {}) {
        super();
        this.emitRate = emitRate;
        this.offset = offset;
        this.trailType = trailType; // NUEVO
        
        // Control interno para la frecuencia de emisión
        this.emitCooldown = 0;
    }
} 