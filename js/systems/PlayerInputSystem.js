import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';

export default class PlayerInputSystem extends System {
    constructor(entityManager, eventBus, keyboardState) {
        super(entityManager, eventBus);
        this.keyboardState = keyboardState;
    }

    update(deltaTime) {
        const entities = this.entityManager.getEntitiesWith(PlayerControlledComponent, TransformComponent);
        for (const entityId of entities) {
            const transform = this.entityManager.getComponent(entityId, TransformComponent);

            // Lógica de movimiento (similar a PlayerShip.processInput)
            let forceX = 0;
            let forceY = 0;

            if (this.keyboardState['KeyW'] || this.keyboardState['ArrowUp']) {
                forceY -= CONFIG.PLAYER.ACCELERATION;
            }
            if (this.keyboardState['KeyS'] || this.keyboardState['ArrowDown']) {
                forceY += CONFIG.PLAYER.ACCELERATION * 0.5;
            }
            // La rotación se gestionará en otro sistema (AimSystem)

            // Aplicar fuerza basada en el ángulo actual
            transform.acceleration.x += Math.sin(transform.angle) * forceY;
            transform.acceleration.y += -Math.cos(transform.angle) * forceY;
        }
    }
} 