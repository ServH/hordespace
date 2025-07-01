import Component from './Component.js';

export default class AbilitiesComponent extends Component {
    constructor() {
        super();
        // Guardamos el tiempo restante del cooldown para cada habilidad.
        this.cooldowns = {
            dash: 0
            // En el futuro podríamos añadir: 'bomba: 0', 'misil: 0', etc.
        };
    }
} 