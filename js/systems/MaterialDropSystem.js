import System from './System.js';

export default class MaterialDropSystem extends System {
    constructor(entityManager, eventBus, materialPool) {
        super(entityManager, eventBus);
        this.materialPool = materialPool;
        this.eventBus.subscribe('enemy:destroyed', this.onEnemyDestroyed.bind(this));
    }

    onEnemyDestroyed(data) {
        if (Math.random() < CONFIG.MATERIAL.DROP_CHANCE) {
            const material = this.materialPool.get();
            if (material) {
                // Usamos la posición del enemigo que viene en el evento
                material.activate(data.position.x, data.position.y, CONFIG.MATERIAL.BASE_VALUE);
                console.log(`💰 Material soltado en (${data.position.x.toFixed(1)}, ${data.position.y.toFixed(1)})`);
            }
        }
    }

    update(deltaTime) {
        // Este sistema es reactivo a eventos, no necesita update.
    }
} 