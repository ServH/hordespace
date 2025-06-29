import TransformComponent from '../components/TransformComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import LifetimeComponent from '../components/LifetimeComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import RenderComponent from '../components/RenderComponent.js';
import WeaponComponent from '../components/WeaponComponent.js';

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

        // --- CALCULAR CAPACIDAD DE PERFORACIÓN ---
        // 1. Obtenemos el componente de arma de quien disparó
        const ownerWeapon = this.entityManager.getComponent(ownerId, WeaponComponent);
        
        // 2. Calculamos el total de perforación y rebotes
        // (El valor base del proyectil + el bonus del arma de quien disparó)
        const totalPierce = (def.PIERCE || 0) + (ownerWeapon ? ownerWeapon.bonusPierce : 0);
        const totalBounces = (def.bounces || 0) + (ownerWeapon ? ownerWeapon.bonusBounces : 0);
        
        // 3. Creamos el componente de proyectil con las capacidades calculadas
        const projectileComp = new ProjectileComponent(ownerId, ownerGroup, projectileTypeId);
        projectileComp.pierceCount = totalPierce;
        projectileComp.bouncesRemaining = totalBounces;

        // Transform
        const transform = new TransformComponent(position.x, position.y, angle);
        transform.velocity.x = Math.sin(angle) * def.SPEED;
        transform.velocity.y = -Math.cos(angle) * def.SPEED;
        this.entityManager.addComponent(projectileId, transform);

        // Otros componentes
        this.entityManager.addComponent(projectileId, projectileComp);
        this.entityManager.addComponent(projectileId, new LifetimeComponent(def.LIFETIME));
        this.entityManager.addComponent(projectileId, new CollisionComponent(def.RADIUS, `${ownerGroup}_projectile`));
        this.entityManager.addComponent(projectileId, new RenderComponent(def.VISUAL_TYPE, def.RADIUS, def.GLOW_RADIUS_MULTIPLIER));
        
        console.log(`🚀 Proyectil ECS creado: ${def.VISUAL_TYPE} por ${ownerGroup} (Perforación: ${totalPierce}, Rebotes: ${totalBounces})`);
    }
} 