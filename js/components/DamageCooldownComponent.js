import Component from './Component.js';

export default class DamageCooldownComponent extends Component {
    constructor() {
        super();
        this.cooldowns = new Map(); // Map<string, number>
    }
} 