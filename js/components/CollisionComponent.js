import Component from './Component.js';

export default class CollisionComponent extends Component {
    constructor(radius, group) { // group: 'player', 'enemy', 'player_projectile', etc.
        super();
        this.radius = radius;
        this.collisionGroup = group;
    }
} 