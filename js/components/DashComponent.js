import Component from './Component.js';

export default class DashComponent extends Component {
    constructor(duration, direction) {
        super();
        // Guardamos cuánto tiempo MÁS debe durar el efecto del dash.
        this.duration = duration;
        // Guardamos la dirección del dash como un vector normalizado
        this.direction = direction; // ej: { x: 1, y: 0 } para la derecha
    }
} 