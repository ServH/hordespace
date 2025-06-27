import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import AIComponent from '../components/AIComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';

export default class AllyCombatAISystem extends System {
    update(deltaTime) {
        // Obtener todos los enemigos vivos
        const enemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent);
        
        // Procesar cada nave aliada - solo necesitamos AI y Transform
        const allies = this.entityManager.getEntitiesWith(AllyComponent, AIComponent, TransformComponent);
        
        for (const allyId of allies) {
            const ai = this.entityManager.getComponent(allyId, AIComponent);
            const transform = this.entityManager.getComponent(allyId, TransformComponent);

            // 1. Encontrar el enemigo más cercano
            let closestEnemyId = null;
            let minDistance = ai.targetingRange;

            for (const enemyId of enemies) {
                const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
                if (!enemyTransform) continue;
                
                const distance = Math.hypot(transform.position.x - enemyTransform.position.x, transform.position.y - enemyTransform.position.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestEnemyId = enemyId;
                }
            }
            
            // 2. Actualizar el objetivo en el componente. ESO ES TODO.
            ai.targetId = closestEnemyId;
        }
    }


} 