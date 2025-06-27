import Component from './Component.js';

export default class ProjectileComponent extends Component {
    constructor(ownerId, ownerGroup) { // ownerGroup: 'player', 'ally', 'enemy'
        super();
        this.ownerId = ownerId;
        this.ownerGroup = ownerGroup;
    }
} 