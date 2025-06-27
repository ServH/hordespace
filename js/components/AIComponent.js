import Component from './Component.js';

export default class AIComponent extends Component {
    constructor(targetingRange) {
        super();
        this.state = 'seeking';
        this.targetId = null;
        this.targetingRange = targetingRange;
    }
} 