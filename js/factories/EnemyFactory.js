import TransformComponent from '../components/TransformComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import AIComponent from '../components/AIComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';

export default class EnemyFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        this.eventBus.subscribe('enemy:request_spawn', this.create.bind(this));
        console.log("🏭 EnemyFactory lista y escuchando.");
    }

    create(config) {
        const enemyId = this.entityManager.createEntity();
        const def = CONFIG.ENEMY.DEFAULT;

        this.entityManager.addComponent(enemyId, new TransformComponent(config.position.x, config.position.y));
        this.entityManager.addComponent(enemyId, new HealthComponent(config.hp));
        this.entityManager.addComponent(enemyId, new EnemyComponent());
        this.entityManager.addComponent(enemyId, new AIComponent(def.AI_TARGETING_RANGE || 500));
        this.entityManager.addComponent(enemyId, new CollisionComponent(def.RADIUS, 'enemy'));
        this.entityManager.addComponent(enemyId, new RenderComponent('enemy_ship', def.RADIUS));
        this.entityManager.addComponent(enemyId, new PhysicsComponent(config.maxSpeed, def.FRICTION));
        
        console.log(`🏭 Enemigo ECS creado en (${config.position.x.toFixed(0)}, ${config.position.y.toFixed(0)}) con HP: ${config.hp}, Velocidad: ${config.maxSpeed}`);
    }
} 