import System from './System.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import MaterialComponent from '../components/MaterialComponent.js';
import XPOrbComponent from '../components/XPOrbComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';

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
                
                // --- INICIO DE LA SOLUCIÓN DEL BUG ---
                // Le damos al coleccionable la capacidad de ignorar su límite de velocidad.
                if (!this.entityManager.hasComponent(entityId, IgnoreSpeedLimitComponent)) {
                    this.entityManager.addComponent(entityId, new IgnoreSpeedLimitComponent());
                }
                // --- FIN DE LA SOLUCIÓN DEL BUG ---
                
                console.log(`🧲 Material atraído a distancia ${distance.toFixed(1)}`);
            }
            
            // FASE 2: RECOLECCIÓN FINAL - Recoger si está muy cerca y ya está siendo atraído
            if (collectible.isAttracted && distance <= this.collectionDistance) {
                this.handleCollection(entityId);
            }
        }
    }
    
    /**
     * Maneja la recolección de cualquier tipo de coleccionable
     * @param {number} entityId - ID de la entidad del coleccionable
     */
    handleCollection(entityId) {
        // Comprobar si es un material
        if (this.entityManager.hasComponent(entityId, MaterialComponent)) {
            const material = this.entityManager.getComponent(entityId, MaterialComponent);
            this.eventBus.publish('material:collected', { value: material.value });
            this.entityManager.destroyEntity(entityId);
            console.log(`💎 Material recolectado: +${material.value}`);
            return;
        }

        // Comprobar si es un orbe de XP
        if (this.entityManager.hasComponent(entityId, XPOrbComponent)) {
            const orb = this.entityManager.getComponent(entityId, XPOrbComponent);
            this.eventBus.publish('xp:collected', { value: orb.xpValue }); // <-- NUEVO EVENTO
            this.entityManager.destroyEntity(entityId);
            console.log(`✨ Orbe de XP recolectado: +${orb.xpValue}`);
            return;
        }
    }
} 