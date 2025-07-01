import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import EnemyComponent from '../components/EnemyComponent.js';

export default class AutoAimSystem extends System {
    constructor(entityManager, eventBus, game) {
        super(entityManager, eventBus);
        this.game = game; // Referencia a la instancia de Game para leer el aimMode
    }

    update(deltaTime) {
        // Este sistema SOLO actúa si el modo es 'AUTO'
        if (this.game.aimMode !== 'AUTO') return;

        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (playerEntities.length === 0) return;
        
        const playerId = playerEntities[0];
        const playerTransform = this.entityManager.getComponent(playerId, TransformComponent);

        // Lógica para encontrar el enemigo más cercano dentro del rango
        let closestEnemy = null;
        let minDistance = CONFIG.PLAYER.ABILITIES.AUTO_AIM_RANGE; // Usar rango de configuración en lugar de Infinity
        const enemies = this.entityManager.getEntitiesWith(EnemyComponent, TransformComponent);

        for (const enemyId of enemies) {
            const enemyTransform = this.entityManager.getComponent(enemyId, TransformComponent);
            const distance = Math.hypot(playerTransform.position.x - enemyTransform.position.x, playerTransform.position.y - enemyTransform.position.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemyTransform;
            }
        }

        // Si hay un enemigo, apuntar suavemente hacia él
        if (closestEnemy) {
            // FÓRMULA CORREGIDA: atan2(dx, -dy) para alinearse con la orientación de la nave
            const dx = closestEnemy.position.x - playerTransform.position.x;
            const dy = closestEnemy.position.y - playerTransform.position.y;
            const targetAngle = Math.atan2(dx, -dy); // <-- ¡ESTA ES LA FÓRMULA CORRECTA!
            
            // El resto de la lógica de interpolación suave se queda igual
            let angleDiff = targetAngle - playerTransform.angle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            const rotationSpeed = CONFIG.PLAYER.AUTO_AIM_ROTATION_SPEED;
            playerTransform.angle += angleDiff * rotationSpeed * deltaTime;
        }
    }
} 