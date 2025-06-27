import System from './System.js';
import LifetimeComponent from '../components/LifetimeComponent.js';

export default class LifetimeSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(LifetimeComponent);
        for (const entityId of entities) {
            const lifetime = this.entityManager.getComponent(entityId, LifetimeComponent);
            lifetime.timer += deltaTime;
            if (lifetime.timer >= lifetime.maxLife) {
                this.entityManager.destroyEntity(entityId);
            }
        }
    }
} 