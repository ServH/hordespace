import System from './System.js';
import CollisionComponent from '../components/CollisionComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class CollisionSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(CollisionComponent, TransformComponent);
        
        for (let i = 0; i < entities.length; i++) {
            for (let j = i + 1; j < entities.length; j++) {
                const entityA_id = entities[i];
                const entityB_id = entities[j];

                // Verificación de seguridad para evitar crashes por entidades destruidas
                if (!this.entityManager.entities.has(entityA_id) || !this.entityManager.entities.has(entityB_id)) {
                    continue;
                }
                
                const transformA = this.entityManager.getComponent(entityA_id, TransformComponent);
                const collisionA = this.entityManager.getComponent(entityA_id, CollisionComponent);
                const transformB = this.entityManager.getComponent(entityB_id, TransformComponent);
                const collisionB = this.entityManager.getComponent(entityB_id, CollisionComponent);

                const distance = Math.sqrt(
                    Math.pow(transformA.position.x - transformB.position.x, 2) + 
                    Math.pow(transformA.position.y - transformB.position.y, 2)
                );

                if (distance < (collisionA.radius + collisionB.radius)) {
                    this.eventBus.publish('collision:detected', { 
                        entityA: entityA_id, 
                        entityB: entityB_id 
                    });
                }
            }
        }
    }
} 