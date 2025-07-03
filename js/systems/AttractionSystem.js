import System from './System.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class AttractionSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        // Aumentamos drásticamente la velocidad base de atracción
        this.baseAttractionSpeed = 1200; 
    }
    
    update(deltaTime) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;
        
        const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
        
        const collectibleEntities = this.entityManager.getEntitiesWith(CollectibleComponent, TransformComponent);
        
        for (const entityId of collectibleEntities) {
            const collectible = this.entityManager.getComponent(entityId, CollectibleComponent);
            if (!collectible.isAttracted) continue;
            
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            const dx = playerTransform.position.x - transform.position.x;
            const dy = playerTransform.position.y - transform.position.y;
            const distance = Math.hypot(dx, dy);
            
            // --- INICIO DE LA LÓGICA DE ABSORCIÓN MEJORADA ---

            // Si está muy cerca, la recolección es casi instantánea
            if (distance < 10) {
                transform.velocity.x = dx / deltaTime;
                transform.velocity.y = dy / deltaTime;
                continue;
            }
            
            // La velocidad aumenta cuanto más cerca está el orbe del radio de atracción
            // Esto crea el efecto de "acelerón" final.
            const speedFactor = 1 - (distance / collectible.collectionRadius);
            const currentSpeed = this.baseAttractionSpeed * Math.pow(speedFactor, 2); // Usamos una curva exponencial para el acelerón

            // En lugar de aplicar una fuerza, establecemos directamente la velocidad.
            // Esto anula cualquier velocidad anterior y lo dirige directamente hacia el jugador.
            transform.velocity.x = (dx / distance) * currentSpeed;
            transform.velocity.y = (dy / distance) * currentSpeed;

            // --- FIN DE LA LÓGICA DE ABSORCIÓN MEJORADA ---
        }
    }
} 