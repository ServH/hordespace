import System from './System.js';
import WeaponComponent from '../components/WeaponComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js'; // Para auto-fire del jugador
import AllyComponent from '../components/AllyComponent.js';
import AIComponent from '../components/AIComponent.js';

export default class WeaponSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.eventBus.subscribe('player:evolve_weapon', this.onWeaponEvolve.bind(this));
    }

    onWeaponEvolve(data) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, WeaponComponent);
        if (playerEntities.length > 0) {
            const weapon = this.entityManager.getComponent(playerEntities[0], WeaponComponent);
            console.log(`🧬 Evolución de Arma! Cambiando de ${weapon.projectileTypeId} a ${data.newProjectileTypeId}`);
            weapon.projectileTypeId = data.newProjectileTypeId;
        }
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(WeaponComponent, TransformComponent);

        for (const entityId of entities) {
            const weapon = this.entityManager.getComponent(entityId, WeaponComponent);
            weapon.fireCooldown = Math.max(0, weapon.fireCooldown - deltaTime);

            // Lógica de disparo específica del jugador
            const isPlayer = this.entityManager.hasComponent(entityId, PlayerControlledComponent);
            const isAlly = this.entityManager.hasComponent(entityId, AllyComponent);
            
            if (isPlayer && weapon.isFiring && weapon.fireCooldown === 0) {
                const transform = this.entityManager.getComponent(entityId, TransformComponent);
                const fireOffset = transform.radius + 5;
                const firePos = {
                    x: transform.position.x + Math.sin(transform.angle) * fireOffset,
                    y: transform.position.y - Math.cos(transform.angle) * fireOffset
                };

                this.eventBus.publish('weapon:fire', {
                    ownerId: entityId,
                    ownerGroup: 'player',
                    position: firePos,
                    angle: transform.angle,
                    projectileTypeId: weapon.projectileTypeId
                });

                weapon.fireCooldown = weapon.fireRate;
            }
            
            // Lógica de disparo específica de los aliados
            if (isAlly && weapon.isFiring && weapon.fireCooldown === 0) {
                const ai = this.entityManager.getComponent(entityId, AIComponent);
                // ¡Solo disparar si la IA tiene un objetivo!
                if (ai && ai.targetId) {
                    const transform = this.entityManager.getComponent(entityId, TransformComponent);
                    const fireOffset = transform.radius + 5;
                    const firePos = {
                        x: transform.position.x + Math.sin(transform.angle) * fireOffset,
                        y: transform.position.y - Math.cos(transform.angle) * fireOffset
                    };

                    this.eventBus.publish('weapon:fire', {
                        ownerId: entityId,
                        ownerGroup: 'ally',
                        position: firePos,
                        angle: transform.angle,
                        projectileTypeId: weapon.projectileTypeId
                    });

                    weapon.fireCooldown = weapon.fireRate;
                }
            }
        }
    }
} 