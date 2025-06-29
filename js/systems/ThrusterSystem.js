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
        // Calcular la posición del propulsor en el mundo
        const angle = transform.angle;
        const offsetX = thruster.offset.x;
        const offsetY = thruster.offset.y;
        
        // Rotar el offset según el ángulo de la nave
        const worldOffsetX = offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
        const worldOffsetY = offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
        
        const worldX = transform.position.x + worldOffsetX;
        const worldY = transform.position.y + worldOffsetY;

        // Añadir el nuevo punto al principio del array (más reciente)
        trail.points.unshift({ x: worldX, y: worldY });

        // Mantener el array dentro del límite máximo
        if (trail.points.length > trail.config.maxLength) {
            trail.points.pop(); // Eliminar el punto más antiguo
        }
    }
} 