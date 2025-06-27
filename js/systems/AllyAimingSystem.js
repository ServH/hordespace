import System from './System.js';
import AllyComponent from '../components/AllyComponent.js';
import AIComponent from '../components/AIComponent.js';
import TransformComponent from '../components/TransformComponent.js';
import FormationFollowerComponent from '../components/FormationFollowerComponent.js';

export default class AllyAimingSystem extends System {
    update(deltaTime) {
        const allies = this.entityManager.getEntitiesWith(
            AllyComponent, 
            TransformComponent, 
            AIComponent, 
            FormationFollowerComponent
        );

        for (const entityId of allies) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);
            const ai = this.entityManager.getComponent(entityId, AIComponent);
            const follower = this.entityManager.getComponent(entityId, FormationFollowerComponent);
            const leaderTransform = this.entityManager.getComponent(follower.leaderId, TransformComponent);

            let targetAngle = transform.angle;

            if (ai.state === 'COMBAT' && ai.targetId) {
                // MODO COMBATE: Apuntar al enemigo
                const targetTransform = this.entityManager.getComponent(ai.targetId, TransformComponent);
                if (targetTransform) {
                    targetAngle = Math.atan2(
                        targetTransform.position.y - transform.position.y, 
                        targetTransform.position.x - transform.position.x
                    ) + Math.PI / 2;
                }
            } else if (leaderTransform) {
                // MODO FORMACIÓN: Sincronizar con la rotación del líder
                targetAngle = leaderTransform.angle;
            }

            // Interpolación suave del ángulo
            let angleDiff = targetAngle - transform.angle;
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            // Usamos la velocidad de rotación del CONFIG
            const rotationSpeed = CONFIG.ALLY.DEFAULT.ROTATION_SPEED;
            transform.angle += angleDiff * rotationSpeed * deltaTime;
        }
    }
} 