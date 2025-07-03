import System from './System.js';
import WeaponComponent from '../components/WeaponComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js'; // Para auto-fire del jugador
import AllyComponent from '../components/AllyComponent.js';
import AIComponent from '../components/AIComponent.js';
import InFormationBonusActiveComponent from '../components/InFormationBonusActiveComponent.js';

export default class WeaponSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.eventBus.subscribe('player:evolve_weapon', this.onWeaponEvolve.bind(this));
    }

    onWeaponEvolve(data) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, WeaponComponent);
        if (playerEntities.length > 0) {
            const weapon = this.entityManager.getComponent(playerEntities[0], WeaponComponent);
            const newProjectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[data.newProjectileTypeId];

            if (weapon && newProjectileDef) {
                console.log(`🧬 Evolución de Arma! Cambiando de ${weapon.projectileTypeId} a ${data.newProjectileTypeId}`);
                
                // 1. Cambiar el tipo de proyectil
                weapon.projectileTypeId = data.newProjectileTypeId;
                
                // 2. ACTUALIZAR LA CADENCIA DEL ARMA con la del nuevo proyectil
                if (newProjectileDef.fireRate) {
                    weapon.fireRate = newProjectileDef.fireRate;
                    console.log(`⏱️ Cadencia de disparo actualizada a: ${weapon.fireRate}`);
                }
            }
        }
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(WeaponComponent, TransformComponent);

        for (const entityId of entities) {
            const weapon = this.entityManager.getComponent(entityId, WeaponComponent);
            const isPlayer = this.entityManager.hasComponent(entityId, PlayerControlledComponent);

            // --- LÓGICA DE CORRECCIÓN ---
            // Si la entidad es el jugador, comprobamos su arma primero.
            if (isPlayer) {
                const projectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[weapon.projectileTypeId];
                // Si el arma equipada es un rayo, este sistema la ignora por completo.
                if (projectileDef && projectileDef.VISUAL_TYPE === 'beam') {
                    continue; // Saltamos al siguiente aliado o entidad.
                }
            }
            // --- FIN DE LA CORRECCIÓN ---

            // El resto de la lógica para armas normales y de aliados se mantiene.
            weapon.fireCooldown = Math.max(0, weapon.fireCooldown - deltaTime);

            // Calculamos la cadencia final aplicando bonos si es necesario
            let finalFireRate = weapon.fireRate;
            const bonusComponent = this.entityManager.getComponent(entityId, InFormationBonusActiveComponent);
            
            // Comprobamos si el bono de CADENCIA está activo
            if (bonusComponent && bonusComponent.activeBonuses.has('FIRE_RATE')) {
                const bonusConfig = CONFIG.FORMATION.FORMATION_BONUSES.FIRE_RATE;
                finalFireRate *= bonusConfig.multiplier;
            }

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

                weapon.fireCooldown = finalFireRate;
            }

            const isAlly = this.entityManager.hasComponent(entityId, AllyComponent);
            if (isAlly && weapon.isFiring && weapon.fireCooldown === 0) {
                const ai = this.entityManager.getComponent(entityId, AIComponent);
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

                    weapon.fireCooldown = finalFireRate;
                }
            }
        }
    }
} 