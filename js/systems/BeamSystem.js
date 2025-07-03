import System from './System.js';
import WeaponComponent from '../components/WeaponComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import HealthComponent from '../components/HealthComponent.js';
import DamageCooldownComponent from '../components/DamageCooldownComponent.js';
import IsTakingBeamDamageComponent from '../components/IsTakingBeamDamageComponent.js';

export default class BeamSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        this.beamLength = 800; // Longitud del rayo, podemos moverla a config si queremos
    }

    update(deltaTime) {
        // 1. Encontrar al jugador y su arma
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, WeaponComponent, TransformComponent);
        if (playerEntities.length === 0) return;

        const player = playerEntities[0];
        const weapon = this.entityManager.getComponent(player, WeaponComponent);
        const transform = this.entityManager.getComponent(player, TransformComponent);
        
        const projectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[weapon.projectileTypeId];
        
        // 2. Si el arma actual no es un 'beam', este sistema no hace nada.
        if (!projectileDef || projectileDef.VISUAL_TYPE !== 'beam') {
            return;
        }

        // 3. Calcular la línea del rayo
        const startX = transform.position.x;
        const startY = transform.position.y;
        const endX = startX + Math.sin(transform.angle) * this.beamLength;
        const endY = startY - Math.cos(transform.angle) * this.beamLength;
        const beamWidth = projectileDef.RADIUS;

        // 4. Encontrar todos los enemigos
        const enemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent, CollisionComponent, HealthComponent);
        
        for (const enemyId of enemies) {
            const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
            const enemyCollision = this.entityManager.getComponent(enemyId, CollisionComponent);

            // 5. Comprobar si el enemigo colisiona con el segmento de línea del rayo
            if (this.isLineSegmentCollidingWithCircle(startX, startY, endX, endY, beamWidth, enemyTransform.position.x, enemyTransform.position.y, enemyCollision.radius)) {
                
                // Si hay colisión, aplicamos la misma lógica de daño por tick que ya teníamos
                let cooldownComp = this.entityManager.getComponent(enemyId, DamageCooldownComponent);
                if (cooldownComp && cooldownComp.cooldowns.has('beam')) {
                    continue; // El enemigo está en cooldown, pasamos al siguiente
                }

                if (!cooldownComp) {
                    cooldownComp = new DamageCooldownComponent();
                    this.entityManager.addComponent(enemyId, cooldownComp);
                }
                cooldownComp.cooldowns.set('beam', 0.1); // Cooldown de 0.1s por tick de daño
                
                // Aplicamos la etiqueta para el efecto visual
                if (!this.entityManager.hasComponent(enemyId, IsTakingBeamDamageComponent)) {
                    this.entityManager.addComponent(enemyId, new IsTakingBeamDamageComponent());
                }

                // Aplicamos el daño
                const targetHealth = this.entityManager.getComponent(enemyId, HealthComponent);
                targetHealth.hp -= projectileDef.DAMAGE;
                
                console.log(`💥 [BEAM] golpea a enemigo ${enemyId}. Daño: ${projectileDef.DAMAGE}, HP restante: ${targetHealth.hp}`);
                
                if (targetHealth.hp <= 0) {
                    // Obtener el XP_VALUE específico del tipo de enemigo
                    const enemy = this.entityManager.getComponent(enemyId, EnemyComponent);
                    let xpValue = CONFIG.ENEMY.DEFAULT.XP_VALUE; // Fallback
                    let enemyType = 'default';
                    if (enemy && enemy.typeId && CONFIG.ENEMY[enemy.typeId.toUpperCase()]) {
                        xpValue = CONFIG.ENEMY[enemy.typeId.toUpperCase()].XP_VALUE;
                        enemyType = enemy.typeId;
                    }
                    
                    this.eventBus.publish('enemy:destroyed', { 
                        enemyId: enemyId,
                        xpValue: xpValue,
                        enemyType: enemyType,
                        position: enemyTransform.position, 
                        radius: enemyCollision.radius
                    });
                    this.entityManager.destroyEntity(enemyId);
                }
            }
        }
    }

    // Función matemática para detectar colisión entre un segmento de línea y un círculo
    isLineSegmentCollidingWithCircle(x1, y1, x2, y2, lineWidth, circleX, circleY, circleRadius) {
        const lenSq = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (lenSq === 0) return false; // El segmento es un punto

        let t = ((circleX - x1) * (x2 - x1) + (circleY - y1) * (y2 - y1)) / lenSq;
        t = Math.max(0, Math.min(1, t));

        const closestX = x1 + t * (x2 - x1);
        const closestY = y1 + t * (y2 - y1);
        
        const distSq = (closestX - circleX) * (closestX - circleX) + (closestY - circleY) * (closestY - circleY);
        
        return distSq < (circleRadius + lineWidth / 2) * (circleRadius + lineWidth / 2);
    }
} 