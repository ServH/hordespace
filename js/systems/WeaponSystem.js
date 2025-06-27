import System from './System.js';
import WeaponComponent from '../components/WeaponComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js'; // Para auto-fire del jugador

export default class WeaponSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(WeaponComponent, TransformComponent);

        for (const entityId of entities) {
            const weapon = this.entityManager.getComponent(entityId, WeaponComponent);
            weapon.fireCooldown = Math.max(0, weapon.fireCooldown - deltaTime);

            // Lógica de disparo específica del jugador
            const isPlayer = this.entityManager.hasComponent(entityId, PlayerControlledComponent);
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
        }
    }
} 