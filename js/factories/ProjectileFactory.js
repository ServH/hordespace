import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import RenderComponent from '../components/RenderComponent.js';

export default class ProjectileFactory {
    constructor(entityManager, eventBus) {
        this.entityManager = entityManager;
        this.eventBus = eventBus;
        this.eventBus.subscribe('weapon:fire', this.create.bind(this));
        console.log("🏭 ProjectileFactory lista y escuchando.");
    }

    create(fireData) {
        const { ownerId, ownerGroup, position, angle, projectileTypeId } = fireData;
        const def = CONFIG.PROJECTILE.PROJECTILE_TYPES[projectileTypeId];
        if (!def) return;

        const projectileId = this.entityManager.createEntity();

        // Transform
        const transform = new TransformComponent(position.x, position.y, angle);
        transform.velocity.x = Math.sin(angle) * def.SPEED;
        transform.velocity.y = -Math.cos(angle) * def.SPEED;
        this.entityManager.addComponent(projectileId, transform);

        // Otros componentes
        this.entityManager.addComponent(projectileId, new ProjectileComponent(ownerId, ownerGroup));
        this.entityManager.addComponent(projectileId, new LifetimeComponent(def.LIFETIME));
        this.entityManager.addComponent(projectileId, new CollisionComponent(def.RADIUS, `${ownerGroup}_projectile`));
        this.entityManager.addComponent(projectileId, new RenderComponent(def.VISUAL_TYPE, def.RADIUS, def.GLOW_RADIUS_MULTIPLIER));
        
        console.log(`🚀 Proyectil ECS creado: ${def.VISUAL_TYPE} por ${ownerGroup}`);
    }
} 