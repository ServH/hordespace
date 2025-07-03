import Component from './Component.js';

export default class CollectibleComponent extends Component {
    constructor(collectionRadius) {
        super();
        this.collectionRadius = collectionRadius;
        this.isAttracted = false;
        this.attractionStartTime = 0; // Para animar la intensidad
    }

    // Nuevo método para activar la atracción
    activateAttraction(currentTime) {
        if (!this.isAttracted) {
            this.isAttracted = true;
            this.attractionStartTime = currentTime;
        }
    }

    // Nuevo método para obtener la intensidad (0 a 1)
    getAttractionIntensity(currentTime) {
        if (!this.isAttracted) return 0;
        const timeSinceAttracted = currentTime - this.attractionStartTime;
        // La intensidad aumenta rápidamente al principio (en 0.5s)
        return Math.min(1.0, timeSinceAttracted / 0.5);
    }
} 