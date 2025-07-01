import Component from './Component.js';

export default class EffectComponent extends Component {
    constructor(type = 'pulse', duration = 0.5) {
        super();
        this.type = type;
        this.duration = duration;
        this.timer = 0;
    }
} 