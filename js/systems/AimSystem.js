import System from './System.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import TransformComponent from '../components/TransformComponent.js';

export default class AimSystem extends System {
    constructor(entityManager, eventBus, mousePosition, mouseAimActive) {
        super(entityManager, eventBus);
        this.mousePosition = mousePosition;
        this.mouseAimActive = mouseAimActive;
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        if (entities.length === 0) return;

        const playerId = entities[0];
        const transform = this.entityManager.getComponent(playerId, TransformComponent);

        let targetAngle = 0;
        
        if (this.mouseAimActive) {
            // APUNTADO CON RATÓN
            targetAngle = Math.atan2(
                this.mousePosition.x - transform.position.x, 
                -(this.mousePosition.y - transform.position.y)
            );
        } else {
            // ALINEACIÓN CON VELOCIDAD
            const speed = Math.sqrt(transform.velocity.x**2 + transform.velocity.y**2);
            if (speed > 5) { // Umbral para evitar giros locos
                targetAngle = Math.atan2(transform.velocity.x, -transform.velocity.y);
            } else {
                targetAngle = transform.angle; // Mantener ángulo si está quieto
            }
        }

        // Interpolación suave del ángulo (usando deltaTime como en el código original)
        let angleDiff = targetAngle - transform.angle;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        transform.angle += angleDiff * CONFIG.PLAYER.AIM_SMOOTHING_FACTOR * deltaTime * 60;
    }
} 