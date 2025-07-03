import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import AIComponent from '../components/AIComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';
import HealthComponent from '../components/HealthComponent.js';

export default class AllyCombatAISystem extends System {
    update(deltaTime) {
        const allies = this.entityManager.getEntitiesWith(AllyComponent, AIComponent, TransformComponent);
        if (allies.length === 0) return;
        
        // Obtenemos todos los enemigos una sola vez para optimizar
        const allEnemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent, HealthComponent);
        if (allEnemies.length === 0) {
             // Si no hay enemigos, nos aseguramos de que ningún aliado tenga un objetivo
            for (const allyId of allies) {
                this.entityManager.getComponent(allyId, AIComponent).targetId = null;
            }
            return;
        }

        for (const allyId of allies) {
            const ai = this.entityManager.getComponent(allyId, AIComponent);
            const transform = this.entityManager.getComponent(allyId, TransformComponent);
            const allyComp = this.entityManager.getComponent(allyId, AllyComponent);
            const allyConfig = CONFIG.ALLY[allyComp.type.toUpperCase()];
            const preference = allyConfig.AI.TARGETING_PREFERENCE;

            // 1. Filtramos los enemigos que están dentro del rango de esta nave
            const enemiesInRange = allEnemies.filter(enemyId => {
                const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
                return Math.hypot(transform.position.x - enemyTransform.position.x, transform.position.y - enemyTransform.position.y) <= ai.targetingRange;
            });

            if (enemiesInRange.length === 0) {
                ai.targetId = null;
                continue; // No hay enemigos en rango, pasamos al siguiente aliado
            }

            // 2. Ordenamos a los enemigos en rango según la preferencia de la nave
            enemiesInRange.sort((a, b) => {
                const healthA = this.entityManager.getComponent(a, HealthComponent).hp;
                const healthB = this.entityManager.getComponent(b, HealthComponent).hp;

                if (preference === 'LOWEST_HP') {
                    return healthA - healthB; // Orden ascendente de vida
                } else if (preference === 'HIGHEST_HP') {
                    return healthB - healthA; // Orden descendente de vida
                }
                // Podríamos añadir más preferencias aquí, como 'NEAREST'
                return 0;
            });

            // 3. El mejor objetivo es el primer elemento de la lista ordenada
            ai.targetId = enemiesInRange[0];
        }
    }
} 