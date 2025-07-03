import TransformComponent from '../components/TransformComponent.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import XPOrbComponent from '../components/XPOrbComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import IgnoreSpeedLimitComponent from '../components/IgnoreSpeedLimitComponent.js';

/**
 * XPOrbFactory - Crea orbes de XP cuando los enemigos son destruidos
 */
export default class XPOrbFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        
        // Suscribirse al evento de enemigo destruido
        this.eventBus.subscribe('enemy:destroyed', this.onEnemyDestroyed.bind(this));
    }
    
    /**
     * Maneja la destrucción de un enemigo creando un orbe de XP
     * @param {Object} data - Datos del evento
     */
    onEnemyDestroyed(data) {
        const { position, xpValue = 1, radius = 10, enemyType = 'default' } = data;

        if (position) {
            this.createOrb(position.x, position.y, xpValue, radius, enemyType);
        }
    }
    
    /**
     * Crea un orbe de XP en la posición especificada
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {number} xpValue - Valor de XP del orbe
     * @param {number} enemyRadius - Radio del enemigo
     * @param {string} enemyType - Tipo de enemigo
     */
    createOrb(x, y, xpValue, enemyRadius, enemyType) {
        const entity = this.entityManager.createEntity();
        
        // Componentes estándar
        const transform = new TransformComponent(x, y);
        const impulseStrength = enemyRadius * 1.5;
        transform.velocity.x = (Math.random() - 0.5) * impulseStrength;
        transform.velocity.y = (Math.random() - 0.5) * impulseStrength;
        
        const xpOrb = new XPOrbComponent(xpValue);
        const collectible = new CollectibleComponent(CONFIG.MATERIAL.ATTRACTION_RADIUS);
        const lifetime = new LifetimeComponent(30);
        const physics = new PhysicsComponent(CONFIG.MATERIAL.MAX_SPEED, 0.92);
        
        // La fábrica decide el tipo visual basándose en el tipo de enemigo.
        // Esto es mucho más robusto que basarse en el valor de XP.
        const visualType = (enemyType === 'elite') ? 'xp_orb_elite' : 'xp_orb_normal';
        const render = new RenderComponent(visualType, 6);
        
        this.entityManager.addComponent(entity, transform);
        this.entityManager.addComponent(entity, xpOrb);
        this.entityManager.addComponent(entity, collectible);
        this.entityManager.addComponent(entity, lifetime);
        this.entityManager.addComponent(entity, physics);
        this.entityManager.addComponent(entity, render);
        
        console.log(`✨ Orbe de XP creado: +${xpValue} XP (Tipo: ${visualType})`);
        return entity;
    }
} 