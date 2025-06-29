import Component from './Component.js';

export default class ProjectileComponent extends Component {
    constructor(ownerId, ownerGroup, projectileTypeId) { // ownerGroup: 'player', 'ally', 'enemy'
        super();
        this.ownerId = ownerId;
        this.ownerGroup = ownerGroup;
        this.projectileTypeId = projectileTypeId; // Almacenar el tipo de proyectil
        this.pierceCount = 0; // Cuántos enemigos más puede atravesar este proyectil
        this.bouncesRemaining = 0; // Cuántos rebotes le quedan a este proyectil
        this.hitTargets = new Set(); // Guarda los enemigos ya golpeados para evitar bucles infinitos
    }
} 