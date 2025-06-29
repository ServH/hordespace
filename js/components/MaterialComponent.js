import Component from './Component.js';

export default class MaterialComponent extends Component {
    constructor(value = 1) {
        super();
        this.value = value;
        this.originalValue = value; // Para efectos de multiplicadores
    }
    
    /**
     * Aplica un multiplicador al valor del material
     * @param {number} multiplier - Multiplicador a aplicar
     */
    applyMultiplier(multiplier) {
        this.value = Math.floor(this.originalValue * multiplier);
    }
    
    /**
     * Restaura el valor original del material
     */
    resetValue() {
        this.value = this.originalValue;
    }
} 