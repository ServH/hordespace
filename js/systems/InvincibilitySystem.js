import System from './System.js';
import InvincibilityComponent from '../components/InvincibilityComponent.js';

export default class InvincibilitySystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(InvincibilityComponent);

        for (const entityId of entities) {
            const invincibility = this.entityManager.getComponent(entityId, InvincibilityComponent);
            invincibility.timer -= deltaTime;

            if (invincibility.timer <= 0) {
                this.entityManager.removeComponent(entityId, InvincibilityComponent);
            }
        }
    }
} 