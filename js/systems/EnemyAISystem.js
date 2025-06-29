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
            
            // --- LÓGICA DE MOVIMIENTO (SIN CAMBIOS) ---
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

            // --- NUEVA LÓGICA DE ROTACIÓN BASADA EN VELOCIDAD ---
            
            // 1. Solo rotamos si la nave se está moviendo
            const speed = Math.hypot(transform.velocity.x, transform.velocity.y);
            if (speed > 1) { // Umbral pequeño para evitar giros erráticos al estar parado
                
                // 2. Calculamos el ángulo objetivo basado en la dirección de la velocidad
                // Sumamos Math.PI / 2 porque en nuestro sistema, un ángulo de 0 es "hacia arriba"
                const targetAngle = Math.atan2(transform.velocity.y, transform.velocity.x) + Math.PI / 2;
                
                // 3. Interpolamos suavemente hacia el ángulo objetivo
                // (Misma lógica de interpolación que usamos para jugador y aliados)
                let angleDiff = targetAngle - transform.angle;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                
                const rotationSpeed = CONFIG.ENEMY.DEFAULT.ROTATION_SPEED;
                transform.angle += angleDiff * rotationSpeed * deltaTime;
            }
        }
    }
} 