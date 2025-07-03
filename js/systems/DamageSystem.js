import System from './System.js';
import ProjectileComponent from '../components/ProjectileComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import InvincibilityComponent from '../components/InvincibilityComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import DamageCooldownComponent from '../components/DamageCooldownComponent.js';
import IsTakingBeamDamageComponent from '../components/IsTakingBeamDamageComponent.js';

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
        if (!projectileDef || !targetHealth) return;

        // --- LÓGICA ESPECIAL PARA RAYOS ---
        if (projectileDef.VISUAL_TYPE === 'beam') {
            let cooldownComp = this.entityManager.getComponent(targetId, DamageCooldownComponent);
            if (cooldownComp && cooldownComp.cooldowns.has('beam')) {
                return; // En cooldown, no aplicar daño
            }
            if (!cooldownComp) {
                cooldownComp = new DamageCooldownComponent();
                this.entityManager.addComponent(targetId, cooldownComp);
            }
            cooldownComp.cooldowns.set('beam', 0.05); // 0.05s de cooldown por tick
            
            // Le ponemos la etiqueta al enemigo para que sepa que está recibiendo daño de rayo.
            if (!this.entityManager.hasComponent(targetId, IsTakingBeamDamageComponent)) {
                this.entityManager.addComponent(targetId, new IsTakingBeamDamageComponent());
            }
            
            targetHealth.hp -= projectileDef.DAMAGE;
            console.log(`💥 [BEAM] golpea. Daño: ${projectileDef.DAMAGE}, HP restante: ${targetHealth.hp}`);
        } else {
            // --- LÓGICA NORMAL DE PROYECTILES CON REBOTES ---
            
            // Registramos que este proyectil ya ha golpeado a este objetivo
            projectile.hitTargets.add(targetId);

            // Aplicamos el daño al objetivo actual
            targetHealth.hp -= projectileDef.DAMAGE;
            console.log(`💥 Proyectil de ${projectile.ownerGroup} golpea. Daño: ${projectileDef.DAMAGE}, HP restante: ${targetHealth.hp}`);

            // --- NUEVA LÓGICA DE IMPACTO ---
            // Decidimos qué hacer con el proyectil después del impacto.

            // 1. ¿Puede rebotar?
            if (projectile.bouncesRemaining > 0) {
                projectile.bouncesRemaining--;

                // Buscamos un nuevo objetivo para el rebote
                const newTarget = this.findNextBounceTarget(projectileId, targetId);

                if (newTarget) {
                    // ¡Objetivo encontrado! Redirigimos el proyectil.
                    const projectileTransform = this.entityManager.getComponent(projectileId, TransformComponent);
                    const targetTransform = this.entityManager.getComponent(newTarget, TransformComponent);

                    const directionX = targetTransform.position.x - projectileTransform.position.x;
                    const directionY = targetTransform.position.y - projectileTransform.position.y;
                    const magnitude = Math.hypot(directionX, directionY);
                    
                    const speed = Math.hypot(projectileTransform.velocity.x, projectileTransform.velocity.y);

                    projectileTransform.velocity.x = (directionX / magnitude) * speed;
                    projectileTransform.velocity.y = (directionY / magnitude) * speed;
                    
                    console.log(`⚡ ¡REBOTE! Proyectil se redirige al enemigo ${newTarget}. Rebotes restantes: ${projectile.bouncesRemaining}`);
                    
                } else {
                    // No encontró a nadie más a quien rebotar, se destruye.
                    this.entityManager.destroyEntity(projectileId);
                }

            // 2. Si no puede rebotar, ¿puede atravesar?
            } else if (projectile.pierceCount > 0) {
                projectile.pierceCount--;
                console.log(`🌀 Proyectil atraviesa enemigo. Perforaciones restantes: ${projectile.pierceCount}`);

            // 3. Si no puede rebotar ni atravesar, se destruye.
            } else {
                // --- INICIO DE LA NUEVA LÓGICA DE AOE ---
                // Antes de destruir el proyectil, comprobamos si tiene efecto AoE
                if (projectileDef.HAS_AOE_ON_IMPACT) {
                    const projectileTransform = this.entityManager.getComponent(projectileId, TransformComponent);
                    this.applyAoeDamage(projectileTransform.position, projectileDef);
                }
                // --- FIN DE LA NUEVA LÓGICA DE AOE ---
                
                this.entityManager.destroyEntity(projectileId);
            }
            
            // --- FIN DE LA NUEVA LÓGICA ---
        }

        if (targetHealth.hp <= 0) {
            const transform = this.entityManager.getComponent(targetId, TransformComponent);
            const collision = this.entityManager.getComponent(targetId, CollisionComponent);
            const enemy = this.entityManager.getComponent(targetId, EnemyComponent);
            
            // Obtener el XP_VALUE específico del tipo de enemigo
            let xpValue = CONFIG.ENEMY.DEFAULT.XP_VALUE; // Fallback
            let enemyType = 'default';
            if (enemy && enemy.typeId && CONFIG.ENEMY[enemy.typeId.toUpperCase()]) {
                xpValue = CONFIG.ENEMY[enemy.typeId.toUpperCase()].XP_VALUE;
                enemyType = enemy.typeId;
            }
            
            this.eventBus.publish('enemy:destroyed', { 
                enemyId: targetId,
                xpValue: xpValue,
                enemyType: enemyType,
                position: transform ? transform.position : { x: 0, y: 0 }, 
                radius: collision ? collision.radius : 10
            });
            this.entityManager.destroyEntity(targetId);
        }
    }

    // --- NUEVO MÉTODO PARA ENCONTRAR EL SIGUIENTE OBJETIVO DE REBOTE ---
    findNextBounceTarget(projectileId, currentTargetId) {
        const projectile = this.entityManager.getComponent(projectileId, ProjectileComponent);
        const projectileTransform = this.entityManager.getComponent(projectileId, TransformComponent);
        if (!projectile || !projectileTransform) return null;

        const searchRadius = 250; // Radio de búsqueda para el siguiente rebote
        
        // Usamos el SpatialGrid para encontrar enemigos cercanos de forma eficiente
        const nearbyEntities = this.entityManager.spatialGrid.query(
            projectileTransform.position.x - searchRadius,
            projectileTransform.position.y - searchRadius,
            searchRadius * 2,
            searchRadius * 2
        );

        let closestTarget = null;
        let minDistance = Infinity;

        for (const potentialTargetId of nearbyEntities) {
            // Ignoramos el objetivo que acabamos de golpear y los que ya hemos golpeado
            if (potentialTargetId === currentTargetId || projectile.hitTargets.has(potentialTargetId)) {
                continue;
            }

            // Nos aseguramos de que es un enemigo
            if (!this.entityManager.hasComponent(potentialTargetId, EnemyComponent)) {
                continue;
            }

            const potentialTargetTransform = this.entityManager.getComponent(potentialTargetId, TransformComponent);
            const distance = Math.hypot(
                projectileTransform.position.x - potentialTargetTransform.position.x,
                projectileTransform.position.y - potentialTargetTransform.position.y
            );

            if (distance < minDistance && distance < searchRadius) {
                minDistance = distance;
                closestTarget = potentialTargetId;
            }
        }

        return closestTarget;
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

    /**
     * Aplica daño en un área de efecto (AoE).
     * @param {object} centerPosition - La posición {x, y} del centro de la explosión.
     * @param {object} projectileDef - La definición del proyectil que causó el AoE.
     */
    applyAoeDamage(centerPosition, projectileDef) {
        console.log(`💥 ¡AOE! Buscando enemigos en un radio de ${projectileDef.AOE_RADIUS}px.`);

        // 1. Spawnea un efecto visual de explosión (¡feedback para el jugador!)
        this.eventBus.publish('explosion:request', {
            position: centerPosition,
            size: projectileDef.AOE_RADIUS,
            // Opcional: podrías añadir colores personalizados a la explosión
        });

        // 2. Encuentra todos los enemigos cercanos usando la rejilla espacial
        const nearbyEntities = this.entityManager.spatialGrid.query(
            centerPosition.x - projectileDef.AOE_RADIUS,
            centerPosition.y - projectileDef.AOE_RADIUS,
            projectileDef.AOE_RADIUS * 2,
            projectileDef.AOE_RADIUS * 2
        );

        for (const enemyId of nearbyEntities) {
            if (!this.entityManager.hasComponent(enemyId, EnemyComponent)) continue;

            const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
            const distance = Math.hypot(centerPosition.x - enemyTransform.position.x, centerPosition.y - enemyTransform.position.y);

            // 3. Si el enemigo está dentro del radio, aplica el daño de AoE
            if (distance <= projectileDef.AOE_RADIUS) {
                const enemyHealth = this.entityManager.getComponent(enemyId, HealthComponent);
                if (enemyHealth) {
                    enemyHealth.hp -= projectileDef.AOE_DAMAGE;
                    console.log(`   -> Enemigo ${enemyId} golpeado por AoE. Daño: ${projectileDef.AOE_DAMAGE}, HP restante: ${enemyHealth.hp}`);

                    if (enemyHealth.hp <= 0) {
                        // Obtener el XP_VALUE específico del tipo de enemigo
                        const enemy = this.entityManager.getComponent(enemyId, EnemyComponent);
                        let xpValue = CONFIG.ENEMY.DEFAULT.XP_VALUE; // Fallback
                        let enemyType = 'default';
                        if (enemy && enemy.typeId && CONFIG.ENEMY[enemy.typeId.toUpperCase()]) {
                            xpValue = CONFIG.ENEMY[enemy.typeId.toUpperCase()].XP_VALUE;
                            enemyType = enemy.typeId;
                        }
                        
                        // Publicamos el evento de destrucción como de costumbre
                        this.eventBus.publish('enemy:destroyed', {
                            enemyId: enemyId,
                            xpValue: xpValue,
                            enemyType: enemyType,
                            position: enemyTransform.position,
                            radius: this.entityManager.getComponent(enemyId, CollisionComponent).radius
                        });
                        this.entityManager.destroyEntity(enemyId);
                    }
                }
            }
        }
    }

    update(deltaTime) {
        // Este sistema es reactivo, no necesita lógica en update
    }
} 