import Component from './Component.js';

/**
 * Componente que guarda información sobre qué bonos de formación están activos.
 * Ahora es más inteligente y puede gestionar múltiples bonos simultáneos.
 */
export default class InFormationBonusActiveComponent extends Component {
    constructor() {
        super();
        // Usaremos un Set para guardar los IDs de los bonos activos (ej. 'REPAIR', 'FIRE_RATE')
        this.activeBonuses = new Set();
    }
} 