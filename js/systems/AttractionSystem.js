import System from './System.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class AttractionSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.attractionForce = 200; // Fuerza base de atracción
        this.maxAttractionForce = 800; // Fuerza máxima cuando está muy cerca
        this.minDistance = 5; // Distancia mínima para recolección
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
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            if (!collectible.isAttracted) continue;
            
            // Calcular distancia al jugador
            const dx = playerTransform.position.x - transform.position.x;
            const dy = playerTransform.position.y - transform.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Si está muy cerca, no aplicar más fuerza (será recogido por CollectionSystem)
            if (distance <= this.minDistance) continue;
            
            // Calcular intensidad de la atracción
            const intensity = collectible.getAttractionIntensity(performance.now() / 1000);
            
            // La fuerza aumenta cuanto más cerca está del jugador
            const distanceFactor = Math.max(0.1, 1 - (distance / collectible.collectionRadius));
            const currentForce = this.attractionForce + (this.maxAttractionForce - this.attractionForce) * distanceFactor;
            
            // Aplicar fuerza hacia el jugador
            const forceX = (dx / distance) * currentForce * intensity * deltaTime;
            const forceY = (dy / distance) * currentForce * intensity * deltaTime;
            
            // Aplicar a la velocidad del material
            transform.velocity.x += forceX;
            transform.velocity.y += forceY;
            
            // Aplicar fricción para suavizar el movimiento
            transform.velocity.x *= 0.95;
            transform.velocity.y *= 0.95;
        }
    }
} 