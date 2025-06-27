import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';

export default class BoundsSystem extends System {
    update(deltaTime) {
        // Este sistema se aplicará a cualquier entidad que pueda colisionar
        const entities = this.entityManager.getEntitiesWith(TransformComponent, CollisionComponent);
        const bounds = { minX: 0, maxX: CONFIG.CANVAS.WIDTH, minY: 0, maxY: CONFIG.CANVAS.HEIGHT };

        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const isProjectile = this.entityManager.hasComponent(entityId, ProjectileComponent);
            
            // Si es un proyectil, lo destruimos al salir de los límites
            if (isProjectile) {
                if (transform.position.x < bounds.minX || transform.position.x > bounds.maxX ||
                    transform.position.y < bounds.minY || transform.position.y > bounds.maxY) {
                    this.entityManager.destroyEntity(entityId);
                }
                continue; // No procesar más para este proyectil
            }

            // Si no es un proyectil, aplicamos la lógica de rebote
            const collision = this.entityManager.getComponent(entityId, CollisionComponent);
            const radius = collision.radius;
            
            if (transform.position.x - radius < bounds.minX) {
                transform.position.x = bounds.minX + radius;
                transform.velocity.x *= -0.5;
            }
            if (transform.position.x + radius > bounds.maxX) {
                transform.position.x = bounds.maxX - radius;
                transform.velocity.x *= -0.5;
            }
            if (transform.position.y - radius < bounds.minY) {
                transform.position.y = bounds.minY + radius;
                transform.velocity.y *= -0.5;
            }
            if (transform.position.y + radius > bounds.maxY) {
                transform.position.y = bounds.maxY - radius;
                transform.velocity.y *= -0.5;
            }
        }
    }
} 