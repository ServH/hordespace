import Component from './Component.js';

export default class AIComponent extends Component {
    constructor(targetingRange) {
        super();
        this.state = 'FORMATION';  // Estado inicial: seguir formación
        this.targetId = null;
        this.targetingRange = targetingRange;
        this.rotationSpeed = 1.5;  // Velocidad de rotación por defecto
    }
} 