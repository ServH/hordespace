import System from './System.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import InvincibilityComponent from '../components/InvincibilityComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';

export default class DamageSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.eventBus.subscribe('collision:detected', this.onCollision.bind(this));
    }

    onCollision(data) {
        const { entityA, entityB } = data;

        // Obtener componentes de colisión de ambas entidades
        const collisionA = this.entityManager.getComponent(entityA, CollisionComponent);
        const collisionB = this.entityManager.getComponent(entityB, CollisionComponent);

        // Si por alguna razón no tienen componente de colisión, salir.
        if (!collisionA || !collisionB) return;

        const groupA = collisionA.collisionGroup;
        const groupB = collisionB.collisionGroup;

        // CASO 1: Proyectil de Jugador/Aliado golpea a un Enemigo
        if ((groupA.endsWith('_projectile') && groupB === 'enemy') || (groupB.endsWith('_projectile') && groupA === 'enemy')) {
            const projectileId = groupA.endsWith('_projectile') ? entityA : entityB;
            const enemyId = groupA === 'enemy' ? entityA : entityB;
            
            this.applyProjectileDamage(projectileId, enemyId);
        }

        // CASO 2: Enemigo golpea a Jugador (daño por contacto)
        if ((groupA === 'enemy' && groupB === 'player') || (groupB === 'enemy' && groupA === 'player')) {
            const playerId = groupA === 'player' ? entityA : entityB;
            const enemyId = groupA === 'enemy' ? entityA : entityB;

            this.applyContactDamage(enemyId, playerId);
        }
    }

    applyProjectileDamage(projectileId, targetId) {
        const projectile = this.entityManager.getComponent(projectileId, ProjectileComponent);
        if (!projectile) return;

        const projectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[projectile.projectileTypeId];
        const targetHealth = this.entityManager.getComponent(targetId, HealthComponent);
        
        if (projectileDef && targetHealth) {
            targetHealth.hp -= projectileDef.DAMAGE;
            console.log(`💥 Proyectil de ${projectile.ownerGroup} golpea. Daño: ${projectileDef.DAMAGE}, HP restante: ${targetHealth.hp}`);
            
            // --- LÓGICA DE PERFORACIÓN ---
            if (projectile.pierceCount > 0) {
                // Si puede atravesar, restamos una carga y no lo destruimos
                projectile.pierceCount--;
                console.log(`🌀 Proyectil atraviesa enemigo. Perforaciones restantes: ${projectile.pierceCount}`);
            } else {
                // Si no puede (o no tiene el componente), se destruye
                this.entityManager.destroyEntity(projectileId);
            }

            if (targetHealth.hp <= 0) {
                const transform = this.entityManager.getComponent(targetId, TransformComponent);
                const collision = this.entityManager.getComponent(targetId, CollisionComponent);
                
                this.eventBus.publish('enemy:destroyed', { 
                    enemyId: targetId,
                    xpValue: CONFIG.ENEMY.DEFAULT.XP_VALUE,
                    position: transform ? transform.position : { x: 0, y: 0 }, 
                    radius: collision ? collision.radius : 10
                });
                this.entityManager.destroyEntity(targetId);
            }
        }
    }

    applyContactDamage(enemyId, playerId) {
        if (this.entityManager.hasComponent(playerId, InvincibilityComponent)) {
            return; // El jugador es invencible
        }

        const playerHealth = this.entityManager.getComponent(playerId, HealthComponent);
        if (playerHealth && playerHealth.hp > 0) {
            const damage = CONFIG.ENEMY.DEFAULT.DAMAGE;
            playerHealth.hp -= damage;
            console.log(`💢 Enemigo golpea jugador. Daño: ${damage}, HP restante: ${playerHealth.hp}`);
            
            this.entityManager.addComponent(playerId, new InvincibilityComponent(1.0));

            if (playerHealth.hp <= 0) {
                this.eventBus.publish('player:destroyed', { playerId });
            }
        }
    }

    update(deltaTime) {
        // Este sistema es reactivo, no necesita lógica en update
    }
} 