import System from './System.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import MaterialComponent from '../components/MaterialComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class CollectionSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.collectionDistance = 5; // Distancia mínima para recolección final
    }
    
    update(deltaTime) {
        // Buscar la entidad del jugador
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;
        
        const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);
        
        // Buscar todas las entidades con CollectibleComponent
        const collectibleEntities = this.entityManager.getEntitiesWith(CollectibleComponent, TransformComponent);
        
        for (const entityId of collectibleEntities) {
            const collectible = this.entityManager.getComponent(entityId, CollectibleComponent);
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Calcular distancia al jugador
            const dx = playerTransform.position.x - transform.position.x;
            const dy = playerTransform.position.y - transform.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // FASE 1: DETECCIÓN - Activar atracción si entra en el radio de recolección
            if (!collectible.isAttracted && distance <= collectible.collectionRadius) {
                collectible.activateAttraction(performance.now() / 1000);
                console.log(`🧲 Material atraído a distancia ${distance.toFixed(1)}`);
            }
            
            // FASE 2: RECOLECCIÓN FINAL - Recoger si está muy cerca y ya está siendo atraído
            if (collectible.isAttracted && distance <= this.collectionDistance) {
                this.collectMaterial(entityId, collectible);
            }
        }
    }
    
    /**
     * Recolecta un material y publica el evento correspondiente
     * @param {number} entityId - ID de la entidad del material
     * @param {CollectibleComponent} collectible - Componente de recolección
     */
    collectMaterial(entityId, collectible) {
        // Obtener el valor del material
        let materialValue = 1;
        const materialComponent = this.entityManager.getComponent(entityId, MaterialComponent);
        if (materialComponent) {
            materialValue = materialComponent.value;
        }
        
        // Publicar evento de material recolectado
        this.eventBus.publish('material:collected', {
            value: materialValue,
            position: this.entityManager.getComponent(entityId, TransformComponent).position
        });
        
        // Destruir la entidad del material
        this.entityManager.destroyEntity(entityId);
        
        console.log(`💎 Material recolectado: +${materialValue}`);
    }
} 