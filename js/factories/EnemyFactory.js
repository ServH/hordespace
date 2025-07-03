import TransformComponent from '../components/TransformComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import AIComponent from '../components/AIComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import ThrusterComponent from '../components/ThrusterComponent.js';
import TrailComponent from '../components/TrailComponent.js';

export default class EnemyFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        this.eventBus.subscribe('enemy:request_spawn', this.create.bind(this));
        // Suscribirse al evento de debug para crear enemigo
        this.eventBus.subscribe('debug:spawn_enemy', () => {
            // Obtener la posición del jugador
            const player = this.entityManager.getEntitiesWith(PlayerControlledComponent)[0];
            const playerTransform = this.entityManager.getComponent(player, TransformComponent);
            const pos = { x: playerTransform.position.x + 150, y: playerTransform.position.y };
            this.create({
                position: pos,
                hp: CONFIG.ENEMY.DEFAULT.HP,
                damage: CONFIG.ENEMY.DEFAULT.DAMAGE,
                maxSpeed: CONFIG.ENEMY.DEFAULT.SPEED,
                xpValue: CONFIG.ENEMY.DEFAULT.XP_VALUE
            });
        });
        console.log("🏭 EnemyFactory lista y escuchando.");
    }

    create(config) {
        const enemyId = this.entityManager.createEntity();
        
        // Usamos la configuración que nos pasan, que ya incluye la definición
        const enemyConfig = config.definition || CONFIG.ENEMY.DEFAULT;

        this.entityManager.addComponent(enemyId, new TransformComponent(config.position.x, config.position.y));
        this.entityManager.addComponent(enemyId, new HealthComponent(config.hp));
        this.entityManager.addComponent(enemyId, new EnemyComponent(enemyConfig.TYPE_ID));
        this.entityManager.addComponent(enemyId, new AIComponent(enemyConfig.AI_TARGETING_RANGE || 500));
        this.entityManager.addComponent(enemyId, new CollisionComponent(enemyConfig.RADIUS, 'enemy'));
        this.entityManager.addComponent(enemyId, new RenderComponent('enemy_ship', enemyConfig.RADIUS));
        this.entityManager.addComponent(enemyId, new PhysicsComponent(config.maxSpeed, enemyConfig.FRICTION));
        
        // Añadir propulsores y estelas a los enemigos
        const enemyThrusterOffsets = [
            { x: 0, y: enemyConfig.RADIUS * 0.8 } // Un solo propulsor central trasero
        ];
        const trailConfig = CONFIG.TRAIL_TYPES['ENEMY_DEFAULT'];

        this.entityManager.addComponent(enemyId, new ThrusterComponent({
            offsets: enemyThrusterOffsets,
            trailType: 'ENEMY_DEFAULT'
        }));

        this.entityManager.addComponent(enemyId, new TrailComponent(trailConfig, 1));
        
        console.log(`🏭 Enemigo tipo [${enemyConfig.TYPE_ID}] creado en (${config.position.x.toFixed(0)}, ${config.position.y.toFixed(0)}) con HP: ${config.hp}, Velocidad: ${config.maxSpeed}`);
    }
} 