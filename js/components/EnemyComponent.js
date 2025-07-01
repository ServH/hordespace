import Component from './Component.js';

export default class EnemyComponent extends Component {
    constructor(typeId = 'default') {
        super();
        this.typeId = typeId; // Identificador del tipo de enemigo
    }
} 