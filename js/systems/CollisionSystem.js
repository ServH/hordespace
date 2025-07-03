import System from './System.js';
import CollisionComponent from '../components/CollisionComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class CollisionSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(CollisionComponent, TransformComponent);

        for (const entityId of entities) {
            // Comprobación de seguridad: ¿Todavía existe esta entidad?
            if (!this.entityManager.entities.has(entityId)) {
                continue; // Si no, pasar a la siguiente.
            }

            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const collision = this.entityManager.getComponent(entityId, CollisionComponent);
            
            // Esta comprobación adicional nunca está de más.
            if (!transform || !collision) continue;
            
            // 1. Preguntamos al SpatialGrid: "¿Quién está cerca de mí?"
            //    Esto nos da una lista mucho más pequeña de entidades para comprobar.
            const nearbyEntities = this.entityManager.spatialGrid.query(
                transform.position.x - collision.radius,
                transform.position.y - collision.radius,
                collision.radius * 2,
                collision.radius * 2
            );

            for (const otherId of nearbyEntities) {
                // 2. Evitamos comprobar una entidad contra sí misma o en duplicado (A-B vs B-A)
                if (entityId >= otherId) continue;
                
                // 3. Verificamos la colisión real solo con las entidades cercanas
                if (!this.entityManager.entities.has(otherId)) continue;
                
                const otherTransform = this.entityManager.getComponent(otherId, TransformComponent);
                const otherCollision = this.entityManager.getComponent(otherId, CollisionComponent);

                if (!otherTransform || !otherCollision) continue;

                const distance = Math.hypot(
                    transform.position.x - otherTransform.position.x,
                    transform.position.y - otherTransform.position.y
                );

                if (distance < collision.radius + otherCollision.radius) {
                    // 4. Si hay colisión, publicamos el evento (esto no cambia)
                    this.eventBus.publish('collision:detected', { 
                        entityA: entityId, 
                        entityB: otherId 
                    });
                }
            }
        }
    }
} 