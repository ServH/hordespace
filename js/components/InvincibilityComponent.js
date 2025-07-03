import Component from './Component.js';

export default class InvincibilityComponent extends Component {
    constructor(duration) {
        super();
        this.duration = duration;
        this.timer = duration;
    }
} 