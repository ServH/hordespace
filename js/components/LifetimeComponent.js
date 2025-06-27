import Component from './Component.js';

export default class LifetimeComponent extends Component {
    constructor(maxLife) {
        super();
        this.timer = 0;
        this.maxLife = maxLife;
    }
} 