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
            // ¡Se mantiene la condición que ignora al jugador!
            if (this.entityManager.hasComponent(entityId, PlayerControlledComponent)) {
                continue;
            }
            
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const collision = this.entityManager.getComponent(entityId, CollisionComponent);
            const radius = collision.radius;
            
            // La lógica ahora SOLO se aplica a los proyectiles.
            if (this.entityManager.hasComponent(entityId, ProjectileComponent)) {
                // Los proyectiles se destruyen al salir de los límites
                if (transform.position.x < -radius || 
                    transform.position.x > canvasWidth + radius ||
                    transform.position.y < -radius || 
                    transform.position.y > canvasHeight + radius) {
                    
                    this.entityManager.destroyEntity(entityId);
                }
            }
            // El bloque "else" ha sido eliminado. Ya no hay rebote para las naves.
        }
    }
} 