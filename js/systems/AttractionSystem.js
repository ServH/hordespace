import System from './System.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';

export default class AttractionSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.attractionForce = 3500; // Fuerza base para aceleración
        this.attractionSpeed = 800; // Velocidad directa cuando no hay límite
    }
    
    update(deltaTime) {
        // Buscar la entidad del jugador
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;
        
        const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
        
        // Buscar todas las entidades con CollectibleComponent que estén siendo atraídas
        const collectibleEntities = this.entityManager.getEntitiesWith(CollectibleComponent, TransformComponent);
        
        for (const entityId of collectibleEntities) {
            const collectible = this.entityManager.getComponent(entityId, CollectibleComponent);
            if (!collectible.isAttracted) continue;
            
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Calcular distancia al jugador
            const dx = playerTransform.position.x - transform.position.x;
            const dy = playerTransform.position.y - transform.position.y;
            const distance = Math.hypot(dx, dy);
            
            // Si está muy cerca, dejamos que la inercia y el CollectionSystem hagan el resto.
            if (distance < 10) continue;
            
            // Verificar si tiene IgnoreSpeedLimitComponent
            const hasIgnoreLimit = this.entityManager.hasComponent(entityId, IgnoreSpeedLimitComponent);
            
            if (hasIgnoreLimit) {
                // Si puede ignorar el límite de velocidad, aplicamos velocidad directa
                // Esto es más efectivo para alcanzar al jugador rápido
                const speedX = (dx / distance) * this.attractionSpeed;
                const speedY = (dy / distance) * this.attractionSpeed;
                
                transform.velocity.x = speedX;
                transform.velocity.y = speedY;
            } else {
                // Si no puede ignorar el límite, aplicamos fuerza a la aceleración
                const forceX = (dx / distance) * this.attractionForce;
                const forceY = (dy / distance) * this.attractionForce;
                
                transform.acceleration.x += forceX;
                transform.acceleration.y += forceY;
            }
        }
    }
} 