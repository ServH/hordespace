import Component from './Component.js';

export default class WeaponComponent extends Component {
    constructor(fireRate, projectileTypeId) {
        super();
        this.fireRate = fireRate;
        this.fireCooldown = 0;
        this.projectileTypeId = projectileTypeId;
        this.isFiring = true; // Para auto-fire, podría cambiar
        this.bonusPierce = 0; // Puntos de perforación adicionales acumulados
    }
} 