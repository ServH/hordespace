import Component from './Component.js';

export default class ThrusterComponent extends Component {
    constructor({
        emitRate = 60,
        // MODIFICACIÓN: offset ahora es un array de puntos
        offsets = [{ x: 0, y: 15 }],
        trailType = 'default' // NUEVO: Enlaza a una config en CONFIG.js
    } = {}) {
        super();
        this.emitRate = emitRate;
        this.offsets = offsets; // CAMBIADO: ahora es un array
        this.trailType = trailType;
        this.emitCooldown = 0;
    }
} 