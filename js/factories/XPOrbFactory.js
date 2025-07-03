import TransformComponent from '../components/TransformComponent.js';
import XPOrbComponent from '../components/XPOrbComponent.js';
import CollectibleComponent from '../components/CollectibleComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';

export default class XPOrbFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        this.eventBus.subscribe('enemy:destroyed', this.onEnemyDestroyed.bind(this));
        console.log("🏭 XPOrbFactory inicializada");
    }

    onEnemyDestroyed(data) {
        if (!data || !data.xpValue || !data.position) return;

        // Definimos un tipo de orbe basado en la cantidad de XP
        const isEliteOrb = data.xpValue > (CONFIG.ENEMY.DEFAULT.XP_VALUE * 2); // Ejemplo de condición
        const visualType = isEliteOrb ? 'xp_orb_elite' : 'xp_orb_basic';
        const radius = isEliteOrb ? 8 : 5;

        const entity = this.entityManager.createEntity();

        this.entityManager.addComponent(entity, new TransformComponent(data.position.x, data.position.y));
        this.entityManager.addComponent(entity, new XPOrbComponent(data.xpValue));
        this.entityManager.addComponent(entity, new CollectibleComponent(CONFIG.MATERIAL.ATTRACTION_RADIUS)); // Reutilizamos el radio de atracción
        this.entityManager.addComponent(entity, new LifetimeComponent(15)); // 15 segundos de vida
        this.entityManager.addComponent(entity, new RenderComponent(visualType, radius));
        this.entityManager.addComponent(entity, new PhysicsComponent(400, 0.95)); // Física propia para los orbes

        console.log(`✨ Orbe de XP (+${data.xpValue}) creado.`);
    }
} 