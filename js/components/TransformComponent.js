import Component from './Component.js';

/**
 * Almacena datos de posición, rotación, y movimiento de una entidad.
 */
export default class TransformComponent extends Component {
    constructor(x = 0, y = 0, angle = 0) {
        super();
        this.position = { x: x, y: y };
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.angle = angle;
        this.rotationSpeed = 0;
    }
} 