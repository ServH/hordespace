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
        
        if (aliveEnemies.length === 0) return;

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

            // Buscar el enemigo más cercano
            let closestEnemyId = null;
            let minDistance = ai.targetingRange;
            
            for (const enemyId of aliveEnemies) {
                const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
                const dx = transform.position.x - enemyTransform.position.x;
                const dy = transform.position.y - enemyTransform.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestEnemyId = enemyId;
                }
            }

            ai.targetId = closestEnemyId;

            // Si tenemos un objetivo, apuntar y disparar
            if (ai.targetId) {
                const targetTransform = this.entityManager.getComponent(ai.targetId, TransformComponent);
                
                // Calcular ángulo hacia el objetivo
                const dx = targetTransform.position.x - transform.position.x;
                const dy = targetTransform.position.y - transform.position.y;
                const targetAngle = Math.atan2(dy, dx) + Math.PI / 2; // +PI/2 porque 0° apunta hacia arriba
                
                // Rotar suavemente hacia el objetivo
                const angleDiff = this.normalizeAngle(targetAngle - transform.angle);
                const rotationSpeed = ai.rotationSpeed * deltaTime;
                
                if (Math.abs(angleDiff) > rotationSpeed) {
                    // Rotar gradualmente
                    transform.angle += Math.sign(angleDiff) * rotationSpeed;
                } else {
                    // Ya estamos apuntando correctamente
                    transform.angle = targetAngle;
                }
                
                // Normalizar el ángulo
                transform.angle = this.normalizeAngle(transform.angle);
                
                // Disparar si podemos y estamos apuntando relativamente bien
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