import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class BoundsSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(TransformComponent, CollisionComponent);
        
        // Límites del canvas
        const canvasWidth = CONFIG.CANVAS.WIDTH;
        const canvasHeight = CONFIG.CANVAS.HEIGHT;
        
        for (const entityId of entities) {
            // ¡NUEVA CONDICIÓN! Si la entidad es el jugador, la ignoramos y pasamos a la siguiente.
            if (this.entityManager.hasComponent(entityId, PlayerControlledComponent)) {
                continue;
            }
            
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const collision = this.entityManager.getComponent(entityId, CollisionComponent);
            const radius = collision.radius;
            
            // Verificar si es un proyectil
            if (this.entityManager.hasComponent(entityId, ProjectileComponent)) {
                // Los proyectiles se destruyen al salir de los límites
                if (transform.position.x < -radius || 
                    transform.position.x > canvasWidth + radius ||
                    transform.position.y < -radius || 
                    transform.position.y > canvasHeight + radius) {
                    
                    this.entityManager.destroyEntity(entityId);
                }
            } else {
                // Las naves (enemigos y aliados) rebotan en los bordes
                // Borde izquierdo/derecho
                if (transform.position.x <= radius) {
                    transform.position.x = radius;
                    transform.velocity.x = Math.abs(transform.velocity.x) * 0.8;
                } else if (transform.position.x >= canvasWidth - radius) {
                    transform.position.x = canvasWidth - radius;
                    transform.velocity.x = -Math.abs(transform.velocity.x) * 0.8;
                }
                
                // Borde superior/inferior
                if (transform.position.y <= radius) {
                    transform.position.y = radius;
                    transform.velocity.y = Math.abs(transform.velocity.y) * 0.8;
                } else if (transform.position.y >= canvasHeight - radius) {
                    transform.position.y = canvasHeight - radius;
                    transform.velocity.y = -Math.abs(transform.velocity.y) * 0.8;
                }
            }
        }
    }
} 