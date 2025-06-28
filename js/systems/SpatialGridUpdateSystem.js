import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';

export default class SpatialGridUpdateSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.previousPositions = new Map();
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(TransformComponent);
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const oldPos = this.previousPositions.get(entityId) || { ...transform.position };

            this.entityManager.spatialGrid.update(
                entityId,
                oldPos.x, oldPos.y,
                transform.position.x, transform.position.y
            );

            this.previousPositions.set(entityId, { ...transform.position });
        }
    }
} 