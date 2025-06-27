import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';

export default class ProjectileMovementSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(TransformComponent, ProjectileComponent);
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Actualizar posición
            transform.position.x += transform.velocity.x * deltaTime;
            transform.position.y += transform.velocity.y * deltaTime;
            
            // Verificar límites
            this.checkBounds(entityId, transform);
        }
    }

    checkBounds(entityId, transform) {
        const margin = CONFIG.PROJECTILE.BOUNDS_MARGIN;
        if (transform.position.x < -margin || transform.position.x > CONFIG.CANVAS.WIDTH + margin ||
            transform.position.y < -margin || transform.position.y > CONFIG.CANVAS.HEIGHT + margin) {
            this.entityManager.destroyEntity(entityId);
        }
    }
} 