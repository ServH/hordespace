import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';
import PhysicsComponent from '../components/PhysicsComponent.js';

export default class FormationMovementSystem extends System {
    update(deltaTime) {
        const followers = this.entityManager.getEntitiesWith(
            TransformComponent, 
            FormationFollowerComponent, 
            PhysicsComponent
        );
        
        for (const entityId of followers) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const follower = this.entityManager.getComponent(entityId, FormationFollowerComponent);
            const physics = this.entityManager.getComponent(entityId, PhysicsComponent);
            
            // Obtener la transformación del líder
            const leaderTransform = this.entityManager.getComponent(follower.leaderId, TransformComponent);
            if (!leaderTransform) continue; // Si el líder no existe, no hacer nada
            
            // Calcular posición objetivo
            const targetX = leaderTransform.position.x + follower.targetOffset.x;
            const targetY = leaderTransform.position.y + follower.targetOffset.y;
            
            // Vector hacia el objetivo
            const dirX = targetX - transform.position.x;
            const dirY = targetY - transform.position.y;
            const distance = Math.sqrt(dirX * dirX + dirY * dirY);
            
            // Solo aplicar fuerza si estamos lejos del objetivo
            if (distance > follower.correctionThreshold) {
                // Calcular fuerza proporcional a la distancia
                let force = distance * follower.followStrength;
                
                // Limitar la fuerza máxima
                force = Math.min(force, follower.maxCorrectionForce);
                
                // Normalizar dirección y aplicar fuerza
                if (distance > 0) {
                    transform.acceleration.x += (dirX / distance) * force;
                    transform.acceleration.y += (dirY / distance) * force;
                }
            }
        }
    }
} 