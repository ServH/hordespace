import Component from './Component.js';

export default class DashComponent extends Component {
    constructor(duration) {
        super();
        // Guardamos cuánto tiempo MÁS debe durar el efecto del dash.
        this.duration = duration;
    }
} 