import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';

export default class FormationMovementSystem extends System {
    update(deltaTime) {
        // Ya no necesitamos el AIComponent - el movimiento de formación siempre está activo
        const followers = this.entityManager.getEntitiesWith(
            TransformComponent, 
            FormationFollowerComponent, 
            PhysicsComponent
        );
        
        for (const entityId of followers) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const follower = this.entityManager.getComponent(entityId, FormationFollowerComponent);
            const physics = this.entityManager.getComponent(entityId, PhysicsComponent);
            
            const leaderTransform = this.entityManager.getComponent(follower.leaderId, TransformComponent);
            if (!leaderTransform) continue;

            const targetX = leaderTransform.position.x + follower.targetOffset.x;
            const targetY = leaderTransform.position.y + follower.targetOffset.y;
            
            // 1. Calcular la velocidad deseada para llegar al objetivo
            const desiredVelX = targetX - transform.position.x;
            const desiredVelY = targetY - transform.position.y;
            
            // 2. Calcular la "fuerza de viraje" necesaria para corregir la velocidad actual
            const steerX = desiredVelX - transform.velocity.x;
            const steerY = desiredVelY - transform.velocity.y;
            
            // 3. Limitar esta fuerza y aplicarla con suavizado
            let steerMagnitude = Math.sqrt(steerX * steerX + steerY * steerY);
            if (steerMagnitude > 0) {
                const steerNormX = steerX / steerMagnitude;
                const steerNormY = steerY / steerMagnitude;

                // Aplicamos una fuerza limitada y suavizada
                const maxForce = CONFIG.FORMATION.BEHAVIOR.MAX_CORRECTION_FORCE * deltaTime;
                const steeringForce = Math.min(steerMagnitude, maxForce);

                transform.acceleration.x += steerNormX * steeringForce;
                transform.acceleration.y += steerNormY * steeringForce;
            }
        }
    }
} 