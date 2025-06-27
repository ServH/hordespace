import System from './System.js';
import EnemyComponent from '../components/EnemyComponent.js';
import AIComponent from '../components/AIComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class EnemyAISystem extends System {
    update(deltaTime) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;

        const playerTransform = this.entityManager.getComponent(playerEntities[0], TransformComponent);

        const enemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent);
        for (const entityId of enemies) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            const dx = playerTransform.position.x - transform.position.x;
            const dy = playerTransform.position.y - transform.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // La IA siempre aplica fuerza para acercarse. La física se encargará del resto.
            // Esto evita el bug de que se "congelen" al estar demasiado cerca.
            if (distance > 0) {
                const directionX = dx / distance;
                const directionY = dy / distance;
                const acceleration = CONFIG.ENEMY.DEFAULT.ACCELERATION;
                transform.acceleration.x += directionX * acceleration;
                transform.acceleration.y += directionY * acceleration;
            }
        }
    }
} 