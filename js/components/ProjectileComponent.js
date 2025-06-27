import Component from './Component.js';

export default class ProjectileComponent extends Component {
    constructor(ownerId, ownerGroup, projectileTypeId) { // ownerGroup: 'player', 'ally', 'enemy'
        super();
        this.ownerId = ownerId;
        this.ownerGroup = ownerGroup;
        this.projectileTypeId = projectileTypeId; // Almacenar el tipo de proyectil
    }
} 