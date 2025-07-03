import Component from './Component.js';

export default class FormationFollowerComponent extends Component {
    constructor(leaderId) {
        super();
        this.leaderId = leaderId; // ID de la entidad a seguir (el jugador)
        this.targetOffset = { x: 0, y: 0 }; // Será calculado por el FleetSystem
        this.followStrength = CONFIG.FORMATION.BEHAVIOR.FOLLOW_STRENGTH;
        this.maxCorrectionForce = CONFIG.FORMATION.BEHAVIOR.MAX_CORRECTION_FORCE;
        this.correctionThreshold = CONFIG.FORMATION.BEHAVIOR.CORRECTION_THRESHOLD;
    }
} 