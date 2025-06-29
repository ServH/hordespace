import System from './System.js';
import ThrusterComponent from '../components/ThrusterComponent.js';
import TrailComponent from '../components/TrailComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class ThrusterSystem extends System {
    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(ThrusterComponent, TrailComponent, TransformComponent);

        for (const entityId of entities) {
            const thruster = this.entityManager.getComponent(entityId, ThrusterComponent);
            const trail = this.entityManager.getComponent(entityId, TrailComponent);
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            
            // Solo emitir puntos si la nave se está moviendo
            const isMoving = Math.abs(transform.velocity.x) > 5 || Math.abs(transform.velocity.y) > 5;
            if (!isMoving) continue;
            
            thruster.emitCooldown -= deltaTime;

            if (thruster.emitCooldown <= 0) {
                thruster.emitCooldown = 1 / thruster.emitRate; // Resetear cooldown
                this.addTrailPoint(entityId, thruster, trail, transform);
            }
        }
    }

    addTrailPoint(entityId, thruster, trail, transform) {
        // MODIFICACIÓN: Iteramos sobre CADA offset del propulsor
        thruster.offsets.forEach((offset, index) => {
            // Calculamos la posición del mundo para este offset específico
            const angle = transform.angle;
            const worldOffsetX = offset.x * Math.cos(angle) - offset.y * Math.sin(angle);
            const worldOffsetY = offset.x * Math.sin(angle) + offset.y * Math.cos(angle);
            const worldPosX = transform.position.x + worldOffsetX;
            const worldPosY = transform.position.y + worldOffsetY;

            // Añadimos el punto al array de estela correcto
            if (trail.trails[index]) {
                trail.trails[index].unshift({ x: worldPosX, y: worldPosY });

                // Limitamos la longitud de ESTA estela específica
                if (trail.trails[index].length > trail.config.maxLength) {
                    trail.trails[index].pop();
                }
            }
        });
    }
} 