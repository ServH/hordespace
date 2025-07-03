import Component from './Component.js';

export default class RenderComponent extends Component {
    constructor(visualType, radius, glowMultiplier = 1) {
        super();
        this.visualType = visualType; // ej: 'laser', 'orb', 'player_ship'
        this.radius = radius;
        this.glowRadiusMultiplier = glowMultiplier;
    }
} 