import Component from './Component.js';

export default class PhysicsComponent extends Component {
    constructor(maxSpeed, friction) {
        super();
        this.maxSpeed = maxSpeed;
        this.friction = friction;
    }
} 