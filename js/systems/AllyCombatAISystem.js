import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import AIComponent from '../components/AIComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import WeaponComponent from '../components/WeaponComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import HealthComponent from '../components/HealthComponent.js';

export default class AllyCombatAISystem extends System {
    update(deltaTime) {
        // Obtener todos los enemigos vivos
        const enemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent, HealthComponent);
        const aliveEnemies = enemies.filter(enemyId => {
            const health = this.entityManager.getComponent(enemyId, HealthComponent);
            return health && health.hp > 0;
        });
        
        // Procesar cada nave aliada
        const allies = this.entityManager.getEntitiesWith(
            AllyComponent, 
            AIComponent, 
            TransformComponent, 
            WeaponComponent
        );
        
        for (const allyId of allies) {
            const ai = this.entityManager.getComponent(allyId, AIComponent);
            const transform = this.entityManager.getComponent(allyId, TransformComponent);
            const weapon = this.entityManager.getComponent(allyId, WeaponComponent);

            // Actualizar cooldown del arma
            if (weapon.fireCooldown > 0) {
                weapon.fireCooldown -= deltaTime;
            }

            // 1. LÓGICA DE DECISIÓN: BUSCAR OBJETIVO
            let closestEnemyId = null;
            let minDistance = ai.targetingRange;

            for (const enemyId of aliveEnemies) {
                const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
                if (!enemyTransform) continue;
                
                const distance = Math.hypot(transform.position.x - enemyTransform.position.x, transform.position.y - enemyTransform.position.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestEnemyId = enemyId;
                }
            }

            // 2. CAMBIO DE ESTADO EN EL COMPONENTE AI
            if (closestEnemyId) {
                ai.state = 'COMBAT';
                ai.targetId = closestEnemyId;
            } else {
                ai.state = 'FORMATION';
                ai.targetId = null;
            }

            // 3. LÓGICA DE ACCIÓN BASADA EN EL ESTADO
            if (ai.state === 'COMBAT') {
                this.handleCombat(allyId, deltaTime);
            }
            // Si está en estado 'FORMATION', no hace nada. Deja que el FormationMovementSystem trabaje.
        }
    }

    handleCombat(allyId, deltaTime) {
        const ai = this.entityManager.getComponent(allyId, AIComponent);
        const transform = this.entityManager.getComponent(allyId, TransformComponent);
        const weapon = this.entityManager.getComponent(allyId, WeaponComponent);

        if (!ai.targetId) return;
        
        const targetTransform = this.entityManager.getComponent(ai.targetId, TransformComponent);
        if (!targetTransform) {
            ai.state = 'FORMATION'; // El objetivo ya no existe
            ai.targetId = null;
            return;
        }

        // Calcular si estamos apuntando hacia el objetivo (para decidir si disparar)
        const dx = targetTransform.position.x - transform.position.x;
        const dy = targetTransform.position.y - transform.position.y;
        const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
        const angleDiff = this.normalizeAngle(targetAngle - transform.angle);
        
        // Disparar si podemos y estamos apuntando relativamente bien
        // (El apuntado lo maneja AllyAimingSystem, aquí solo decidimos si disparar)
        if (weapon.fireCooldown <= 0 && Math.abs(angleDiff) < 0.3) { // ~17 grados de tolerancia
            this.eventBus.publish('weapon:fire', {
                ownerId: allyId,
                ownerGroup: 'ally',
                position: { ...transform.position },
                angle: transform.angle,
                projectileTypeId: weapon.projectileTypeId
            });
            weapon.fireCooldown = weapon.fireRate;
        }
    }
    
    /**
     * Normaliza un ángulo al rango [-PI, PI]
     */
    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
} 