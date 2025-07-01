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

        // Obtenemos los parámetros de la configuración una sola vez para eficiencia
        const enemyConfig = CONFIG.ENEMY.DEFAULT;
        const separationRadius = enemyConfig.SEPARATION_RADIUS;
        const separationForceMultiplier = enemyConfig.SEPARATION_FORCE;

        for (const entityId of enemies) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            if (!transform) continue;

            // --- FUERZA 1: MOVERSE HACIA EL JUGADOR (Lógica existente mejorada) ---
            const dx = playerTransform.position.x - transform.position.x;
            const dy = playerTransform.position.y - transform.position.y;
            const distanceToPlayer = Math.hypot(dx, dy);
            
            let seekForceX = 0;
            let seekForceY = 0;
            if (distanceToPlayer > 0) {
                seekForceX = (dx / distanceToPlayer);
                seekForceY = (dy / distanceToPlayer);
            }

            // --- FUERZA 2: SEPARARSE DE OTROS ENEMIGOS (Nueva lógica de enjambre) ---
            let separationForceX = 0;
            let separationForceY = 0;
            let neighborsCount = 0;

            // Usamos la rejilla espacial para una búsqueda de vecinos MUY eficiente
            const nearbyEntities = this.entityManager.spatialGrid.query(
                transform.position.x - separationRadius,
                transform.position.y - separationRadius,
                separationRadius * 2,
                separationRadius * 2
            );

            for (const otherId of nearbyEntities) {
                if (entityId === otherId) continue; // No compararse consigo mismo

                // Nos aseguramos de que el vecino es otro enemigo
                if (this.entityManager.hasComponent(otherId, EnemyComponent)) {
                    const otherTransform = this.entityManager.getComponent(otherId, TransformComponent);
                    if (!otherTransform) continue;

                    const distanceToNeighbor = Math.hypot(
                        transform.position.x - otherTransform.position.x,
                        transform.position.y - otherTransform.position.y
                    );

                    if (distanceToNeighbor > 0 && distanceToNeighbor < separationRadius) {
                        // Calcular un vector que apunta LEJOS del vecino
                        // Su fuerza es inversamente proporcional a la distancia (más cerca = más fuerte)
                        const pushFactor = 1 - (distanceToNeighbor / separationRadius);
                        separationForceX += (transform.position.x - otherTransform.position.x) / distanceToNeighbor * pushFactor;
                        separationForceY += (transform.position.y - otherTransform.position.y) / distanceToNeighbor * pushFactor;
                        neighborsCount++;
                    }
                }
            }
            
            if (neighborsCount > 0) {
                // Promediamos la fuerza de separación para un movimiento más suave
                separationForceX /= neighborsCount;
                separationForceY /= neighborsCount;
            }

            // --- COMBINAR FUERZAS Y APLICAR ---
            const acceleration = enemyConfig.ACCELERATION;

            // La fuerza de atracción hacia el jugador es la principal.
            // La fuerza de separación es un modificador que evita el apilamiento.
            const totalForceX = seekForceX + (separationForceX * separationForceMultiplier);
            const totalForceY = seekForceY + (separationForceY * separationForceMultiplier);
            
            // Normalizamos el vector final para no moverse más rápido de lo debido
            const totalMagnitude = Math.hypot(totalForceX, totalForceY);
            if (totalMagnitude > 0) {
                transform.acceleration.x += (totalForceX / totalMagnitude) * acceleration;
                transform.acceleration.y += (totalForceY / totalMagnitude) * acceleration;
            }
            
            // --- LÓGICA DE ROTACIÓN BASADA EN VELOCIDAD (Sin cambios) ---
            const speed = Math.hypot(transform.velocity.x, transform.velocity.y);
            if (speed > 1) { 
                const targetAngle = Math.atan2(transform.velocity.y, transform.velocity.x) + Math.PI / 2;
                let angleDiff = targetAngle - transform.angle;
                while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
                while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
                transform.angle += angleDiff * enemyConfig.ROTATION_SPEED * deltaTime;
            }
        }
    }
} 