import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';

export default class ProjectileMovementSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(TransformComponent, ProjectileComponent);
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Actualizar posición (Esta es la única lógica que necesitamos aquí)
            transform.position.x += transform.velocity.x * deltaTime;
            transform.position.y += transform.velocity.y * deltaTime;
        }
    }

    // El método checkBounds() ha sido eliminado por completo.
    // En un mundo infinito, los proyectiles solo deben ser destruidos por:
    // 1. Impacto con enemigos (DamageSystem)
    // 2. Agotamiento de tiempo de vida (LifetimeSystem)
} 