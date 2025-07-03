import Component from './Component.js';

export default class HealthComponent extends Component {
    constructor(hp, maxHp = null, healthRegen = 0) {
        super();
        this.hp = hp;
        this.maxHp = maxHp === null ? hp : maxHp;
        this.healthRegen = healthRegen;
    }
} 